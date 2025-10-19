'use client'
//melembra/src/components/ui/TipNotificationToggle.tsx
import React, { useState, useEffect } from 'react'
import {
    FormControlLabel,
    Switch,
    Typography,
    Box,
    Paper,
    Skeleton,
} from '@mui/material'
import { useAuth } from '@/components/ui/auth/AuthManager'
import { getUserPreferences, saveUserPreferences } from '@/app/actions/actions'

export default function TipNotificationToggle() {
    const { userId } = useAuth()
    const [enabled, setEnabled] = useState(true)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchPreferences = async () => {
            if (!userId) return
            const prefs = await getUserPreferences(userId)
            if (prefs.success && prefs.preferences) {
                setEnabled(prefs.preferences.enableTips)
            }
            setLoading(false)
        }

        fetchPreferences()
    }, [userId])

    const handleToggle = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const newState = event.target.checked
        setEnabled(newState)
        if (userId) {
            await saveUserPreferences(userId, { enableTips: newState })
        }
    }

    if (loading) {
        return <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 2, mb: 2 }} />
    }

    return (
        <Paper elevation={0} sx={{ mt: 2, p: 2, mb: 2, borderRadius: 2, boxShadow: 0 }}>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}
            >
                <Typography variant="body1" fontWeight={700}>Ativar Dicas do App</Typography>
                <FormControlLabel
                    control={<Switch checked={enabled} onChange={handleToggle} />}
                    label={enabled ? 'Ativado' : 'Desativado'}
                    labelPlacement="start"
                />
            </Box>
        </Paper>
    )
}