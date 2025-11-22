//appbora/src/app/api/pagamentos/webhook/route.ts
import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { getFirebaseFirestore } from '@/app/lib/firebase-admin'
import { Timestamp } from 'firebase-admin/firestore'
import { ISubscription, SubscriptionStatus } from '@/interfaces/IBoraPayment'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY_DEV!, {
    apiVersion: '2025-09-30.clover',
})

const db = getFirebaseFirestore()

/**
 * Salva ou Atualiza a assinatura no Firestore
 * Esta função centraliza toda a lógica para evitar duplicação e erros.
 */
async function manageSubscriptionStatusChange(
    subscriptionId: string,
    customerId: string
) {
    // 1. Busca dados atualizados da Stripe
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    console.log(">>> DADOS VINDOS DA STRIPE:", {
        id: subscription.id,
        status: subscription.status,
        cancel_at_period_end: subscription.cancel_at_period_end,
        canceled_at: subscription.canceled_at
    })

    // 2. Descobre quem é o usuário no Firebase
    let firebaseUserId: string | null = null

    // Tenta pegar pelo metadata
    if (subscription.metadata?.firebaseUserId) {
        firebaseUserId = subscription.metadata.firebaseUserId
    }
    // Se não tiver metadata, busca no banco quem tem esse customerId
    else {
        const usersSnap = await db.collection('users').where('stripeCustomerId', '==', customerId).limit(1).get()
        if (!usersSnap.empty) {
            firebaseUserId = usersSnap.docs[0].id
        }
    }

    if (!firebaseUserId) {
        console.error(`❌ Usuário não encontrado para Customer ID: ${customerId}`)
        return
    }

    // 3. Prepara os dados
    // CORREÇÃO DO ERRO: Usar 'null' em vez de 'undefined' para o Firestore
    const subscriptionData: ISubscription = {
        userId: firebaseUserId,
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscription.id,
        stripePriceId: subscription.items.data[0].price.id,
        status: subscription.status as SubscriptionStatus,

        // Datas importantes
        currentPeriodStart: Timestamp.fromMillis(subscription.items.data[0].current_period_start * 1000),
        currentPeriodEnd: Timestamp.fromMillis(subscription.items.data[0].current_period_end * 1000),
        createdAt: Timestamp.fromMillis(subscription.created * 1000),

        // Campos de Cancelamento e Término
        cancelAtPeriodEnd: subscription.cancel_at_period_end, 

        // O Firestore exige NULL se não houver valor, undefined causa crash
        canceledAt: subscription.canceled_at ? Timestamp.fromMillis(subscription.canceled_at * 1000) : null,
        endedAt: subscription.ended_at ? Timestamp.fromMillis(subscription.ended_at * 1000) : null,
    }

    // 4. Salva no Firestore
    await db.collection('subscriptions').doc(firebaseUserId).set(subscriptionData, { merge: true })

    console.log(`✅ Assinatura sincronizada para ${firebaseUserId}. Status: ${subscription.status}. Cancela no fim? ${subscription.cancel_at_period_end}`)
}

export async function POST(request: Request) {
    console.log("--- Webhook Recebido ---")
    try {
        const body = await request.text()
        const signature = (await headers()).get('stripe-signature') as string
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET_DEV

        if (!webhookSecret) return new NextResponse('Sem Segredo do Webhook', { status: 500 })

        let event: Stripe.Event
        try {
            event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
        } catch (err: any) {
            console.error(`❌ Assinatura Inválida: ${err.message}`)
            return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 })
        }

        const session = event.data.object as Stripe.Checkout.Session
        const subscription = event.data.object as Stripe.Subscription

        switch (event.type) {
            case 'checkout.session.completed':
                // Salva o Customer ID no usuário para referência futura
                if (session.metadata?.firebaseUserId && session.customer) {
                    await db.collection('users').doc(session.metadata.firebaseUserId).set(
                        { stripeCustomerId: session.customer as string },
                        { merge: true }
                    )
                }
                // Garante que a assinatura seja criada imediatamente
                if (session.subscription) {
                    await manageSubscriptionStatusChange(session.subscription as string, session.customer as string)
                }
                break

            // Todos esses eventos usam a MESMA lógica centralizada
            case 'customer.subscription.created':
            case 'customer.subscription.updated':
            case 'customer.subscription.deleted':
                await manageSubscriptionStatusChange(subscription.id, subscription.customer as string)
                break

            default:
                console.log(`-> Evento ignorado: ${event.type}`)
        }

        return new NextResponse(null, { status: 200 })

    } catch (error) {
        console.error("❌ ERRO NO WEBHOOK:", error)
        return new NextResponse('Erro interno', { status: 500 })
    }
}