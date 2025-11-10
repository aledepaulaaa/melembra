//bora-app/src/app/api/cron/notificar-proximos-lembretes/route.ts
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
        const fiveMinutesFromNow = now.toMillis() + 5 * 60 * 1000

        // --- CORREÇÃO DA QUERY ---
        // 1. Busca todos os lembretes que ainda não receberam o aviso prévio.
        const snapshot = await db.collection('reminders')
            .where('preNotificationSent', '==', false)
            .get()

        if (snapshot.empty) {
            return NextResponse.json({ message: 'Nenhum lembrete pendente de aviso prévio.' })
        }

        let notificationsSent = 0
        for (const doc of snapshot.docs) {
            const reminder = doc.data()
            const scheduledAtMillis = (reminder.scheduledAt as Timestamp).toMillis()

            // 2. Filtra a data/hora AQUI no código.
            // Verifica se o lembrete está agendado para os próximos 5 minutos.
            if (scheduledAtMillis > now.toMillis() && scheduledAtMillis <= fiveMinutesFromNow) {
                const message = `Seu lembrete "${reminder.title}" começa em 5 minutos.`

                await sendNotification(message, reminder.userId)

                // Marca o lembrete para não enviar este aviso novamente
                await doc.ref.update({ preNotificationSent: true })
                notificationsSent++
            }
        }
        // --- FIM DA CORREÇÃO ---

        return NextResponse.json({ message: `${notificationsSent} notificações de aviso prévio enviadas.` })

    } catch (error) {
        console.error("Erro no cron job de aviso prévio:", error)
        return new NextResponse('Erro interno do servidor', { status: 500 })
    }
}