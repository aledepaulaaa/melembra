'use client'
//melembra/src/app/page.tsx
import { Box, Skeleton } from '@mui/material'
import { useAuth } from '@/components/AuthManager'
import ReminderFlow from '@/components/ui/ReminderFlow'

export default function Home() {
    const { loading } = useAuth()

    if (loading) {
        return (
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 4,
                }}
            >
                <Skeleton animation="wave" width="100%" />
                <Skeleton animation="wave" width="85%" />
                <Skeleton animation="wave" width="75%" />
            </Box>
        )
    }

    return (
        <Box
            sx={{
                // Ocupa 100% da altura do container pai (que é a 'main' do layout)
                height: '100%',
                width: '100%', // Corrigido o erro de digitação 'wdith'
                display: 'flex',
                flexDirection: 'column',
                // Alinha o conteúdo na parte de baixo
                justifyContent: 'flex-end',
            }}
        >
            <ReminderFlow />
        </Box>
    )
}