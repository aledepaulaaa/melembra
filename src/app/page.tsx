'use client'
//bora-app/src/app/page.tsx
import React from 'react'
import { Box, Skeleton, Typography, useTheme } from '@mui/material'
import ReminderFlow from '@/components/forms/ReminderFlow'
import { AnimatePresence, motion } from 'framer-motion'
import WelcomeInstallDialog from '@/components/ui/dialogs/WelcomeInstallDialog'
import LogoAnimated from '@/components/ui/logo/LogoAnimated'
import { useAppSelector } from './store/hooks'

export default function Home() {
    const { status } = useAppSelector((state) => state.auth)
    const theme = useTheme()
    const [isChatStarted, setIsChatStarted] = React.useState(false)

    if (status === 'loading') {
        return (
            <Box
                sx={{
                    minHeight: '100vh',
                    width: "100%",
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 4,
                }}
            >
                <Skeleton animation="wave" height="30%" width="100%" />
                <Skeleton animation="wave" height="20%" width="100%" />
                <Skeleton animation="wave" height="10%" width="100%" />
            </Box>
        )
    }

    return (
        <Box
            sx={{
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                position: 'relative',
                zIndex: 0,
            }}
        >
            <WelcomeInstallDialog />
            <Box
                sx={{
                    flexGrow: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <AnimatePresence>
                    {!isChatStarted && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            <Box sx={{ display: "flex", gap: 1, alignItems: "center", mt: 10 }}>
                                <Typography
                                    variant="h1"
                                    fontWeight={900}
                                    textAlign="start"
                                    lineHeight={1}
                                    component="h1"
                                    sx={{ color: theme.palette.mode === 'dark' ? '#fff' : theme.palette.primary.main }}
                                >
                                    Bora
                                </Typography>
                                <LogoAnimated size={55} />
                            </Box>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Box>
            <ReminderFlow onChatStart={() => setIsChatStarted(true)} />
        </Box>
    )
}