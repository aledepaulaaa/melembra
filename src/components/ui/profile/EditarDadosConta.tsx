'use client'
//appbora/src/components/ui/profile/EditarDadosConta.tsx
import React from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db, storage } from '@/app/lib/firebase'
import { saveUserProfile } from '@/app/actions/actions'
import { useSnackbar } from '@/contexts/SnackbarProvider'
import { useAppSelector } from '@/app/store/hooks'
import { IUserData } from '@/interfaces/IUserData'
import InfoIcon from '@mui/icons-material/InfoOutlined'
import WhatsAppInfoDialog from '../dialogs/WhatsAppInfoDialog'
import { useWhatsAppInput, formatDisplayNumber } from '@/hooks/useWhatsAppInput'
import { Button, CircularProgress, Skeleton, Stack, TextField, InputAdornment, IconButton } from '@mui/material'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import ImagemPerfilConta from './ImagemPerfilConta'

export default function EditarDadosConta() {
    const { openSnackbar } = useSnackbar()
    const { user } = useAppSelector((state) => state.auth)
    const userId = user?.uid

    const [loading, setLoading] = React.useState(true)
    const [isSaving, setIsSaving] = React.useState(false)
    const [profile, setProfile] = React.useState<Omit<IUserData, 'password'>>({ name: '', whatsappNumber: '', avatar: '', email: '' })
    const [isInfoDialogOpen, setIsInfoDialogOpen] = React.useState(false)
    const [newImageFile, setNewImageFile] = React.useState<File | null>(null)
    const [imagePreview, setImagePreview] = React.useState<string | null>(null)

    // 3. Usar o hook para gerenciar o estado e a validação do WhatsApp
    const { value: whatsappNumber, setValue: setWhatsappNumber } = useWhatsAppInput()

    React.useEffect(() => {
        const fetchProfile = async () => {
            if (!userId) return
            const userDocRef = doc(db, 'users', userId)
            const docSnap = await getDoc(userDocRef)
            if (docSnap.exists()) {
                const data = docSnap.data()
                setProfile({
                    name: data.name || '',
                    whatsappNumber: data.whatsappNumber || '',
                    avatar: data.avatar || user?.avatar || '',
                    email: data.email || ''
                })
                setImagePreview(data.avatar || user?.avatar || null)
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

    const handleImageSelected = (file: File, preview: string) => {
        setNewImageFile(file)
        setImagePreview(preview)
    }

    const handleSave = async () => {
        if (!userId || !profile.name) {
            openSnackbar('O nome é obrigatório.', 'error')
            return
        }
        setIsSaving(true)

        try {
            let finalPhotoURL = profile.avatar

            // Se houver nova imagem faz upload
            if (newImageFile) {
                const storageRef = ref(storage, `users/${userId}/profile_${Date.now()}.jpg`)
                const snapshot = await uploadBytes(storageRef, newImageFile)
                finalPhotoURL = await getDownloadURL(snapshot.ref)
            }

            const cleanNumber = whatsappNumber.replace(/\D/g, '')
            const userEmail = auth.currentUser?.email || ''
            await saveUserProfile(userId, {
                ...profile,
                whatsappNumber: cleanNumber,
                email: userEmail,
                userId: userId,
                avatar: finalPhotoURL || ''
            })

            setIsSaving(false)
            openSnackbar('Perfil atualizado com sucesso!', 'success')
        } catch (error) {
            console.error(error)
            setIsSaving(false)
            openSnackbar('Erro ao salvar perfil.', 'error')
        }

    }

    if (loading) {
        return <Stack spacing={2}><Skeleton height={56} /><Skeleton height={56} /><Skeleton height={56} /></Stack>
    }

    return (
        <>
            <ImagemPerfilConta
                currentImage={imagePreview}
                onImageSelected={handleImageSelected}
                isUploading={isSaving}
            />
            <Stack spacing={2}>
                <TextField name="name" label="Nome Completo *" value={profile.name} onChange={handleInputChange} fullWidth />
                <TextField
                    fullWidth
                    name="whatsappNumber"
                    label="WhatsApp"
                    placeholder="+55 (DDD) XXXX-XXXX"
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
                <TextField name="email" label="E-mail usado" value={profile.email} disabled  fullWidth />
                <Button onClick={handleSave} variant="contained" disabled={isSaving}>
                    {isSaving ? <CircularProgress size={24} /> : 'Salvar Alterações'}
                </Button>
            </Stack>
            {/* 5. Renderiza o Dialog reutilizável */}
            <WhatsAppInfoDialog open={isInfoDialogOpen} onClose={() => setIsInfoDialogOpen(false)} />
        </>
    )
}