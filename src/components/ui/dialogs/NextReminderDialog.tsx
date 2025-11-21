'use client'
//appbora/src/components/ui/dialogs/NextReminderDialog.tsx
import React from 'react'
import CloseIcon from '@mui/icons-material/Close'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import SnoozeIcon from '@mui/icons-material/Snooze'
import { Reminder } from '@/interfaces/IReminder'
import { motion } from 'framer-motion'
import { useSnackbar } from '@/contexts/SnackbarProvider'
import { snoozeReminder } from '@/app/actions/actions'
import { MobileDateTimePicker } from '@mui/x-date-pickers'
import EditCalendarIcon from '@mui/icons-material/EditCalendar'
import { Dialog, DialogContent, Typography, Box, IconButton, Stack, Chip, Button, ListItemText, Menu, MenuItem, ListItemIcon } from '@mui/material'

interface NextReminderDialogProps {
    open: boolean
    onClose: () => void
    reminder: Reminder | null
}

export default function NextReminderDialog({ open, onClose, reminder }: NextReminderDialogProps) {
    const [timeLeft, setTimeLeft] = React.useState<string>('')
    const { openSnackbar } = useSnackbar()
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
    const [openCustomDate, setOpenCustomDate] = React.useState(false)

    const handleSnoozeClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget)
    }

    const handleSnoozeConfirm = async (minutes: number) => {
        setAnchorEl(null)
        if (!reminder) return

        const res = await snoozeReminder(reminder.id, minutes)
        if (res.success) {
            openSnackbar(`Adiado em ${minutes} minutos!`, 'success')
            onClose() // Fecha dialog
            // Opcional: forçar refresh da home
        } else {
            openSnackbar('Erro ao adiar.', 'error')
        }
    }

    const handleCustomDateAccept = (date: Date | null) => {
        if (date && reminder) {
            // Calcula diferença em minutos entre AGORA e a DATA ESCOLHIDA
            const now = new Date()
            const diffMs = date.getTime() - now.getTime()
            const diffMins = Math.floor(diffMs / 60000)

            if (diffMins > 0) {
                handleSnoozeConfirm(diffMins)
            } else {
                openSnackbar('Escolha uma data no futuro!', 'warning')
            }
            setOpenCustomDate(false)
        }
    }

    React.useEffect(() => {
        if (!reminder || !open) return

        const targetDate = new Date(reminder.scheduledAt).getTime()

        const updateTimer = () => {
            const now = new Date().getTime()
            const difference = targetDate - now

            if (difference <= 0) {
                setTimeLeft('É agora! ⏰')
                return
            }

            const days = Math.floor(difference / (1000 * 60 * 60 * 24))
            const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
            const seconds = Math.floor((difference % (1000 * 60)) / 1000)

            // Formatação bonita
            let text = ''
            if (days > 0) text += `${days}d `
            text += `${hours.toString().padStart(2, '0')}h `
            text += `${minutes.toString().padStart(2, '0')}m `
            text += `${seconds.toString().padStart(2, '0')}s`

            setTimeLeft(text)
        }

        updateTimer()
        const interval = setInterval(updateTimer, 1000)
        return () => clearInterval(interval)
    }, [reminder, open])

    if (!reminder) return null

    return (
        <>
            <Dialog
                open={open}
                onClose={onClose}
                slotProps={{
                    backdrop: {
                        style: {
                            borderRadius: 20,
                            borderTop: `8px solid ${reminder.cor || '#BB86FC'}`,
                            overflow: 'hidden'
                        }
                    }
                }}
            >
                <Box sx={{ position: 'absolute', right: 8, top: 8 }}>
                    <IconButton onClick={onClose}><CloseIcon /></IconButton>
                </Box>
                <DialogContent sx={{ textAlign: 'center', py: 5, px: 3 }}>
                    <Typography variant="overline" color="text.secondary" fontWeight={700} letterSpacing={2}>
                        PRÓXIMO LEMBRETE
                    </Typography>
                    <Box my={3}>
                        <motion.div
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            <Typography variant="h3" fontWeight={900} sx={{ fontFamily: 'monospace' }}>
                                {timeLeft}
                            </Typography>
                        </motion.div>
                    </Box>
                    <Typography variant="h5" fontWeight={700} gutterBottom>
                        {reminder.title}
                    </Typography>
                    <Stack direction="row" justifyContent="center" spacing={1} mt={2}>
                        {reminder.category && <Chip label={reminder.category} size="small" />}
                        <Chip
                            icon={<AccessTimeIcon />}
                            label={new Date(reminder.scheduledAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            variant="outlined"
                        />
                    </Stack>
                    {/* BOTÃO SONECA */}
                    <Box mt={4} display="flex" justifyContent="center">
                        <Button
                            variant="outlined"
                            color="warning"
                            startIcon={<SnoozeIcon />}
                            onClick={handleSnoozeClick}
                            sx={{ borderRadius: 4 }}
                        >
                            Soneca (Adiar)
                        </Button>
                    </Box>
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={() => setAnchorEl(null)}
                    >
                        <MenuItem onClick={() => handleSnoozeConfirm(10)}>
                            <ListItemText>10 minutos</ListItemText>
                        </MenuItem>
                        <MenuItem onClick={() => handleSnoozeConfirm(60)}>
                            <ListItemText>1 hora</ListItemText>
                        </MenuItem>
                        <MenuItem onClick={() => handleSnoozeConfirm(1440)}> {/* 24h */}
                            <ListItemText>Amanhã (24h)</ListItemText>
                        </MenuItem>
                        <MenuItem onClick={() => { setAnchorEl(null); setOpenCustomDate(true) }}>
                            <ListItemIcon><EditCalendarIcon fontSize="small" /></ListItemIcon>
                            <ListItemText>Escolher Data...</ListItemText>
                        </MenuItem>
                    </Menu>
                </DialogContent>
            </Dialog>
            {openCustomDate && (
                <MobileDateTimePicker
                    open={openCustomDate}
                    onClose={() => setOpenCustomDate(false)}
                    onAccept={handleCustomDateAccept}
                    defaultValue={new Date(new Date().getTime() + 3600000)} // Padrão: +1h
                    slotProps={{ textField: { sx: { display: 'none' } } }} // Esconde o input de texto
                />
            )}
        </>
    )
}