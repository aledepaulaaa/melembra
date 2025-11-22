'use client'
//appbora/src/components/ui/UsageCountdown.tsx
import { Box, Chip, Typography } from '@mui/material'
import React from 'react'

function calculateTimeLeft(lastUsage: Date): string {
    const nextUsageTime = new Date(lastUsage)
    nextUsageTime.setDate(nextUsageTime.getDate() + 1) // Próximo dia
    nextUsageTime.setHours(0, 0, 0, 0) // Meia-noite do próximo dia

    const difference = nextUsageTime.getTime() - new Date().getTime()

    if (difference > 0) {
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24)
        const minutes = Math.floor((difference / 1000 / 60) % 60)
        const seconds = Math.floor((difference / 1000) % 60)
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    }

    return ''
}

export default function UsageCountdown({ lastUsageTime }: { lastUsageTime: Date }) {
    const [timeLeft, setTimeLeft] = React.useState(calculateTimeLeft(lastUsageTime))

    React.useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft(lastUsageTime))
        }, 1000)

        return () => clearInterval(timer)
    }, [lastUsageTime])

    if (!timeLeft) return null

    return (
        <Box>
            <Chip
                color="info"
                label={
                    <Typography variant="h5" fontWeight={700} color="primary">
                        {timeLeft}
                    </Typography>
                }
            />
        </Box>
    )
}