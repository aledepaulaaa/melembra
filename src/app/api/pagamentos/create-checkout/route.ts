//bora-app/src/app/api/pagamentos/create-checkout/route.ts
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getFirebaseFirestore } from '@/app/lib/firebase-admin'

// A exclamação (!) garante ao TypeScript que a variável de ambiente não será nula
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-09-30.clover',
})

const db = getFirebaseFirestore()

// Função para encontrar um customer na Stripe ou criar um novo
async function findOrCreateStripeCustomer(userId: string): Promise<string> {
    // Referência ao documento do usuário no Firestore (assumindo uma coleção 'users')
    const userDocRef = db.collection('users').doc(userId)
    const userDoc = await userDocRef.get()
    const userData = userDoc.data()

    // 1. Se o usuário já tiver um stripeCustomerId, retorna ele
    if (userData?.stripeCustomerId) {
        return userData.stripeCustomerId
    }

    // 2. Se não, cria um novo cliente na Stripe
    const customer = await stripe.customers.create({
        // Opcional: Adicione o email se você já o tiver
        // email: user.email, 
        metadata: {
            firebaseUserId: userId,
        },
    })

    // 3. Salva o novo ID no documento do usuário no Firestore
    await userDocRef.set({ stripeCustomerId: customer.id }, { merge: true })

    return customer.id
}


export async function POST(request: Request) {
    try {
        const { userId, priceId  } = await request.json()

        if (!userId) {
            return new NextResponse('UserID do usuário é obrigatório', { status: 400 })
        }

         if (!priceId) {
            return new NextResponse('Price ID do plano é obrigatório', { status: 400 })
        }

        // Obtém o ID do cliente da Stripe (cria se não existir)
        const stripeCustomerId = await findOrCreateStripeCustomer(userId)
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

        // Cria a sessão de Checkout na Stripe
        const session = await stripe.checkout.sessions.create({
            // O ID do cliente que está comprando
            customer: stripeCustomerId,
            mode: 'subscription',
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            
            // Tipos de pagamento que você aceita (pode adicionar 'boleto' etc)
            // Muitos são ativados diretamente no dashboard da Stripe
            payment_method_types: ['card'],
            success_url: `${baseUrl}/lembretes?payment=success&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${baseUrl}/planos?payment=canceled`,
            // **MUITO IMPORTANTE**: Metadados para identificar o usuário no webhook
            metadata: {
                firebaseUserId: userId,
            },
        })

        // Retorna a URL da sessão de checkout para o frontend
        return NextResponse.json({ url: session.url })

    } catch (error) {
        console.error('Erro ao criar sessão de checkout:', error)
        if (error instanceof Error) {
            return new NextResponse(error.message, { status: 500 })
        }
        return new NextResponse('Ocorreu um erro interno', { status: 500 })
    }
}