'use client'
// melembra/src/app/lembretes/page.tsx
import { Box, Skeleton } from '@mui/material'
import { useAuth } from '../../components/AuthManager'
import ReminderList from '../../components/ui/ReminderList'

export default function RemindersPage() {
    const { loading } = useAuth()

    if (loading) {
        return (
            <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 4 }}>
                <Skeleton animation="wave" width="100%" />
                <Skeleton animation="wave" width="85%" />
                <Skeleton animation="wave" width="75%" />
            </Box>
        )
    }

    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', p: 4 }}>
            <ReminderList />
        </Box>
    )
}
