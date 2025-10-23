//melembra/src/app/api/cron/notificar-proximos-lembretes/route.ts
import { NextResponse } from 'next/server'
import { sendNotification } from '@/app/actions/actions'
import { getFirebaseFirestore } from '@/app/lib/firebase-admin'
import { Timestamp } from 'firebase-admin/firestore'

const db = getFirebaseFirestore()

export async function POST(request: Request) {
    const { searchParams } = new URL(request.url)
    if (searchParams.get('secret') !== process.env.CRON_SECRET) {
        return new NextResponse('Unauthorized', { status: 401 })
    }

    try {
        const now = Timestamp.now()
        // Procura por lembretes entre AGORA e daqui a 5 minutos
        const fiveMinutesFromNow = Timestamp.fromMillis(now.toMillis() + 5 * 60 * 1000)

        // Query para encontrar lembretes que estão no intervalo de 5 minutos
        const snapshot = await db.collection('reminders')
            .where('scheduledAt', '>', now)
            .where('scheduledAt', '<=', fiveMinutesFromNow)
            .where('preNotificationSent', '!=', true) // IMPORTANTE: Evita enviar a mesma notificação duas vezes
            .get()

        if (snapshot.empty) {
            return NextResponse.json({ message: 'Nenhum lembrete para notificar nos próximos 5 minutos.' })
        }

        let notificationsSent = 0
        for (const doc of snapshot.docs) {
            const reminder = doc.data()
            const message = `Seu lembrete "${reminder.title}" começa em 5 minutos.`

            await sendNotification(message, reminder.userId)

            // Marca o lembrete para não enviar este aviso novamente
            await doc.ref.update({ preNotificationSent: true })
            notificationsSent++
        }

        return NextResponse.json({ message: `${notificationsSent} notificações de aviso prévio enviadas.` })

    } catch (error) {
        console.error("Erro no cron job de aviso prévio:", error)
        return new NextResponse('Erro interno do servidor', { status: 500 })
    }
}