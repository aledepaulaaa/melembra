'use client'
// melembra/src/components/forms/ReminderForm.tsx
import React from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../AuthManager'
import { motion, AnimatePresence } from 'framer-motion'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { ptBR } from 'date-fns/locale/pt-BR'
import { Box, TextField, IconButton, CircularProgress, Typography } from '@mui/material'
import SendIcon from '@mui/icons-material/Send'
import { ConversationStep, ReminderFormProps } from '@/interfaces/IReminderForm'
import useReminderForm from '@/hooks/forms/useReminderForm'
import * as Handlers from '../../app/lib/reminderFormHandlers'

// --- Componente ---
export default function ReminderForm({ onChatStart = () => { } }: ReminderFormProps) {
    const chatContainerRef = React.useRef<HTMLDivElement>(null)
    const router = useRouter()
    const { userId } = useAuth()
    const formState = useReminderForm()

    React.useEffect(() => {
        if (chatContainerRef.current)
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }, [formState.chatHistory, formState.isBotTyping])

    // Agrupa todas as props necessárias para os handlers em um único objeto
    const handlerProps = { ...formState, userId, router, onChatStart }

    const onUserSubmit = () => {
        Handlers.handleUserInput(handlerProps, formState.userInput, formState.chatHistory.length)
        formState.setUserInput('') // Limpa o input após o envio
    }

    const messageVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
            {/* 1. Contêiner Principal: display: 'flex' e height: '100%' para preencher a tela */}
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    bgcolor: 'transparent',
                    overflowX: 'hidden',
                }}
            >
                {/* 2. Área de Chat: flexGrow: 1 para ocupar todo o espaço restante e overflowY: 'auto' para rolagem */}
                <Box
                    ref={chatContainerRef}
                     sx={{ 
                    flexGrow: 1, 
                    overflowY: 'auto',
                    p: 2,
                    '&::-webkit-scrollbar': {
                        width: '8px',
                    },
                    '&::-webkit-scrollbar-track': {
                        background: 'transparent',
                    },
                    '&::-webkit-scrollbar-thumb': {
                        background: 'rgba(0,0,0,0.2)',
                        borderRadius: '4px',
                    },
                }}
            >
                    <AnimatePresence>
                        {formState.chatHistory.map((msg) => (
                            <motion.div key={msg.id} variants={messageVariants} initial="hidden" animate="visible" exit="hidden" layout>
                                <Box sx={{ display: 'flex', justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start', my: 1 }}>
                                    <Box sx={{ bgcolor: msg.sender === 'user' ? 'primary.main' : 'background.paper', p: 1.5, borderRadius: 2, maxWidth: '80%' }}>
                                        {msg.text && <Typography sx={{ whiteSpace: 'pre-wrap' }}>{msg.text}</Typography>}
                                        {msg.component && <Box mt={msg.text ? 1 : 0}>{msg.component}</Box>}
                                    </Box>
                                </Box>
                            </motion.div>
                        ))}
                        {formState.isBotTyping && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'flex-start', my: 1 }}>
                                    <Box sx={{ bgcolor: 'background.paper', p: 1.5, borderRadius: 2 }}>
                                        <Typography className="shimmer-text">Pensando...</Typography>
                                    </Box>
                                </Box>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </Box>
                {/* 3. Contêiner do Input: Ficará fixo no final, pois o chat pegou todo o espaço acima. */}
                <AnimatePresence>
                    {formState.showTextInput && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                        >
                            <Box className="animated-border"
                                sx={{
                                    borderRadius: '20px',
                                    display: "flex",
                                    justifyContent: "center",
                                    p: 1,
                                }}
                            >
                                <Box
                                    sx={{
                                        p: 2,
                                        display: 'flex',
                                        alignItems: 'center',
                                        width: '100%',
                                        borderRadius: '19px',
                                        bgcolor: 'var(--background)',
                                    }}
                                >
                                    <TextField
                                        fullWidth
                                        variant="outlined"
                                        multiline
                                        maxRows={4} value={formState.userInput}
                                        onChange={(e) => formState.setUserInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && onUserSubmit()}
                                        disabled={formState.isLoading}
                                        placeholder={formState.step === ConversationStep.ASKING_TITLE ? "Lembrar de..." : "DDD + Número ou Enter para pular"}
                                        autoFocus
                                        slotProps={{
                                            input: {
                                                sx: {
                                                    borderRadius: 4,
                                                    p: 4
                                                }
                                            }
                                        }}
                                    />
                                    <IconButton color="primary" onClick={onUserSubmit} disabled={formState.isLoading}>
                                        {formState.isLoading ? <CircularProgress size={24} /> : <SendIcon />}
                                    </IconButton>
                                </Box>
                            </Box>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Box>
        </LocalizationProvider>
    )
}