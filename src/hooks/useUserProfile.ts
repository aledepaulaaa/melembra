// melemebra/src/hooks/useUserProfile.ts (VERSÃO SIMPLIFICADA)
import { useState } from "react"
import { resetUserPassword } from "@/app/actions/actions"
import { useSnackbar } from "@/contexts/SnackbarProvider"

export default function useUserProfile() {
    const { openSnackbar } = useSnackbar()
    const [dialogOpen, setDialogOpen] = useState(false)
    const [resetEmail, setResetEmail] = useState('')

    const handlePasswordReset = async () => {
        if (!resetEmail) return
        const result = await resetUserPassword(resetEmail)
        if (result.success) {
            openSnackbar('Um link para redefinir a senha foi enviado para o seu e-mail.', 'success')
        } else {
            openSnackbar('Falha ao enviar o link. Verifique o e-mail e tente novamente.', 'error')
        }
        setDialogOpen(false)
    }

    return {
        dialogOpen,
        setDialogOpen,
        resetEmail,
        setResetEmail,
        handlePasswordReset,
    }
}