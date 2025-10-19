'use client'
// melemebra/src/components/ui/SubscriptionManagementDialog.tsx
import React from 'react'
import { useAppSelector } from '@/app/store/hooks'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, CircularProgress } from '@mui/material'

interface Props {
    open: boolean
    onClose: () => void
}

export default function SubscriptionManagementDialog({ open, onClose }: Props) {
    const { user } = useAppSelector((state) => state.auth)
    const [isRedirecting, setIsRedirecting] = React.useState(false)

    const handleManageSubscription = async () => {
        if (!user) return
        setIsRedirecting(true)

        try {
            const response = await fetch('/api/pagamentos/manage-plan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.uid }),
            })
            const { url } = await response.json()
            // Redireciona o usuário para o portal da Stripe
            window.location.href = url
        } catch (error) {
            console.error('Erro ao redirecionar para o portal:', error)
            setIsRedirecting(false)
        }
    }

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle fontWeight="bold">Gerenciar Assinatura Plus</DialogTitle>
            <DialogContent>
                <Typography fontWeight="bold" variant="h6">
                    Você será redirecionado para um portal seguro da Stripe para gerenciar seu plano, atualizar seu método de pagamento e ver seu histórico de faturas.
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} variant="outlined">Cancelar</Button>
                <Button onClick={handleManageSubscription} variant="contained" disabled={isRedirecting}>
                    {isRedirecting ? <CircularProgress size={24} /> : 'Ir para o Portal'}
                </Button>
            </DialogActions>
        </Dialog>
    )
}