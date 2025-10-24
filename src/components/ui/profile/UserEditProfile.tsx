'use client'
// melemebra/src/components/ui/profile/UserEditProfile.tsx
import React, { useEffect, useState } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '@/app/lib/firebase'
import { saveUserProfile } from '@/app/actions/actions'
import { useSnackbar } from '@/contexts/SnackbarProvider'
import { useAppSelector } from '@/app/store/hooks'
import { IUserData } from '@/interfaces/IUserData'
import { useWhatsAppInput, formatDisplayNumber } from '@/hooks/useWhatsAppInput'
import InfoIcon from '@mui/icons-material/InfoOutlined'
import { Button, CircularProgress, Skeleton, Stack, TextField, InputAdornment, IconButton } from '@mui/material'
import WhatsAppInfoDialog from '../dialogs/WhatsAppInfoDialog'

export default function UserEditProfile() {
    const { openSnackbar } = useSnackbar()
    const { user } = useAppSelector((state) => state.auth)
    const userId = user?.uid

    const [loading, setLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [profile, setProfile] = useState<Omit<IUserData, 'password' | 'email'>>({ name: '', nickname: '', whatsappNumber: '' })
    const [isInfoDialogOpen, setIsInfoDialogOpen] = useState(false)

    // 3. Usar o hook para gerenciar o estado e a validação do WhatsApp
    const { value: whatsappNumber, setValue: setWhatsappNumber, isValidating, handleValidate } = useWhatsAppInput()

    useEffect(() => {
        const fetchProfile = async () => {
            if (!userId) return
            const userDocRef = doc(db, 'users', userId)
            const docSnap = await getDoc(userDocRef)
            if (docSnap.exists()) {
                const data = docSnap.data()
                setProfile({
                    name: data.name || '',
                    nickname: data.nickname || '',
                    whatsappNumber: data.whatsappNumber || '',
                })
                // Inicializa o hook do WhatsApp com o valor do banco de dados
                setWhatsappNumber(data.whatsappNumber || '')
            }
            setLoading(false)
        }
        fetchProfile()
    }, [userId, setWhatsappNumber])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setProfile(prev => ({ ...prev, [name]: value }))
    }

    const handleSave = async () => {
        if (!userId || !profile.name) {
            openSnackbar('O nome é obrigatório.', 'error')
            return
        }

        setIsSaving(true)

        // Valida o número de WhatsApp antes de salvar
        const isWhatsAppValid = await handleValidate()
        if (!isWhatsAppValid) {
            openSnackbar('O número de WhatsApp parece inválido. Verifique-o antes de salvar.', 'warning')
            // Opcional: descomente a linha abaixo para bloquear o salvamento
            setIsSaving(false)
            return
        }

        const cleanNumber = whatsappNumber.replace(/\D/g, '')
        const userEmail = auth.currentUser?.email || ''

        await saveUserProfile(userId, { ...profile, whatsappNumber: cleanNumber, email: userEmail, userId: userId })

        setIsSaving(false)
        openSnackbar('Perfil atualizado com sucesso!', 'success')
    }

    if (loading) {
        return <Stack spacing={2}><Skeleton height={56} /><Skeleton height={56} /><Skeleton height={56} /></Stack>
    }

    return (
        <>
            <Stack spacing={2}>
                <TextField name="name" label="Nome Completo *" value={profile.name} onChange={handleInputChange} fullWidth />
                <TextField name="nickname" label="Apelido" value={profile.nickname} onChange={handleInputChange} fullWidth />
                <TextField
                    fullWidth
                    name="whatsappNumber"
                    label="WhatsApp"
                    placeholder="+55 (DDD) 9XXXX-XXXX"
                    // 4. Mostra o número formatado
                    value={formatDisplayNumber(whatsappNumber)}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    slotProps={{
                        input: {
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        size="small"
                                        edge="end"
                                        aria-label="Informação de formato do WhatsApp"
                                        onClick={() => setIsInfoDialogOpen(true)}
                                    >
                                        <InfoIcon fontSize="small" color="info" />
                                    </IconButton>
                                </InputAdornment>
                            )
                        }
                    }}
                />
                <Button onClick={handleSave} variant="contained" disabled={isSaving || isValidating}>
                    {isSaving || isValidating ? <CircularProgress size={24} /> : 'Salvar Alterações'}
                </Button>
            </Stack>
            {/* 5. Renderiza o Dialog reutilizável */}
            <WhatsAppInfoDialog open={isInfoDialogOpen} onClose={() => setIsInfoDialogOpen(false)} />
        </>
    )
}