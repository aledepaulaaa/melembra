'use client'
//appbora/src/components/ui/layout/SubscriptionStatusFooter.tsx
import React from 'react'
import { useRouter } from 'next/navigation'
import { useAppSelector } from '@/app/store/hooks'
import DiamondOutlinedIcon from '@mui/icons-material/DiamondOutlined'
import EventBusyIcon from '@mui/icons-material/EventBusy'
import { Box, Button, Chip, CircularProgress, IconButton, Tooltip } from '@mui/material'
import SubscriptionManagementDialog from '@/components/ui/planos/premium/SubscriptionManagementDialog'

export default function SubscriptionStatusFooter({ desktopOpen }: { desktopOpen: boolean }) {
    const router = useRouter()
    const { plan, status, data } = useAppSelector((state) => state.subscription)
    const [dialogOpen, setDialogOpen] = React.useState(false)

    if (status === 'loading') {
        return <Box sx={{ height: 68, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CircularProgress size={24} /></Box>
    }

    const isPremiumOrPlus = plan === 'plus' || plan === 'premium'

    // Verifica se está cancelado (mas ainda ativo até o fim do período)
    const isCanceling = data?.cancelAtPeriodEnd === true

    // Formata Data com Segurança Extrema
    // O Firestore pode retornar: { seconds: ... }, { _seconds: ... } ou apenas o número dependendo da serialização
    let endDate = ''
    if (data?.currentPeriodEnd) {
        const val = data.currentPeriodEnd as any
        const seconds = val.seconds || val._seconds || (typeof val === 'number' ? val : null)

        if (seconds) {
            endDate = new Date(seconds * 1000).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
        }
    }

    // --- RENDERIZAÇÃO EXPANDIDA (SIDENAV ABERTO) ---
    const expandedContent = (
        <Box sx={{ p: 2 }}>
            {isPremiumOrPlus ? (
                <Chip
                    icon={isCanceling ? <EventBusyIcon /> : <DiamondOutlinedIcon />}
                    // Lógica do texto: Se cancelando, mostra data. Se não, mostra nome do plano.
                    label={isCanceling ? `Expira em ${endDate}` : `Bora ${plan.charAt(0).toUpperCase() + plan.slice(1)}`}
                    color={isCanceling ? "warning" : "default"}
                    variant={isCanceling ? "filled" : "outlined"}
                    sx={{
                        width: '100%',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        // Se for warning (amarelo), garantimos contraste no texto
                        color: isCanceling ? '#000' : 'inherit'
                    }}
                    onClick={() => setDialogOpen(true)}
                />
            ) : (
                <Button
                    variant="outlined"
                    startIcon={<DiamondOutlinedIcon />}
                    fullWidth
                    onClick={() => router.push('/planos')}
                >
                    Assinar
                </Button>
            )}
        </Box>
    )

    // --- RENDERIZAÇÃO ENCOLHIDA (SIDENAV FECHADO) ---
    const collapsedContent = (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 68 }}>
            {isPremiumOrPlus ? (
                <Tooltip title={isCanceling ? `Cancelado. Expira: ${endDate}` : "Gerenciar Assinatura"} placement="right">
                    <IconButton
                        color={isCanceling ? "warning" : "primary"}
                        onClick={() => setDialogOpen(true)}
                    >
                        {isCanceling ? <EventBusyIcon /> : <DiamondOutlinedIcon />}
                    </IconButton>
                </Tooltip>
            ) : (
                <Tooltip title="Fazer Upgrade" placement="right">
                    <IconButton onClick={() => router.push('/planos')} color="primary">
                        <DiamondOutlinedIcon />
                    </IconButton>
                </Tooltip>
            )}
        </Box>
    )

    return (
        <>
            {desktopOpen ? expandedContent : collapsedContent}
            <SubscriptionManagementDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
        </>
    )
}