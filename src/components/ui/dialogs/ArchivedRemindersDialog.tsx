'use client'
//appbora/src/components/ui/dialogs/ArchivedRemindersDialog.tsx
import React from 'react'
import CloseIcon from '@mui/icons-material/Close'
import RestoreIcon from '@mui/icons-material/Restore'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import EventIcon from '@mui/icons-material/Event'
import { getArchivedReminders, deleteReminder, reuseReminder } from '@/app/actions/actions'
import { Reminder } from '@/interfaces/IReminder'
import { useSnackbar } from '@/contexts/SnackbarProvider'
import { Dialog, DialogTitle, DialogContent, IconButton, List, ListItem, ListItemText, Typography, Box, Chip, Stack, Skeleton, Button } from '@mui/material'

interface ArchivedDialogProps {
    open: boolean
    onClose: () => void
    userId: string
    onUpdate: () => void // Para atualizar a lista principal ao fechar ou modificar
}

const truncateText = (text: string, limit: number) => {
    if (!text) return ''
    return text.length > limit ? text.substring(0, limit) + '...' : text
}

export default function ArchivedRemindersDialog({ open, onClose, userId, onUpdate }: ArchivedDialogProps) {
    const [archivedList, setArchivedList] = React.useState<Reminder[]>([])
    const [loading, setLoading] = React.useState(false)
    const { openSnackbar } = useSnackbar()

    // Carregar arquivados ao abrir
    React.useEffect(() => {
        if (open && userId) {
            loadArchived()
        }
    }, [open, userId])

    const loadArchived = async () => {
        setLoading(true)
        const res = await getArchivedReminders(userId)
        if (res.success && res.reminders) {
            setArchivedList(res.reminders as Reminder[])
        }
        setLoading(false)
    }

    const handleReuse = async (id: string) => {
        const res = await reuseReminder(id)
        if (res.success) {
            openSnackbar('Lembrete restaurado!', 'success')
            setArchivedList(prev => prev.filter(item => item.id !== id))
            onUpdate() // Atualiza lista principal
        } else {
            openSnackbar('Erro ao restaurar.', 'error')
        }
    }

    const handleDelete = async (id: string) => {
        const res = await deleteReminder(id)
        if (res.success) {
            openSnackbar('Apagado permanentemente.', 'success')
            setArchivedList(prev => prev.filter(item => item.id !== id))
        } else {
            openSnackbar('Erro ao apagar.', 'error')
        }
    }

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                Lembretes Arquivados
                <IconButton onClick={onClose}><CloseIcon /></IconButton>
            </DialogTitle>
            <DialogContent dividers sx={{ p: 0 }}>
                {loading ? (
                    <Stack spacing={2}><Skeleton height={50} /><Skeleton height={50} /></Stack>
                ) : archivedList.length === 0 ? (
                    <Box textAlign="center" py={6}>
                        <Typography color="text.secondary">Nenhum lembrete arquivado.</Typography>
                    </Box>
                ) : (
                    <List disablePadding>
                        {archivedList.map((item) => (
                            <ListItem
                                key={item.id}
                                divider
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'flex-start',
                                    p: 2,
                                    borderLeft: `6px solid ${item.cor || '#ccc'}`,
                                    bgcolor: 'background.paper'
                                }}
                            >
                                <Box width="100%" mb={1}>
                                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                        <Box>
                                            {/* Título Truncado e Forte */}
                                            <Typography variant="subtitle1" fontWeight="800" lineHeight={1.2}>
                                                {truncateText(item.title, 25)}
                                            </Typography>
                                            {/* Data e Categoria */}
                                            <Stack direction="row" alignItems="center" gap={1} mt={0.5}>
                                                <Typography variant="caption" color="text.secondary" display="flex" alignItems="center" gap={0.5}>
                                                    <EventIcon sx={{ fontSize: 14 }} />
                                                    {new Date(item.scheduledAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                </Typography>
                                                {item.category && item.category !== 'Geral' && (
                                                    <Chip label={item.category} size="small" sx={{ height: 20, fontSize: '0.65rem' }} />
                                                )}
                                            </Stack>
                                        </Box>
                                    </Stack>
                                </Box>
                                {/* Ações em Linha (Botões compactos) */}
                                <Stack direction="row" spacing={1} width="100%" justifyContent="flex-end">
                                    <Button
                                        size="small"
                                        startIcon={<RestoreIcon />}
                                        onClick={() => handleReuse(item.id)}
                                        sx={{ textTransform: 'none', fontSize: '0.75rem' }}
                                    >
                                        Restaurar
                                    </Button>
                                    <Button
                                        size="small"
                                        color="error"
                                        startIcon={<DeleteForeverIcon />}
                                        onClick={() => handleDelete(item.id)}
                                        sx={{ textTransform: 'none', fontSize: '0.75rem' }}
                                    >
                                        Excluir
                                    </Button>
                                </Stack>
                            </ListItem>
                        ))}
                    </List>
                )}
            </DialogContent>
        </Dialog>
    )
}