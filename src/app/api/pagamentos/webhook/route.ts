//bora-app/src/app/api/pagamentos/webhook/route.ts
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
 * Lida com a criação ou atualização de uma assinatura no Firestore
 * @param session - O objeto da sessão de checkout da Stripe
 */
async function handleSubscriptionCreated(session: Stripe.Checkout.Session) {
    const firebaseUserId = session.metadata?.firebaseUserId
    if (!firebaseUserId) { throw new Error('Erro: firebaseUserId não encontrado nos metadados da sessão')}

    // Busca os detalhes completos da assinatura
    const subscription = await stripe.subscriptions.retrieve(session.subscription as string)

    const subscriptionData: ISubscription = {
        userId: firebaseUserId,
        stripeCustomerId: subscription.customer as string,
        stripeSubscriptionId: subscription.id,
        stripePriceId: subscription.items.data[0].price.id,
        status: subscription.status as SubscriptionStatus,
        currentPeriodStart: Timestamp.fromMillis(subscription.items.data[0].current_period_start * 1000),
        currentPeriodEnd: Timestamp.fromMillis(subscription.items.data[0].current_period_end * 1000),
        createdAt: Timestamp.now(),
    }

    // Salva os dados no Firestore, usando o userId como ID do documento
    const subscriptionDocRef = db.collection('subscriptions').doc(firebaseUserId)
    await subscriptionDocRef.set(subscriptionData)
    console.log(`✅ Assinatura salva no Firestore para o usuário: ${firebaseUserId}`)
}

/**
 * Lida com a atualização do status de uma assinatura no Firestore
 * @param subscription - O objeto da assinatura da Stripe
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    const firebaseUserId = (await db.collection('subscriptions')
        .where('stripeSubscriptionId', '==', subscription.id)
        .limit(1)
        .get()).docs[0]?.data().userId

    if (!firebaseUserId) {
        // Se não acharmos por ID da assinatura, tentamos pelo ID do cliente
        // Isso pode ser útil em cenários mais complexos
        const userSnapshot = await db.collection('users')
            .where('stripeCustomerId', '==', subscription.customer)
            .limit(1)
            .get()

        if (userSnapshot.empty) {
            throw new Error(`Usuário não encontrado para stripeSubscriptionId: ${subscription.id}`)
        }
        const foundUserId = userSnapshot.docs[0].id
        // Agora podemos atualizar o documento de assinatura correto
        const subscriptionDocRef = db.collection('subscriptions').doc(foundUserId)
        const updatePayload = {
            status: subscription.status as SubscriptionStatus,
            currentPeriodStart: Timestamp.fromMillis(subscription.items.data[0].current_period_start * 1000),
            currentPeriodEnd: Timestamp.fromMillis(subscription.items.data[0].current_period_end * 1000),
            canceledAt: subscription.canceled_at ? Timestamp.fromMillis(subscription.canceled_at * 1000) : null,
            endedAt: subscription.ended_at ? Timestamp.fromMillis(subscription.ended_at * 1000) : null,
        }
        await subscriptionDocRef.update(updatePayload)

    } else {
        const subscriptionDocRef = db.collection('subscriptions').doc(firebaseUserId)
        const updatePayload = {
            status: subscription.status as SubscriptionStatus,
            currentPeriodStart: Timestamp.fromMillis(subscription.items.data[0].current_period_start * 1000),
            currentPeriodEnd: Timestamp.fromMillis(subscription.items.data[0].current_period_end * 1000),
            canceledAt: subscription.canceled_at ? Timestamp.fromMillis(subscription.canceled_at * 1000) : null,
            endedAt: subscription.ended_at ? Timestamp.fromMillis(subscription.ended_at * 1000) : null,
        }
        await subscriptionDocRef.update(updatePayload)
    }

    console.log(`✅ Assinatura atualizada no Firestore para o usuário: ${firebaseUserId}`)
}

export async function POST(request: Request) {
    console.log("--- Webhook Recebido ---")
    try {
        const body = await request.text()
        const signature = (await headers()).get('stripe-signature') as string
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET_DEV

        if (!webhookSecret) {
            console.error("❌ Segredo do Webhook não configurado.")
            return new NextResponse('Segredo do Webhook não configurado', { status: 500 })
        }

        console.log("1. Verificando assinatura da Stripe...")
        let event: Stripe.Event
        try {
            event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
        } catch (err: any) {
            console.error(`❌ Erro na verificação da assinatura: ${err.message}`)
            return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 })
        }
        console.log(`2. Evento recebido e verificado: ${event.type}`)

        // Lidar com os eventos específicos
        switch (event.type) {
            case 'checkout.session.completed':
                console.log("3. Processando 'checkout.session.completed'...")
                await handleSubscriptionCreated(event.data.object as Stripe.Checkout.Session)
                break
            case 'customer.subscription.updated':
            case 'customer.subscription.deleted':
                console.log(`3. Processando '${event.type}'...`)
                await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
                break
            case 'customer.deleted':
                console.log("3. Processando 'Customer Deletado!'...")
                break
            default:
                console.log(`-> Evento não tratado: ${event.type}`)
        }

        console.log("4. Processamento do webhook concluído com sucesso.")
        return new NextResponse(null, { status: 200 })

    } catch (error) {
        // Este catch pegará qualquer erro que acontecer nas funções 'handle'
        console.error("❌ ERRO CRÍTICO NO PROCESSAMENTO DO WEBHOOK:", error)
        return new NextResponse('Erro interno ao processar o webhook', { status: 500 })
    }
}