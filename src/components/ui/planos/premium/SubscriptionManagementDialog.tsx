'use client'
//appbora/src/components/ui/planos/premium/SubscriptionManagementDialog.tsx
import React from 'react'
import { useAppSelector } from '@/app/store/hooks'
import EventBusyIcon from '@mui/icons-material/EventBusy'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, CircularProgress, useTheme, Alert, Box } from '@mui/material'

interface Props {
    open: boolean
    onClose: () => void
}

export default function SubscriptionManagementDialog({ open, onClose }: Props) {
    const { user } = useAppSelector((state) => state.auth)
    const { data: subscription } = useAppSelector((state) => state.subscription)
    const [isRedirecting, setIsRedirecting] = React.useState(false)
    const theme = useTheme()

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
            window.location.href = url
        } catch (error) {
            console.error('Erro ao redirecionar:', error)
            setIsRedirecting(false)
        }
    }

    const isCanceling = subscription?.cancelAtPeriodEnd === true

    let endDate = ''
    if (subscription?.currentPeriodEnd) {
        const val = subscription.currentPeriodEnd as any
        const seconds = val.seconds || val._seconds || (typeof val === 'number' ? val : null)
        if (seconds) {
            endDate = new Date(seconds * 1000).toLocaleDateString('pt-BR')
        }
    }

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle fontWeight="bold">
                {isCanceling ? 'Assinatura Cancelada' : 'Gerenciar Assinatura'}
            </DialogTitle>
            <DialogContent>
                <Box display="flex" flexDirection="column" gap={2}>
                    {isCanceling ? (
                        <>
                            <Alert severity="warning" icon={<EventBusyIcon fontSize="inherit" />}>
                                Você cancelou a renovação automática.
                            </Alert>
                            <Typography variant="body1">
                                Seu acesso Premium continua <strong>ativo</strong> e liberado até:
                                <Box component="span" sx={{ display: 'block', fontSize: '1.5rem', fontWeight: 900, mt: 1 }}>
                                    {endDate}
                                </Box>
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Aproveite até lá! Se mudar de ideia, você pode reativar a renovação clicando no botão abaixo.
                            </Typography>
                        </>
                    ) : (
                        <Typography
                            fontWeight="bold"
                            variant="subtitle1"
                            sx={{ color: theme.palette.mode === 'dark' ? '#fff' : '#000' }}
                        >
                            Você será redirecionado para um portal seguro da Stripe para:
                            <ul>
                                <li>Alterar seu plano</li>
                                <li>Atualizar cartão de crédito</li>
                                <li>Ver histórico de faturas</li>
                                <li>Cancelar assinatura</li>
                            </ul>
                        </Typography>
                    )}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="inherit">Fechar</Button>
                <Button
                    onClick={handleManageSubscription}
                    variant="contained"
                    color={isCanceling ? "primary" : "primary"}
                    disabled={isRedirecting}
                >
                    {isRedirecting ? <CircularProgress size={24} color="inherit" /> : (isCanceling ? 'Reativar Assinatura' : 'Ir para o Portal')}
                </Button>
            </DialogActions>
        </Dialog>
    )
}