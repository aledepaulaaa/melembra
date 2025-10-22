'use client'
//melembra/src/app/configuracoes/page.tsx
import Link from 'next/link'
import { useAppSelector } from '@/app/store/hooks'
import InstallPrompt from "@/components/ui/pwa/InstallPrompt"
import PushNotificationManager from '@/components/ui/pwa/PushNotificationManager'
import TipNotificationToggle from '@/components/ui/theme/TipNotificationToggle'
import { Box, Typography, Paper, Skeleton, Button, Stack } from '@mui/material'

export default function SettingsPage() {
    // 2. Ler o estado de autenticação diretamente do Redux
    const { user, status } = useAppSelector((state) => state.auth)

    // Componente auxiliar para o estado de carregamento
    const LoadingState = () => (
        <Stack spacing={2} sx={{ p: 2, width: '100%' }}>
            <Skeleton variant="rounded" height={100} />
            <Skeleton variant="rounded" height={150} />
            <Skeleton variant="rounded" height={80} />
        </Stack>
    )

    // Componente auxiliar para usuários deslogados
    const UnauthenticatedState = () => (
        <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>Acesse sua conta</Typography>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
                Para gerenciar suas configurações, você precisa criar uma conta ou fazer login.
            </Typography>
            <Button variant="contained" component={Link} href="/perfil">
                Ir para a Página de Perfil
            </Button>
        </Box>
    )

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                py: 4, // Ajuste de espaçamento
                px: 2,
            }}
        >
            <Paper sx={{ p: 1, width: '100%', maxWidth: 600, borderRadius: 4 }}>
                <Typography variant="h4" m={2} component="h2" fontWeight={900} textAlign="center" gutterBottom>
                    Configurações
                </Typography>
                {/* O InstallPrompt é público e pode ser exibido sempre */}
                <InstallPrompt />
                {status === 'loading' ? (
                    <LoadingState />
                ) : status === 'authenticated' && user ? (
                    // Se o usuário estiver autenticado, mostra as configurações
                    <>
                        <PushNotificationManager />
                        {/* <TipNotificationToggle /> */}
                    </>
                ) : (
                    // Se estiver deslogado, mostra o prompt para fazer login
                    <UnauthenticatedState />
                )}
            </Paper>
        </Box>
    )
}