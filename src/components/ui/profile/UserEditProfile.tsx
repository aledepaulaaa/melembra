'use client'
// melemebra/src/components/ui/UserEditProfile.tsx
import React from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '@/app/lib/firebase'
import { saveUserProfile } from '@/app/actions/actions'
import { initialUser, IUserData } from '@/interfaces/IUserData'
import { useSnackbar } from '@/contexts/SnackbarProvider'
import { useAppSelector } from '@/app/store/hooks'
import InfoIcon from '@mui/icons-material/InfoOutlined'
import WhatsAppIcon from '@mui/icons-material/WhatsApp'
import { Alert, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText,
DialogTitle, IconButton, InputAdornment, Skeleton, Stack, TextField
} from '@mui/material'

// Função simples para validar e formatar o número
const formatPhoneNumber = (value: string) => {
    return value.replace(/\D/g, '') // Remove tudo que não for dígito
}

export default function UserEditProfile() {
    const { openSnackbar } = useSnackbar()
    const [loading, setLoading] = React.useState(true)
    const [isSaving, setIsSaving] = React.useState(false)
    const [profile, setProfile] = React.useState<IUserData>(initialUser)
    const [isDialogOpen, setIsDialogOpen] = React.useState(false)
    const { user } = useAppSelector((state) => state.auth)
    const userId = user?.uid

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

    const handleOpenDialog = () => setIsDialogOpen(true)
    const handleCloseDialog = () => setIsDialogOpen(false)

    return (
        <Stack spacing={2}>
            <TextField name="name" label="Nome Completo *" value={profile.name} onChange={handleInputChange} fullWidth />
            <TextField name="nickname" label="Apelido" value={profile.nickname} onChange={handleInputChange} fullWidth />
            <TextField
                fullWidth
                name="whatsappNumber"
                label="WhatsApp (Apenas números)"
                placeholder="Ex: 3198334-7898"
                value={profile.whatsappNumber}
                onChange={handleInputChange}
                slotProps={{
                    input: {
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    size="small"
                                    edge="end"
                                    aria-label="Informação de formato do WhatsApp"
                                    onClick={handleOpenDialog}
                                >
                                    <InfoIcon fontSize="small" color="info" />
                                </IconButton>
                            </InputAdornment>
                        )
                    }
                }}
            />
            {/* adicione um tooltipo com alert severy="info" aqui  */}
            <Button onClick={handleSave} variant="contained" disabled={isSaving}>
                {isSaving ? <CircularProgress size={24} /> : 'Salvar Alterações'}
            </Button>
            <Dialog open={isDialogOpen} onClose={handleCloseDialog} fullWidth>
                <Stack spacing={1} direction="row" alignItems="center">
                    <DialogTitle sx={{ fontSize: 16 }}>Formato WhatsApp</DialogTitle>
                    <WhatsAppIcon fontSize='large' />
                </Stack>
                <DialogContent>
                    <DialogContentText component="div" sx={{ color: 'text.primary' }}>
                        <Alert severity='info' sx={{ mb: 2 }}>
                            Para você receber notificações no WhatsApp, é crucial que o número seja salvo no formato correto que a Meta aceita.
                        </Alert>
                        <Alert severity='success' sx={{ mb: 2 }}>
                            O formato deve ser: **55 (DDD) 9 (seu-numero)**.
                            <br />
                            Por exemplo, um número com DDD 31 ficaria: **5531983347898**.
                            <br /><br />
                        </Alert>
                    </DialogContentText>
                    <Alert severity='warning'>
                        Se você adicionar o número em um formato incorreto, você pode não receber seus lembretes e notificações.
                    </Alert>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} variant="contained" autoFocus>
                        Entendi
                    </Button>
                </DialogActions>
            </Dialog>
        </Stack>
    )
}