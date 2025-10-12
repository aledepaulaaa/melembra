'use client'
// melembra/src/components/ui/ReminderList.tsx
import React, { useEffect, useState } from 'react'
import { Box, Typography, Paper, Skeleton } from '@mui/material'
import { useAuth } from '@/components/AuthManager'
import { getReminders } from '@/app/actions/actions'

// 1. Interface atualizada para refletir a estrutura do documento no Firestore
interface Reminder {
    id: string
    title: string
}

export default function ReminderList() {
    const { userId, loading: authLoading } = useAuth()
    // 2. O estado agora armazena um array de `Reminder`
    const [reminders, setReminders] = useState<Reminder[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchReminders = async () => {
            if (!userId) return

            setLoading(true)
            const result = await getReminders(userId)
            if (result.success && result.reminders) {
                // 3. Fazendo a conversão de tipo para a nova interface
                setReminders(result.reminders as any)
            } else {
                console.error(result.error)
            }
            setLoading(false)
        }

        if (!authLoading) {
            fetchReminders()
        }
    }, [userId, authLoading])

    if (loading || authLoading) {
        return (
            <Box sx={{ p: 4, width: '100%', maxWidth: 600 }}>
                <Typography variant="h4" component="h2" gutterBottom>
                    Seus Lembretes
                </Typography>
                <Skeleton variant="rectangular" height={50} sx={{ borderRadius: 2, mb: 2 }} />
                <Skeleton variant="rectangular" height={50} sx={{ borderRadius: 2, mb: 2 }} />
                <Skeleton variant="rectangular" height={50} sx={{ borderRadius: 2, mb: 2 }} />
            </Box>
        )
    }

    return (
        <Box sx={{ p: 4, width: '100%', maxWidth: 600 }}>
            <Typography variant="h4" component="h2" gutterBottom>
                Seus Lembretes
            </Typography>
            {reminders.length > 0 ? (
                // 4. Lógica de renderização simplificada com um único .map()
                reminders.map((reminder) => (
                    <Paper key={reminder.id} elevation={3} sx={{ p: 2, mb: 2, borderRadius: 2 }}>
                        <Typography variant="body1">
                            {reminder.title}
                        </Typography>
                    </Paper>
                ))
            ) : (
                <Typography variant="body1" color="text.secondary">
                    Você ainda não tem lembretes salvos.
                </Typography>
            )}
        </Box>
    )
}