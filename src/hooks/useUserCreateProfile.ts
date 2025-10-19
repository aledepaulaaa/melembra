// melemebra/src/hooks/useUserCreateProfile.ts (VERSÃO CORRIGIDA)
import React from 'react'
import { useAppSelector } from '@/app/store/hooks'
import { createUser, linkEmailToAnonymousUser, saveUserProfile } from '@/app/actions/actions'
import { initialUser, IUserData } from '@/interfaces/IUserData'
import { useSnackbar } from '@/contexts/SnackbarProvider'
import { auth } from '@/app/lib/firebase'
import { signInWithEmailAndPassword } from 'firebase/auth'

export default function useUserCreateProfile() {
    const { user } = useAppSelector((state) => state.auth)
    const { openSnackbar } = useSnackbar()
    const [isLoading, setIsLoading] = React.useState(false)
    const [formData, setFormData] = React.useState<IUserData>(initialUser)
    const [showPassword, setShowPassword] = React.useState(false)

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleCreateAccount = async () => {
        const { name, email, password, nickname, whatsappNumber } = formData
        if (!email || !password || !name) {
            openSnackbar('Nome, e--mail e senha são obrigatórios.', 'error')
            return
        }
        setIsLoading(true)

        let result: { success: boolean; error?: string; userId?: string }

        if (user && user.isAnonymous) {
            result = await linkEmailToAnonymousUser(user.uid, email, password)
            if (result.success) {
                await saveUserProfile(user.uid, { name, nickname, whatsappNumber, email, userId: user.uid })
            }
        } else {
            result = await createUser({ email, password, name, nickname, whatsappNumber })
        }

        if (result.success) {
            openSnackbar('Conta criada com sucesso! Autenticando...', 'success')
            
            try {
                // Isso GARANTE que o onAuthStateChanged dispare imediatamente.
                await signInWithEmailAndPassword(auth, email, password)
                // A UI vai atualizar sozinha AGORA por causa do onAuthStateChanged.
            } catch (loginError) {
                // Em um caso raro de falha no login logo após a criação
                openSnackbar('Erro ao autenticar. Por favor, tente fazer login manualmente.', 'warning')
            }

        } else {
            openSnackbar(result.error || 'Falha ao criar conta. Verifique os dados.', 'error')
        }

        setIsLoading(false)
    }

    return {
        isLoading,
        formData,
        handleInputChange,
        handleCreateAccount,
        showPassword,
        toggleShowPassword: () => setShowPassword(prev => !prev),
    }
}