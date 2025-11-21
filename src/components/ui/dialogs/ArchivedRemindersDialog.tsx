'use client'
//appbora/src/components/ui/dialogs/ArchivedRemindersDialog.tsx
import React from 'react'
import { Dialog, DialogTitle, DialogContent, IconButton, List, ListItem, ListItemText, Typography, Box, Chip, Stack, Skeleton } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import RestoreFromTrashIcon from '@mui/icons-material/RestoreFromTrash'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import EventIcon from '@mui/icons-material/Event'
import { getArchivedReminders, deleteReminder, reuseReminder } from '@/app/actions/actions'
import { Reminder } from '@/interfaces/IReminder'
import { useSnackbar } from '@/contexts/SnackbarProvider'

interface ArchivedDialogProps {
    open: boolean
    onClose: () => void
    userId: string
    onUpdate: () => void // Para atualizar a lista principal ao fechar ou modificar
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
            <DialogContent dividers>
                {loading ? (
                    <Stack spacing={2}><Skeleton height={50} /><Skeleton height={50} /></Stack>
                ) : archivedList.length === 0 ? (
                    <Box textAlign="center" py={4}>
                        <Typography color="text.secondary">Nenhum lembrete arquivado.</Typography>
                    </Box>
                ) : (
                    <List>
                        {archivedList.map((item) => (
                            <ListItem
                                key={item.id}
                                sx={{
                                    bgcolor: 'background.default',
                                    mb: 1, borderRadius: 2,
                                    borderLeft: `4px solid ${item.cor || '#ccc'}`
                                }}
                                secondaryAction={
                                    <Stack direction="row">
                                        <IconButton onClick={() => handleReuse(item.id)} color="primary" title="Reutilizar">
                                            <RestoreFromTrashIcon />
                                        </IconButton>
                                        <IconButton onClick={() => handleDelete(item.id)} color="error" title="Apagar">
                                            <DeleteForeverIcon />
                                        </IconButton>
                                    </Stack>
                                }
                            >
                                <ListItemText
                                    primary={
                                        <Stack  direction="row" alignItems="center" gap={1}>
                                            <Typography fontWeight={600}>{item.title}</Typography>
                                            {item.category && <Chip label={item.category} size="small" style={{ fontSize: '0.6rem' }} />}
                                        </Stack>
                                    }
                                    secondary={
                                        <Stack direction="row" alignItems="center" gap={0.5} mt={0.5}>
                                            <EventIcon fontSize="inherit" />
                                            <Typography variant="caption">
                                                Original: {new Date(item.scheduledAt).toLocaleDateString('pt-BR')}
                                            </Typography>
                                        </Stack>
                                    }
                                    slotProps={{ primary: { component: 'div'}, secondary: { component: 'div' } }}
                                />
                            </ListItem>
                        ))}
                    </List>
                )}
            </DialogContent>
        </Dialog>
    )
}