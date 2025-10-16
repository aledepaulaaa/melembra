'use client'
//melembra/src/app/page.tsx
import React from 'react'
import { Box, Skeleton, Typography } from '@mui/material'
import { useAuth } from '@/components/AuthManager'
import ReminderFlow from '@/components/ui/ReminderFlow'
import { AnimatePresence, motion } from 'framer-motion'
import LogoMeLembra from '@/components/ui/LogoMeLembra'

export default function Home() {
    const { loading } = useAuth()
    const [isChatStarted, setIsChatStarted] = React.useState(false)

    if (loading) {
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
            }}
        >
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
                            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                                <Typography variant="h4" textAlign="start" component="h1">
                                    Me <br />Lembra?
                                </Typography>
                                <LogoMeLembra size={65} />
                            </Box>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Box>
            <ReminderFlow onChatStart={() => setIsChatStarted(true)} />
        </Box>
    )
}