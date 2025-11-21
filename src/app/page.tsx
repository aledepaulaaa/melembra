'use client'
// appbora/src/app/page.tsx
import React from 'react'
import { Box, Skeleton, Typography, useTheme } from '@mui/material'
import ReminderFlow from '@/components/forms/ReminderFlow'
import { AnimatePresence, motion } from 'framer-motion'
import WelcomeInstallDialog from '@/components/ui/dialogs/WelcomeInstallDialog'
import LogoAnimated from '@/components/ui/logo/LogoAnimated'
import { useAppDispatch, useAppSelector } from './store/hooks'
import { useRouter } from 'next/navigation'
import { useSnackbar } from '@/contexts/SnackbarProvider'
import { saveReminder } from '@/app/actions/actions'
import { getDownloadURL, ref, uploadString } from 'firebase/storage'
import { storage } from './lib/firebase'
import { addChatMessage } from './store/slices/reminderSlice'

export default function Home() {
    const authState = useAppSelector((state) => state.auth)
    const { status, user } = authState
    const theme = useTheme()
    const router = useRouter()
    const dispatch = useAppDispatch()
    const { openSnackbar } = useSnackbar()
    const [isChatStarted, setIsChatStarted] = React.useState(false)

    // --- useEffect para processar o lembrete pendente ---
    React.useEffect(() => {
        if (status === 'authenticated' && user?.uid) {
            const pendingDataJSON = localStorage.getItem('pendingBoraData')
            if (pendingDataJSON) {
                const { reminder: pendingReminder, history } = JSON.parse(pendingDataJSON)
                localStorage.removeItem('pendingBoraData')

                const savePendingReminder = async () => {
                    let imageUrl = ''
                    // 1. Lida com o upload da imagem se ela existir
                    if (pendingReminder.imageBase64) {
                        try {
                            const storageRef = ref(storage, `reminders/${user.uid}/${Date.now()}_lembrete.png`)
                            const snapshot = await uploadString(storageRef, pendingReminder.imageBase64, 'data_url')
                            imageUrl = await getDownloadURL(snapshot.ref)
                        } catch (uploadError) {
                            console.error("Erro no upload da imagem pendente:", uploadError)
                            openSnackbar("Falha ao salvar a imagem anexada.", "error")
                        }
                    }

                    // 2. Salva o lembrete com ou sem a URL da imagem
                    const result = await saveReminder(
                        pendingReminder.title, new Date(pendingReminder.date), user.uid,
                        pendingReminder.recurrence, pendingReminder.cor,
                        pendingReminder.sobre, imageUrl
                    )

                    // 3. Atualiza a UI do Chat
                    if (result.success) {
                        openSnackbar('Seu lembrete foi salvo com sucesso!', 'success')

                        // Recria a mensagem de sucesso e a adiciona ao histórico existente
                        const successMessage = {
                            id: Date.now(),
                            sender: 'bot' as const,
                            text: 'Seu lembrete foi criado!',
                        }

                        // Despachamos a mensagem final para o histórico do chat no Redux
                        dispatch(addChatMessage(successMessage))
                    } else {
                        openSnackbar(result.error || 'Falha ao salvar lembrete pendente.', 'error')
                    }
                }
                savePendingReminder()
            }
        }
    }, [status, user, openSnackbar, router, dispatch])


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
                overflow: 'hidden',
                flexDirection: 'column',
                width: '100%',
                position: 'relative',
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
                            transition={{ duration: 0.8, ease: "easeInOut" }}
                            exit={{ opacity: 0, y: -10 }}
                            animate={{
                                opacity: isChatStarted ? 0.1 : 1,
                                scale: isChatStarted ? 0.9 : 1,
                                filter: isChatStarted ? 'blur(6px)' : 'blur(0px)',
                                y: isChatStarted ? -50 : 0
                            }}
                        >
                            <Box sx={{ display: "flex", gap: 1, alignItems: "center", mt: 15, pb: 2 }}>
                                <LogoAnimated size={55} />
                                <Typography
                                    lineHeight={1}
                                    fontWeight={900}
                                    variant="h2"
                                    textAlign="start"
                                    component="h2"
                                    sx={{ color: theme.palette.mode === 'dark' ? '#fff' : theme.palette.primary.main }}
                                >
                                    Bora
                                </Typography>
                            </Box>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Box>
            <Box sx={{ flexGrow: 1, zIndex: 10, position: 'relative' }}>
                <ReminderFlow onChatStart={() => setIsChatStarted(true)} />
            </Box>
        </Box>
    )
}