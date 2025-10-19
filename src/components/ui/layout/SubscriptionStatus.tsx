'use client'
// melembra/src/components/ui/SubscriptionStatus.tsx
import React from 'react'
import { useRouter } from 'next/navigation'
import { useAppSelector } from '@/app/store/hooks'
import DiamondOutlinedIcon from '@mui/icons-material/DiamondOutlined'
import { Box, Button, Chip, CircularProgress, IconButton, Tooltip } from '@mui/material'
import SubscriptionManagementDialog from '../planos/premium/SubscriptionManagementDialog'

export default function SubscriptionStatusFooter({ desktopOpen }: { desktopOpen: boolean }) {
    const router = useRouter()
    const { plan, status } = useAppSelector((state) => state.subscription)
    const [dialogOpen, setDialogOpen] = React.useState(false)

    if (status === 'loading') {
        return <Box sx={{ height: 68, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CircularProgress size={24} /></Box>
    }

    // Componente para o menu expandido
    const expandedContent = (
        <Box sx={{ p: 2 }}>
            {plan === 'plus' ? (
                <Chip
                    icon={<DiamondOutlinedIcon />}
                    label="Me Lembra Plus"
                    color="primary"
                    sx={{ width: '100%', cursor: 'pointer' }}
                    onClick={() => setDialogOpen(true)}
                />
            ) : (
                <Button variant="outlined" startIcon={<DiamondOutlinedIcon />} fullWidth onClick={() => router.push('/planos')}>
                    Assinar Plus
                </Button>
            )}
        </Box>
    )

    // Componente para o menu encolhido
    const collapsedContent = (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 68 }}>
            {plan === 'plus' ? (
                <Tooltip title="Gerenciar Assinatura" placement="right">
                    <IconButton color="primary" onClick={() => setDialogOpen(true)}>
                        <DiamondOutlinedIcon />
                    </IconButton>
                </Tooltip>
            ) : (
                <Tooltip title="Fazer Upgrade para o Plus" placement="right">
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