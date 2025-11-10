//bora-app/src/app/api/cron/notificar-usuarios-gratuitos/route.ts
import { NextResponse } from 'next/server'
import { sendNotification } from '@/app/actions/actions'
import { getFirebaseFirestore } from '@/app/lib/firebase-admin'
import { Timestamp } from 'firebase-admin/firestore'

const db = getFirebaseFirestore()

export async function POST(request: Request) {
    // 1. Proteger a API
    const { searchParams } = new URL(request.url)
    const secret = searchParams.get('secret')

    if (secret !== process.env.CRON_SECRET) {
        return new NextResponse('Unauthorized', { status: 401 })
    }

    // 2. Lógica para encontrar os usuários elegíveis
    try {
        const today = new Date()
        const yesterdayStart = Timestamp.fromDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1))
        const yesterdayEnd = Timestamp.fromDate(new Date(today.getFullYear(), today.getMonth(), today.getDate()))

        const usersWhoUsedQuota = await db.collection('users')
            .where('lastFreeReminderAt', '>=', yesterdayStart)
            .where('lastFreeReminderAt', '<', yesterdayEnd)
            .get()

        if (usersWhoUsedQuota.empty) {
            return NextResponse.json({ message: 'Nenhum usuário para notificar.' })
        }

        let notificationsSent = 0
        for (const userDoc of usersWhoUsedQuota.docs) {
            const userId = userDoc.id
            const subscriptionDoc = await db.collection('subscriptions').doc(userId).get()

            // Pula se o usuário for assinante Plus
            if (subscriptionDoc.exists && subscriptionDoc.data()?.status === 'active') {
                continue
            }

            // Envia a notificação push usando a Server Action que você já tem
            const userName = userDoc.data()?.name?.split(' ')[0] || 'Ei'
            const message = `Ei, ${userName}! ✨ Seu lembrete diário gratuito já está disponível novamente.`

            await sendNotification(message, userId)
            notificationsSent++
        }

        return NextResponse.json({ message: `Notificações push enviadas para ${notificationsSent} usuários.` })

    } catch (error) {
        console.error("Erro no cron job de notificação push:", error)
        return new NextResponse('Erro interno do servidor', { status: 500 })
    }
}