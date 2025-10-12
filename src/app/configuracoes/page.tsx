'use client'
//melembra/src/app/configuracoes/page.tsx
import React from 'react'
import { Box, Typography, Paper } from '@mui/material'
import InstallPrompt from "@/components/InstallPrompt"
import PushNotificationManager from '@/components/PushNotificationManager'
import UserProfile from '@/components/ui/UserProfile'
import TipNotificationToggle from '@/components/ui/TipNotificationToggle'

export default function SettingsPage() {
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
            <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 600, borderRadius: 4, textAlign: 'center' }}>
                <Typography variant="h4" component="h2" gutterBottom>Configurações</Typography>
                <InstallPrompt />
                <PushNotificationManager />
                <UserProfile />
                <TipNotificationToggle />
            </Paper>
        </Box>
    )
}