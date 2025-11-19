'use client'
//bora-app/src/app/configuracoes/page.tsx
import { Box, Typography, Paper } from '@mui/material'
import InstallPrompt from "@/components/ui/pwa/InstallPrompt"

export default function PreferenciasPage() {
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <Paper
                elevation={0}
                sx={{
                    p: 1,
                    width: '100%',
                    maxWidth: 600,
                    borderRadius: 4,
                    textAlign: 'center',
                    boxShadow: 'none',
                }}
            >
                <Typography variant="h4" m={2} component="h2" fontWeight={900} gutterBottom>Instale o Aplicativo</Typography>
                <InstallPrompt />
            </Paper>
        </Box>
    )
}