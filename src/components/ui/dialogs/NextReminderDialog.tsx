'use client'
//appbora/src/components/ui/dialogs/NextReminderDialog.tsx
import React from 'react'
import { Dialog, DialogContent, Typography, Box, IconButton, Stack, Chip } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import { Reminder } from '@/interfaces/IReminder'
import { motion } from 'framer-motion'

interface NextReminderDialogProps {
    open: boolean
    onClose: () => void
    reminder: Reminder | null
}

export default function NextReminderDialog({ open, onClose, reminder }: NextReminderDialogProps) {
    const [timeLeft, setTimeLeft] = React.useState<string>('')

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
            </DialogContent>
        </Dialog>
    )
}