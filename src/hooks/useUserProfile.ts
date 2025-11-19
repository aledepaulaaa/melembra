//appbora/src/hooks/useUserProfile.ts
import React from "react"
import { resetUserPassword } from "@/app/actions/actions"
import { useSnackbar } from "@/contexts/SnackbarProvider"

export default function useUserProfile() {
    const { openSnackbar } = useSnackbar()
    const [dialogOpen, setDialogOpen] = React.useState(false)
    const [resetEmail, setResetEmail] = React.useState('')

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