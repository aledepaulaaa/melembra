'use client'
//appbora/src/app/lembretes/page.tsx
import { Box, Skeleton } from '@mui/material'
import ReminderList from '../../components/ui/listalembretes/ReminderList'
import { useAppSelector } from '../store/hooks'

export default function RemindersPage() {
    const { status } = useAppSelector((state) => state.auth)

    if (status === 'loading') {
        return (
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 1
                }}
            >
                <Skeleton animation="wave" width="100%" />
                <Skeleton animation="wave" width="85%" />
                <Skeleton animation="wave" width="75%" />
            </Box>
        )
    }

    return (
        <ReminderList />
    )
}
