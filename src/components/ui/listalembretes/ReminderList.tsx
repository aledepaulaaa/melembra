'use client'
//bora-app/src/components/ui/ReminderList.tsx
import React from 'react'
import { motion } from 'framer-motion'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import DeleteIcon from '@mui/icons-material/Delete'
import SourceOutlinedIcon from '@mui/icons-material/SourceOutlined'
import ArchiveIcon from '@mui/icons-material/Archive'
import EventIcon from '@mui/icons-material/Event'
import NotesIcon from '@mui/icons-material/Notes'
import { Reminder } from '@/interfaces/IReminder'
import { useSnackbar } from '@/contexts/SnackbarProvider'
import { useAppSelector } from '@/app/store/hooks'
import { archiveReminder, deleteReminder, getReminders, updateReminderStatus } from '@/app/actions/actions'
import { Box, Typography, Skeleton, Accordion, AccordionDetails, AccordionSummary, Chip, FormControlLabel, Switch, Stack, Button, Paper, Grid, Fab, Tooltip } from '@mui/material'
import ArchivedRemindersDialog from '../dialogs/ArchivedRemindersDialog'

export default function ReminderList() {
    const { openSnackbar } = useSnackbar()
    const [reminders, setReminders] = React.useState<Reminder[]>([])
    const [loading, setLoading] = React.useState(true)
    const [openArchives, setOpenArchives] = React.useState(false)
    const { user, status } = useAppSelector((state) => state.auth)
    const userId = user?.uid

    const fetchReminders = async () => {
        if (!userId) return
        setLoading(true)
        const result = await getReminders(userId)
        if (result.success && result.reminders) {
            setReminders(result.reminders as Reminder[])
        } else {
            console.error(result.error)
        }
        setLoading(false)
    }

    React.useEffect(() => {
        if (status !== 'loading') {
            fetchReminders()
        }
    }, [userId, status])

    const handleStatusChange = async (reminderId: string, newStatus: boolean) => {
        setReminders(reminders.map(r => r.id === reminderId ? { ...r, completed: newStatus } : r))
        await updateReminderStatus(reminderId, newStatus)
        fetchReminders()
    }

    // --- Lógica de Arquivar ---
    const handleArchive = async (reminderId: string) => {
        // Remove da lista visualmente na hora
        setReminders(reminders.filter(r => r.id !== reminderId))
        const result = await archiveReminder(reminderId)
        if (result.success) {
            openSnackbar('Lembrete arquivado!', 'success')
        } else {
            openSnackbar('Erro ao arquivar.', 'error')
            fetchReminders() // Reverte se der erro
        }
    }

    const handleDelete = async (reminderId: string) => {
        setReminders(reminders.filter(r => r.id !== reminderId))
        const result = await deleteReminder(reminderId)
        if (result.success) {
            openSnackbar('Lembrete apagado!', 'success')
        } else {
            openSnackbar('Erro ao apagar. Recarregando lista...', 'error')
            fetchReminders()
        }
    }

    // Skeleton de carregamento (sem alterações)
    if (loading || status === 'loading') {
        return (
            <Box sx={{ width: '100%' }}>
                <Typography variant="h4" fontWeight={900} component="h2" gutterBottom>
                    Seus Lembretes
                </Typography>
                <Stack spacing={2}>
                    <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 2 }} />
                    <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 2 }} />
                    <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 2 }} />
                </Stack>
            </Box>
        )
    }

    return (
        <Box sx={{ ml: -1 }}>
            <Typography variant="h4" fontWeight={900} component="h2" gutterBottom>
                Seus Lembretes
            </Typography>
            {reminders.length > 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { staggerChildren: 0.1 } }}>
                    {reminders.map((reminder) => (
                        <motion.div key={reminder.id} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                            <Accordion
                                component={Paper}
                                elevation={2}
                                sx={{
                                    mb: 2,
                                    opacity: reminder.completed ? 0.7 : 1,
                                    transition: 'opacity 0.3s ease',
                                    borderLeft: `5px solid ${reminder.cor || '#BB86FC'}`,
                                    '&:before': { display: 'none' },
                                    borderRadius: 2,
                                }}
                            >
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                                        <Typography sx={{ textDecoration: reminder.completed ? 'line-through' : 'none', fontWeight: 600 }}>
                                            {reminder.title}
                                        </Typography>
                                    </Box>
                                    {/* Chip de Categoria (se existir) */}
                                    {reminder.category && reminder.category !== 'Geral' && (
                                        <Chip label={reminder.category} size="small" sx={{ mr: 1 }} />
                                    )}
                                    <Chip
                                        label={reminder.completed ? "Concluído" : "Agendado"}
                                        color={reminder.completed ? "default" : "secondary"}
                                        size="small"
                                    />
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Stack spacing={2}>
                                        {/* EXIBIÇÃO DA IMAGEM (se existir) */}
                                        {reminder.img && (
                                            <Box
                                                component="img"
                                                src={reminder.img}
                                                alt={`Imagem para ${reminder.title}`}
                                                sx={{
                                                    width: '100%',
                                                    height: '180px',
                                                    objectFit: 'cover',
                                                    borderRadius: 1.5,
                                                }}
                                            />
                                        )}
                                        {/* EXIBIÇÃO DA DESCRIÇÃO (se existir) */}
                                        {reminder.sobre && (
                                            <Stack direction="row" spacing={1} alignItems="flex-start">
                                                <NotesIcon fontSize="small" color="action" />
                                                <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>{reminder.sobre}</Typography>
                                            </Stack>
                                        )}
                                        {/* INFORMAÇÕES DE AGENDAMENTO */}
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <EventIcon fontSize="small" color="action" />
                                            <Typography variant="body2" color="text.secondary">
                                                {new Date(reminder.scheduledAt).toLocaleString('pt-BR')}
                                                {reminder.recurrence && ` (${reminder.recurrence})`}
                                            </Typography>
                                        </Stack>
                                        {/* CONTROLES (SWITCH E BOTÃO DE APAGAR) */}
                                        <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" sx={{ mt: 2 }}>
                                            <FormControlLabel
                                                control={<Switch checked={!!reminder.completed} onChange={(e) => handleStatusChange(reminder.id, e.target.checked)} />}
                                                label="Concluído"
                                            />
                                            {/* Renderiza BOTÃO ARQUIVAR se estiver concluído */}
                                            {reminder.completed && (
                                                <Button
                                                    variant="contained"
                                                    color="primary"
                                                    size="small"
                                                    startIcon={<ArchiveIcon />}
                                                    onClick={() => handleArchive(reminder.id)}
                                                >
                                                    Arquivar
                                                </Button>
                                            )}
                                        </Stack>
                                    </Stack>
                                </AccordionDetails>
                            </Accordion>
                        </motion.div>
                    ))}
                </motion.div>
            ) : (
                <Typography variant="body1" color="text.secondary">
                    Você ainda não tem lembretes salvos. Crie o seu primeiro!
                </Typography>
            )}
            {/* --- Botão flutuante (Histórico) --- */}
            <Tooltip title="Histórico / Arquivados">
                <Fab
                    color="primary"
                    aria-label="arquivos"
                    sx={{ position: 'fixed', bottom: 80, right: 16 }} // Ajuste a posição conforme necessário
                    onClick={() => setOpenArchives(true)}
                >
                    <SourceOutlinedIcon />
                </Fab>
            </Tooltip>
            {/* --- DIALOG DE ARQUIVADOS --- */}
            <ArchivedRemindersDialog
                open={openArchives}
                onClose={() => setOpenArchives(false)}
                userId={userId || ''}
                onUpdate={fetchReminders} // Atualiza a lista principal se restaurar algo
            />
        </Box>
    )
}