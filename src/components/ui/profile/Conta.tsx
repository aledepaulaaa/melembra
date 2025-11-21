'use client'
//appbora/src/components/ui/profile/Conta.tsx
import { useAppSelector } from '@/app/store/hooks'
import { Paper, Skeleton, Typography, Stack } from '@mui/material'
import { useRouter } from 'next/navigation'
import EditarDadosConta from './EditarDadosConta'

export default function Conta() {
    const { user, status } = useAppSelector((state) => state.auth)
    const router = useRouter()

    if (status === 'loading') {
        return <Skeleton variant="rounded" width="100%" height={300} />
    }

     if (!user) {
        router.push('/login')
        return null // Evita renderizar o resto do componente
    }

     return (
        <Paper elevation={0} sx={{ p: 3, borderRadius: 2, mt: 2, width: '100%', boxShadow: 0 }}>
            <Stack spacing={2}>
                <Typography variant="h6" fontWeight={700} gutterBottom>Meus Dados</Typography>
                <EditarDadosConta />
            </Stack>
        </Paper>
    )
}