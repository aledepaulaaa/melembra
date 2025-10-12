'use client'
//melembra/src/components/forms/ReminderForm.tsx
import React, { useState } from 'react'
import { useAuth } from '../AuthManager'
import { saveReminder } from '../../app/actions/actions'
import { toast } from 'react-toastify'
import { useRouter } from 'next/navigation'
import { usePushNotification } from '../../hooks/usePushNotification'
import { Box, TextField, IconButton, CircularProgress, Paper } from '@mui/material'
import SendIcon from '@mui/icons-material/Send'

export default function ReminderForm() {
    const { userId } = useAuth()
    const { handleSubscribe } = usePushNotification()
    const router = useRouter()
    const [reminderText, setReminderText] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSaveReminder = async () => {
        if (!userId || !reminderText.trim()) {
            toast.error('Por favor, digite um lembrete.')
            return
        }

        setLoading(true)
        // Simplesmente salvando o texto do lembrete com a data e hora atuais.
        // Você pode adicionar uma lógica mais avançada de processamento de data/hora aqui.
        const result = await saveReminder(reminderText, new Date(), userId)

        if (result.success) {
            toast.success('Lembrete salvo com sucesso!')
            try {
                await handleSubscribe()
            } catch (error) {
                console.error("Falha ao se inscrever para notificações push:", error)
            }
            router.push('/lembretes')
        } else {
            toast.error(result.error)
        }
        setLoading(false)
        setReminderText('') // Limpa o campo após o envio
    }

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSaveReminder()
        }
    }

    return (
        <Box
            sx={{
                p: 2,
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                borderRadius: 2,
            }}
        >
            <TextField
                fullWidth
                variant="standard"
                multiline
                maxRows={4}
                value={reminderText}
                onChange={(e) => setReminderText(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="O que você precisa lembrar ?"
                InputProps={{
                    disableUnderline: true,
                    sx: {
                        fontSize: '1.1rem',
                        color: 'white',
                    },
                }}
            />
            <IconButton color="primary" onClick={handleSaveReminder} disabled={loading}>
                {loading ? <CircularProgress size={24} /> : <SendIcon />}
            </IconButton>
        </Box>
    )
}