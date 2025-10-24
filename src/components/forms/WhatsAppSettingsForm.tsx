'use client'
// melemebra/src/components/forms/WhatsAppSettingsForm.tsx
import React from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/app/lib/firebase'
import { saveUserPhoneNumber } from '@/app/actions/actions'
import { useSnackbar } from '@/contexts/SnackbarProvider'
import { useAppSelector } from '@/app/store/hooks'
import { useWhatsAppInput, formatDisplayNumber } from '@/hooks/useWhatsAppInput'
import InfoIcon from '@mui/icons-material/InfoOutlined'
import { TextField, Button, Typography, Paper, Skeleton, Divider, Stack, InputAdornment, IconButton, CircularProgress } from '@mui/material'
import WhatsAppInfoDialog from '../ui/dialogs/WhatsAppInfoDialog'

// Ajuste na prop: onSave agora pode receber o número ou nada
export default function WhatsAppSettingsForm({ onSave }: { onSave: (number?: string) => void }) {
    const { user } = useAppSelector((state) => state.auth)
    const userId = user?.uid
    const { openSnackbar } = useSnackbar()

    const [loading, setLoading] = React.useState(true)
    const [showEdit, setShowEdit] = React.useState(false)
    const [existingNumber, setExistingNumber] = React.useState<string | null>(null)
    const [isInfoDialogOpen, setIsInfoDialogOpen] = React.useState(false)

    // 3. Usar o hook para gerenciar o estado e a validação
    const { value: newNumber, setValue: setNewNumber, isValidating, handleValidate } = useWhatsAppInput()

    React.useEffect(() => {
        const fetchPhoneNumber = async () => {
            if (!userId) { setLoading(false); return }
            const docRef = doc(db, 'users', userId)
            const docSnap = await getDoc(docRef)
            if (docSnap.exists() && docSnap.data()?.whatsappNumber) {
                const number = docSnap.data().whatsappNumber
                setExistingNumber(number)
                setNewNumber(number) // Pré-popula o input com o número existente
            }
            setLoading(false)
        }
        fetchPhoneNumber()
    }, [userId, setNewNumber])

    const handleUseExisting = () => {
        openSnackbar(`Usando o número salvo.`, 'info')
        onSave(existingNumber!) // Continua o fluxo com o número existente
    }

    const handleSaveAndContinue = async () => {
        if (!userId) return

        const isValid = await handleValidate()
        if (isValid) {
            const cleanNumber = newNumber.replace(/\D/g, '')
            const result = await saveUserPhoneNumber(userId, cleanNumber)
            if (result.success) {
                openSnackbar(result.message as string, 'success')
                onSave(cleanNumber)
            } else {
                openSnackbar(result.error as string, 'error')
            }
        }
    }

    const handleSkip = () => {
        onSave()
    }

    if (loading) {
        return <Skeleton variant="rounded" width="100%" height={150} />
    }

    return (
        <>
            <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: 'transparent', boxShadow: 'none' }}>
                {existingNumber && !showEdit ? (
                    <Stack spacing={1}>
                        <Typography variant="body2">Usar o número salvo?</Typography>
                        <Typography fontWeight="bold">{formatDisplayNumber(existingNumber)}</Typography>
                        <Button onClick={handleUseExisting} variant="contained">Sim, usar este</Button>
                        <Button onClick={() => setShowEdit(true)} variant="text" size="small">Usar outro número</Button>
                    </Stack>
                ) : (
                    <Stack spacing={1}>
                        <Typography variant="body2">Seu número com DDD para receber notificações.</Typography>
                        <TextField
                            fullWidth
                            label="Nº WhatsApp"
                            placeholder="+55 (XX) 9XXXX-XXXX"
                            variant="outlined"
                            size="small"
                            value={formatDisplayNumber(newNumber)} // 4. Mostra o número formatado
                            onChange={(e) => setNewNumber(e.target.value)} // Atualiza o estado
                            slotProps={{
                                input: {
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton size="small" edge="end" onClick={() => setIsInfoDialogOpen(true)}>
                                                <InfoIcon fontSize="small" />
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }
                            }}
                        />
                        <Button onClick={handleSaveAndContinue} disabled={isValidating} variant="contained">
                            {isValidating ? <CircularProgress size={24} /> : 'Validar e Continuar'}
                        </Button>
                    </Stack>
                )}
                <Divider sx={{ my: 1.5 }} />
                <Button onClick={handleSkip} variant="text" size="small" fullWidth>
                    Pular por agora
                </Button>
            </Paper>
            {/* 5. Renderiza o Dialog reutilizável */}
            <WhatsAppInfoDialog open={isInfoDialogOpen} onClose={() => setIsInfoDialogOpen(false)} />
        </>
    )
}