'use client'
//melembra/src/components/forms/WhatsAppSettingsForm.tsx
import React from 'react'
import { useAuth } from '../ui/auth/AuthManager'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/app/lib/firebase'
import { saveUserPhoneNumber } from '@/app/actions/actions'
import { useSnackbar } from '@/contexts/SnackbarProvider'
import { TextField, Button, Typography, Paper, Skeleton, Divider, Stack } from '@mui/material'

export default function WhatsAppSettingsForm({ onSave }: { onSave: () => void }) {
    const { userId } = useAuth()
    const { openSnackbar } = useSnackbar()
    const [loading, setLoading] = React.useState(false)
    const [isSaving, setIsSaving] = React.useState(false)
    const [showEdit, setShowEdit] = React.useState(false)
    const [newNumber, setNewNumber] = React.useState('')
    const [existingNumber, setExistingNumber] = React.useState<string | null>(null)

    // Busca o número salvo do usuário ao carregar o componente
    React.useEffect(() => {
        const fetchPhoneNumber = async () => {
            if (!userId) {
                setLoading(false)
                return
            }

            const docRef = doc(db, 'users', userId)
            const docSnap = await getDoc(docRef)
            if (docSnap.exists() && docSnap.data()?.whatsappNumber) {
                setExistingNumber(docSnap.data()?.whatsappNumber)
            }

            setLoading(false)
        }

        fetchPhoneNumber()
    }, [userId])

    const handleUseExisting = () => {
        openSnackbar(`Usando o número ${existingNumber}.`, 'info')
        onSave() // Continua o fluxo sem salvar nada
    }

    const handleSave = async () => {
        if (!userId || !newNumber) {
            openSnackbar('Por favor, insira um número de telefone válido.', 'error')
            return
        }
        setIsSaving(true)
        const result = await saveUserPhoneNumber(userId, newNumber)
        if (result.success) {
            openSnackbar(result.message as string, 'success')
            onSave() // Continua o fluxo após salvar
        } else {
            openSnackbar(result.error as string, 'error')
        }
        setIsSaving(false)
    }


    if (loading) {
        return <Skeleton variant="rounded" width="100%" height={100} />
    }

    return (
        <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: 'transparent', boxShadow: 'none' }}>
            {existingNumber && !showEdit ? (
                // --- Visão 1: Número já existe ---
                <Stack spacing={1}>
                    <Typography variant="body2">Usar o número salvo?</Typography>
                    <Typography fontWeight="bold">{existingNumber}</Typography>
                    <Button onClick={handleUseExisting} variant="contained">Sim, usar este</Button>
                    <Button onClick={() => setShowEdit(true)} variant="text" size="small">
                        Usar outro número
                    </Button>
                </Stack>
            ) : (
                // --- Visão 2: Sem número ou clicou em editar ---
                <Stack spacing={1}>
                    <Typography variant="body2">Digite seu número com DDD para receber notificações.</Typography>
                    <TextField
                        fullWidth
                        label="Nº WhatsApp"
                        value={newNumber}
                        onChange={(e) => setNewNumber(e.target.value)}
                        placeholder="Ex: 5511999999999"
                        variant="outlined"
                        size="small"
                    />
                    <Button onClick={handleSave} disabled={isSaving} variant="contained">
                        {isSaving ? 'Salvando...' : 'Salvar e Continuar'}
                    </Button>
                </Stack>
            )}
            <Divider sx={{ my: 1.5 }} />
            <Button onClick={onSave} variant="text" size="small" fullWidth>
                Pular notificação por WhatsApp
            </Button>
        </Paper>
    )
}
