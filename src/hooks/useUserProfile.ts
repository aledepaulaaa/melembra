import { resetUserPassword } from "@/app/actions/actions"
import { auth } from "@/app/lib/firebase"
import { useAuth } from "@/components/AuthManager"
import { updateEmail, updatePassword } from "firebase/auth"
import { useState } from "react"

export default function useUserProfile() {
    const { userId } = useAuth()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [resetEmail, setResetEmail] = useState('')

    const handleLinkAccount = async () => {
        if (!userId || !email || !password) return
        try {
            // Este passo requer que o usuário tenha reautenticado recentemente
            await updateEmail(auth.currentUser!, email)
            await updatePassword(auth.currentUser!, password)
            alert('Conta associada com sucesso!')
        } catch (error) {
            console.error('Erro ao linkar conta:', error)
            alert('Falha ao associar conta. Tente novamente.')
        }
    }

    const handlePasswordReset = async () => {
        if (!resetEmail) return
        const result = await resetUserPassword(resetEmail)
        if (result.success) {
            alert('Um link para redefinir a senha foi enviado para o seu e-mail.')
        } else {
            alert('Falha ao enviar o link. Verifique o e-mail e tente novamente.')
        }
        setDialogOpen(false)
    }

    return {
        showPassword,
        setShowPassword,
        setPassword,
        password,
        setDialogOpen,
        resetEmail,
        dialogOpen,
        setResetEmail,
        handleLinkAccount,
        handlePasswordReset,
        email,
        setEmail
    }
}