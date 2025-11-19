// melemebra/src/hooks/useUserCreateProfile.ts
import React from 'react'
import { createUser } from '@/app/actions/actions'
import { initialUser, IUserData } from '@/interfaces/IUserData'
import { useSnackbar } from '@/contexts/SnackbarProvider'
import { auth } from '@/app/lib/firebase'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { useRouter } from 'next/navigation'

export default function useUserCreateProfile() {
    const router = useRouter()
    const { openSnackbar } = useSnackbar()
    const [isLoading, setIsLoading] = React.useState(false)
    const [formData, setFormData] = React.useState<IUserData>(initialUser)
    const [showPassword, setShowPassword] = React.useState(false)

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleCreateAccount = async () => {
        const { name, email, password, whatsappNumber } = formData
        if (!email || !password || !name || !whatsappNumber) {
            openSnackbar('Nome, E-mail, Senha e WhatsApp são obrigatórios.', 'error')
            return
        }
        setIsLoading(true)

        const result = await createUser({ email, password, name, whatsappNumber })

        if (result.success) {
            openSnackbar('Conta criada com sucesso! Autenticando...', 'success')
            
            try {
                // Isso GARANTE que o onAuthStateChanged dispare imediatamente.
                await signInWithEmailAndPassword(auth, email, password)
                // A UI vai atualizar sozinha AGORA por causa do onAuthStateChanged.
                router.push('/')
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