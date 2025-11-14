// melemebra/src/app/api/pagamentos/manage-plan/route.ts (NOVO ARQUIVO)
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getFirebaseFirestore } from '@/app/lib/firebase-admin'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY_DEV!, {
    apiVersion: '2025-09-30.clover',
})

const db = getFirebaseFirestore()

export async function POST(request: Request) {
    try {
        const { userId } = await request.json()
        if (!userId) {
            return new NextResponse('Usuário não autenticado', { status: 401 })
        }

        // Busca o ID do cliente da Stripe no documento do usuário
        const userDocRef = db.collection('users').doc(userId)
        const userDoc = await userDocRef.get()
        const stripeCustomerId = userDoc.data()?.stripeCustomerId

        if (!stripeCustomerId) {
            return new NextResponse('ID de cliente da Stripe não encontrado', { status: 404 })
        }

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

        // Cria uma sessão do Portal de Faturamento
        const portalSession = await stripe.billingPortal.sessions.create({
            customer: stripeCustomerId,
            return_url: `${baseUrl}/perfil`, // Para onde o usuário volta após sair do portal
        })

        return NextResponse.json({ url: portalSession.url })

    } catch (error) {
        console.error('Erro ao criar sessão do portal do cliente:', error)
        return new NextResponse('Erro interno do servidor', { status: 500 })
    }
}