'use client'
// melembra/src/components/ui/ReminderList.tsx
import React from 'react'
import { useAuth } from '@/components/AuthManager'
import { deleteReminder, getReminders, updateReminderStatus } from '@/app/actions/actions'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import DeleteIcon from '@mui/icons-material/Delete'
import { Box, Typography, Skeleton, Accordion, AccordionDetails, AccordionSummary, Chip, FormControlLabel, Switch, Stack, Button } from '@mui/material'
import { toast } from 'react-toastify'

// 1. Interface atualizada para refletir a estrutura do documento no Firestore
interface Reminder {
    id: string
    title: string
    scheduledAt: string // Vem como string ISO da action
    completed?: boolean
}

export default function ReminderList() {
    const { userId, loading: authLoading } = useAuth()
    const [reminders, setReminders] = React.useState<Reminder[]>([])
    const [loading, setLoading] = React.useState(true)

    const fetchReminders = async () => {
        if (!userId) return
        setLoading(true)
        const result = await getReminders(userId)
        if (result.success && result.reminders) {
            setReminders(result.reminders as any)
        } else {
            console.error(result.error)
        }
        setLoading(false)
    }

    React.useEffect(() => {
        if (!authLoading) {
            fetchReminders()
        }
    }, [userId, authLoading])

    const handleStatusChange = async (reminderId: string, newStatus: boolean) => {
        // Atualiza o estado visualmente de forma otimista
        setReminders(reminders.map(r => r.id === reminderId ? { ...r, completed: newStatus } : r))

        // Envia a atualização para o servidor
        await updateReminderStatus(reminderId, newStatus)
        // Opcional: recarregar os dados para garantir consistência
        fetchReminders()
    }

    const handleDelete = async (reminderId: string) => {
        // Atualiza a UI otimisticamente
        setReminders(reminders.filter(r => r.id !== reminderId))

        const result = await deleteReminder(reminderId)
        if (result.success) {
            toast.success('Lembrete apagado!')
        } else {
            toast.error('Erro ao apagar. Recarregando lista...')
            fetchReminders() // Recarrega para garantir consistência em caso de erro
        }
    }

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
                reminders.map((reminder) => (
                    <Accordion key={reminder.id} sx={{ mb: 2, opacity: reminder.completed ? 0.6 : 1 }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                                <Chip label={reminder.completed ? "Concluído" : "Agendado"} color={reminder.completed ? "default" : "secondary"} size="small" />
                                <Typography sx={{ textDecoration: reminder.completed ? 'line-through' : 'none' }}>
                                    {reminder.title}
                                </Typography>
                            </Box>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Box>
                                <Typography variant="body2" color="text.secondary">
                                    Agendado para: {new Date(reminder.scheduledAt).toLocaleString('pt-BR')}
                                </Typography>
                                <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 2 }}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={!!reminder.completed}
                                                onChange={(e) => handleStatusChange(reminder.id, e.target.checked)}
                                            />
                                        }
                                        label="Concluído"
                                    />
                                    {/* BOTÃO DE APAGAR CONDICIONAL */}
                                    {reminder.completed && (
                                        <Button
                                            variant="outlined"
                                            color="error"
                                            size="small"
                                            startIcon={<DeleteIcon />}
                                            onClick={() => handleDelete(reminder.id)}
                                        >
                                            Apagar
                                        </Button>
                                    )}
                                </Stack>
                            </Box>
                        </AccordionDetails>
                    </Accordion>
                ))
            ) : (
                <Typography variant="body1" color="text.secondary">
                    Você ainda não tem lembretes salvos.
                </Typography>
            )}
        </Box>
    )
}