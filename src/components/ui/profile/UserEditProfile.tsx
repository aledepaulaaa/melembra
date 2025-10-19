'use client'
// melemebra/src/components/ui/UserEditProfile.tsx
import React from 'react'
import { useAuth } from '@/components/ui/auth/AuthManager'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '@/app/lib/firebase'
import { saveUserProfile } from '@/app/actions/actions'
import { initialUser, IUserData } from '@/interfaces/IUserData'
import { Button, CircularProgress, Skeleton, Stack, TextField } from '@mui/material'
import { useSnackbar } from '@/contexts/SnackbarProvider'

// Função simples para validar e formatar o número
const formatPhoneNumber = (value: string) => {
    return value.replace(/\D/g, '') // Remove tudo que não for dígito
}

export default function UserEditProfile() {
    const { userId } = useAuth()
    const { openSnackbar } = useSnackbar()
    const [loading, setLoading] = React.useState(true)
    const [isSaving, setIsSaving] = React.useState(false)
    const [profile, setProfile] = React.useState<IUserData>(initialUser)

    React.useEffect(() => {
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
                    email: data.email || '',
                    avatar: data.avatar || ''
                })
            }
            setLoading(false)
        }
        fetchProfile()
    }, [userId])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        if (name === 'whatsappNumber') {
            setProfile(prev => ({ ...prev, [name]: formatPhoneNumber(value) }))
        } else {
            setProfile(prev => ({ ...prev, [name]: value }))
        }
    }

    const handleSave = async () => {
        if (!userId || !profile.name) {
            openSnackbar('O nome é obrigatório.', 'error')
            return
        }
        setIsSaving(true)
        // Precisamos passar email e userId para a action
        const userEmail = auth.currentUser?.email || ''
        await saveUserProfile(userId, { ...profile, email: userEmail, userId: userId })
        setIsSaving(false)
        openSnackbar('Perfil atualizado com sucesso!', 'success')
    }

    if (loading) {
        return <Stack spacing={2}><Skeleton height={56} /><Skeleton height={56} /></Stack>
    }

    return (
        <Stack spacing={2}>
            <TextField name="name" label="Nome Completo *" value={profile.name} onChange={handleInputChange} fullWidth />
            <TextField name="nickname" label="Apelido" value={profile.nickname} onChange={handleInputChange} fullWidth />
            <TextField name="whatsappNumber" label="Nº WhatsApp (Apenas números)" value={profile.whatsappNumber} onChange={handleInputChange} fullWidth />
            <Button onClick={handleSave} variant="contained" disabled={isSaving}>
                {isSaving ? <CircularProgress size={24} /> : 'Salvar Alterações'}
            </Button>
        </Stack>
    )
}