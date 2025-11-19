'use client'
//appbora/src/components/forms/WhatsAppSettingsForm.tsx
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

export default function WhatsAppSettingsForm({ onSave }: { onSave: (number?: string) => void }) {
    const { user } = useAppSelector((state) => state.auth)
    const userId = user?.uid
    const { openSnackbar } = useSnackbar()

    const [loading, setLoading] = React.useState(true)
    const [showEdit, setShowEdit] = React.useState(false)
    const [existingNumber, setExistingNumber] = React.useState<string | null>(null)
    const [isInfoDialogOpen, setIsInfoDialogOpen] = React.useState(false)
    const [isSaving, setIsSaving] = React.useState(false)

    // 1. Usar o novo hook simplificado.
    const { value: newNumber, setValue: setNewNumber, cleanNumber } = useWhatsAppInput()

    React.useEffect(() => {
        const fetchPhoneNumber = async () => {
            // Esta lógica só roda se houver um usuário, o que é perfeito.
            if (!userId) {
                setLoading(false)
                return
            }
            const docRef = doc(db, 'users', userId)
            const docSnap = await getDoc(docRef)
            if (docSnap.exists() && docSnap.data()?.whatsappNumber) {
                const number = docSnap.data().whatsappNumber
                setExistingNumber(number)
                setNewNumber(number) // Pré-popula o input com o número salvo
            }
            setLoading(false)
        }
        fetchPhoneNumber()
    }, [userId, setNewNumber])

    const handleUseExisting = () => {
        openSnackbar(`Usando o número salvo.`, 'info')
        onSave(existingNumber!)
    }

    // 2. A lógica principal é ajustada aqui.
    const handleSaveAndContinue = async () => {
        // Se o usuário estiver logado, salvamos o número no banco de dados.
        if (userId) {
            setIsSaving(true)
            await saveUserPhoneNumber(userId, cleanNumber)
            setIsSaving(false)
        }

        // INDEPENDENTEMENTE de estar logado ou não, continuamos o fluxo
        // da conversa passando o número limpo para o componente pai.
        onSave(cleanNumber)
    }

    const handleSkip = () => {
        onSave() // Continua o fluxo sem um número
    }

    if (loading) {
        return <Skeleton variant="rounded" width="100%" height={150} />
    }

    return (
        <>
            <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: 'transparent', boxShadow: 'none' }}>
                {/* 3. A renderização condicional continua válida:
                    - Se o usuário está logado e tem um número, mostra a opção de usar o existente.
                    - Se está deslogado, 'existingNumber' será nulo, então mostra o input diretamente.
                */}
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
                            placeholder="+55 (XX) XXXX-XXXX"
                            variant="outlined"
                            size="small"
                            value={formatDisplayNumber(newNumber)}
                            onChange={(e) => setNewNumber(e.target.value)}
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
                        <Button onClick={handleSaveAndContinue} disabled={isSaving} variant="contained">
                            {isSaving ? <CircularProgress size={24} /> : 'Continuar'}
                        </Button>
                    </Stack>
                )}
                <Divider sx={{ my: 1.5 }} />
                <Button onClick={handleSkip} variant="text" size="small" fullWidth>
                    Pular por agora
                </Button>
            </Paper>
            <WhatsAppInfoDialog open={isInfoDialogOpen} onClose={() => setIsInfoDialogOpen(false)} />
        </>
    )
}