// melemebra/src/hooks/useUserLogin.ts
import { useState } from 'react'
import { auth } from '@/app/lib/firebase'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { resetUserPassword } from '@/app/actions/actions'
import { useSnackbar } from '@/contexts/SnackbarProvider'
import { useRouter } from 'next/navigation'

export default function useUserLogin() {
    const router = useRouter()
    const { openSnackbar } = useSnackbar()
    const [isLoading, setIsLoading] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [resetEmail, setResetEmail] = useState('')

    const handleLogin = async () => {
        if (!email || !password) {
            openSnackbar('E-mail e senha são obrigatórios.', 'error')
            return
        }
        setIsLoading(true)
        try {
            await signInWithEmailAndPassword(auth, email, password)
            openSnackbar('Login efetuado com sucesso!', 'success')
            router.push('/')
            // O onAuthStateChanged vai cuidar de atualizar a UI
        } catch (error: any) {
            // Lida com erros comuns do Firebase
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                openSnackbar('E-mail ou senha inválidos.', 'error')
            } else {
                openSnackbar('Problema ao fazer login. Verifique os dados ou crie uma conta!', 'error')
            }
        } finally {
            setIsLoading(false)
        }
    }

    const handlePasswordReset = async () => {
        if (!resetEmail) {
            openSnackbar('Por favor, digite seu e-mail para redefinir a senha.', 'warning')
            return
        }
        const result = await resetUserPassword(resetEmail)
        if (result.success) {
            openSnackbar('Link para redefinir a senha enviado. Verifique seu spam.', 'info')
        } else {
            openSnackbar('Falha ao enviar o link.', 'error')
        }
        setDialogOpen(false)
    }

    return {
        isLoading, email, setEmail, password, resetEmail,
        setResetEmail, setPassword, showPassword,
        toggleShowPassword: () => setShowPassword(p => !p),
        handleLogin, handlePasswordReset, dialogOpen,
        openResetDialog: () => setDialogOpen(true),
        closeResetDialog: () => setDialogOpen(false),
    }
}