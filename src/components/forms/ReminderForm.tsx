'use client'
// appbora/src/components/forms/ReminderForm.tsx
import React from 'react'
import * as Handlers from './reminderFormHandlers'
import * as UI from './reminderFormUI'
import { ptBR } from 'date-fns/locale/pt-BR'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import SendIcon from '@mui/icons-material/Send'
import DiamondOutlinedIcon from '@mui/icons-material/DiamondOutlined'
import KeyboardVoiceOutlinedIcon from '@mui/icons-material/KeyboardVoiceOutlined'
import TextsmsOutlinedIcon from '@mui/icons-material/TextsmsOutlined'
import StopCircleOutlinedIcon from '@mui/icons-material/StopCircleOutlined'
import MicIcon from '@mui/icons-material/Mic' // Opcional, para animação se quiser

import { ConversationStep, ReminderFormProps } from '@/interfaces/IReminder'
import useReminderForm from '@/hooks/forms/useReminderForm'
import { useAppSelector } from '@/app/store/hooks'
import { db } from '@/app/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { isToday } from 'date-fns'
import UsageCountdown from '@/components/ui/planos/upgradeplanos/UsageCountdown'
import { useSnackbar } from '@/contexts/SnackbarProvider'
import AuthPromptDialog from '@/components/ui/dialogs/AuthPromptDialog'
import { Box, TextField, IconButton, CircularProgress, Typography, Button, Paper, Tooltip, Stack } from '@mui/material'

const UpgradeBlocker = ({ lastUsage }: { lastUsage: Date | null }) => {
    const router = useRouter()
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 4 }}>
                <Typography variant="h6" fontWeight={700}>Limite diário atingido!</Typography>
                <Typography sx={{ my: 1 }}>Seu próximo lembrete gratuito estará disponível em:</Typography>
                {lastUsage && <UsageCountdown lastUsageTime={lastUsage} />}
                <Typography sx={{ my: 2 }}>Para criar lembretes ilimitados, assine o plus.</Typography>
                <Button startIcon={<DiamondOutlinedIcon />} variant="outlined" onClick={() => router.push('/planos')}>
                    Assinar
                </Button>
            </Paper>
        </motion.div>
    )
}

export default function ReminderForm({ onChatStart = () => { } }: ReminderFormProps) {
    const chatContainerRef = React.useRef<HTMLDivElement>(null)
    const router = useRouter()
    const formState = useReminderForm()
    // Destruturando o audioRecorder do nosso hook atualizado
    const { audioRecorder } = formState

    const subscription = useAppSelector((state) => state.subscription)
    const { plan, status: subStatus } = subscription
    const { openSnackbar } = useSnackbar()
    const [isBlocked, setIsBlocked] = React.useState(false)
    const [lastUsage, setLastUsage] = React.useState<Date | null>(null)
    const { user, status: authStatus } = useAppSelector((state) => state.auth)
    const userId = user?.uid

    // --- Lógica de Bloqueio (Planos) ---
    React.useEffect(() => {
        const checkUsage = async () => {
            if (plan === 'free' && userId && subStatus !== 'loading') {
                const userDocRef = doc(db, 'users', userId)
                const userDoc = await getDoc(userDocRef)
                const usageTimestamp = userDoc.data()?.lastFreeReminderAt?.toDate()
                if (usageTimestamp && isToday(usageTimestamp)) {
                    setIsBlocked(true)
                    setLastUsage(usageTimestamp)
                } else {
                    setIsBlocked(false)
                    setLastUsage(null)
                }
            } else {
                setIsBlocked(false)
                setLastUsage(null)
            }
        }
        checkUsage()
    }, [plan, userId, subStatus])

    // Scroll automático
    React.useEffect(() => {
        if (chatContainerRef.current)
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }, [formState.chatHistory, formState.isBotTyping])

    // Props unificadas para os Handlers
    const handlerProps = { ...formState, userId, router, onChatStart, subscription, openSnackbar }

    // --- PROCESSAMENTO DE ÁUDIO ---
    // Monitora quando o blob de áudio é gerado (ao soltar o botão ou acabar o tempo)
    React.useEffect(() => {
        if (audioRecorder.audioBlob) {
            // Chama o handler que criamos na Etapa 3
            Handlers.handleVoiceProcess(handlerProps, audioRecorder.audioBlob)
            // Reseta o áudio para permitir nova gravação limpa
            audioRecorder.resetAudio()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [audioRecorder.audioBlob])

    const onUserSubmit = () => {
        Handlers.handleUserInput(handlerProps, formState.userInput, formState.chatHistory.length)
        formState.setUserInput('')
    }

    const messageVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }

    if (authStatus === 'loading') return <CircularProgress />
    if (isBlocked) return <UpgradeBlocker lastUsage={lastUsage} />

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
            <Box sx={{ display: 'flex', flexDirection: 'column', bgcolor: 'transparent', overflow: 'hidden', height: '100%', position: 'relative' }}>
                {/* --- BOTÃO NOVO CHAT (Canto Superior Direito) --- */}
                {formState.chatHistory.length > 0 && (
                    <Box sx={{ position: 'absolute', top: 10, right: 15, zIndex: 10 }}>
                        <Tooltip title="Novo Lembrete">
                            <IconButton
                                onClick={() => Handlers.handleNewChat(handlerProps)}
                                sx={{
                                    bgcolor: 'background.paper',
                                    boxShadow: 1,
                                    '&:hover': { bgcolor: 'background.default' }
                                }}
                                size="large"
                            >
                                <TextsmsOutlinedIcon color="primary" fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Box>
                )}
                {/* --- ÁREA DE CHAT --- */}
                <Box ref={chatContainerRef} sx={{ flexGrow: 1, overflowY: 'auto', p: 2, pb: 10, '&::-webkit-scrollbar': { width: '8px' } }}>
                    <AnimatePresence>
                        {formState.chatHistory.map((msg, index) => {
                            const isLastBotMessage = msg.sender === 'bot' && index === formState.chatHistory.length - 1
                            const lastUserMessage = [...formState.chatHistory].reverse().find(m => m.sender === 'user')?.text

                            return (
                                <motion.div key={msg.id} variants={messageVariants} initial="hidden" animate="visible" exit="hidden" layout>
                                    <Box sx={{ display: 'flex', justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start', my: 1 }}>
                                        <Box sx={{ bgcolor: msg.sender === 'user' ? 'primary.main' : 'background.paper', p: 1.5, borderRadius: 2, maxWidth: '80%' }}>
                                            {msg.text && <Typography sx={{ whiteSpace: 'pre-wrap' }}>{msg.text}</Typography>}
                                            {msg.text === 'Seu lembrete foi criado!' && (
                                                <Button variant="outlined" sx={{ mt: 1 }} onClick={() => router.push('/lembretes')}>
                                                    Ver meus lembretes
                                                </Button>
                                            )}
                                            {/* Renderização condicional dos passos do fluxo */}
                                            {isLastBotMessage && formState.step === ConversationStep.ASKING_DATE && <UI.RenderDatePicker {...handlerProps} />}
                                            {isLastBotMessage && formState.step === ConversationStep.ASKING_TIME && <UI.RenderTimeClockWithConfirm {...handlerProps} />}
                                            {isLastBotMessage && formState.step === ConversationStep.ASKING_RECURRENCE && <UI.RenderRecurrenceButtons {...handlerProps} formattedTime={formState.reminder.time || ''} />}

                                            {isLastBotMessage && formState.step === ConversationStep.ASKING_CUSTOMIZATION && lastUserMessage === 'Sim, quero personalizar.' && (
                                                <UI.RenderFullCustomizationForm {...handlerProps} />
                                            )}
                                            {isLastBotMessage && formState.step === ConversationStep.ASKING_CUSTOMIZATION && lastUserMessage !== 'Sim, quero personalizar.' && (
                                                <UI.RenderCustomizationPrompt {...handlerProps} />
                                            )}
                                            {isLastBotMessage && formState.step === ConversationStep.CONFIRMING && <UI.RenderConfirmation {...handlerProps} />}
                                        </Box>
                                    </Box>
                                </motion.div>
                            )
                        })}
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
                {/* --- ÁREA DE INPUT / GRAVAÇÃO --- */}
                <AnimatePresence>
                    {formState.showTextInput && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}>
                            <Box className="animated-border" sx={{ borderRadius: '20px', display: "flex", justifyContent: "center", p: 1 }}>
                                <Box
                                    sx={{
                                        p: 1,
                                        pl: 2,
                                        display: 'flex',
                                        alignItems: 'center',
                                        width: '100%',
                                        borderRadius: '19px',
                                        bgcolor: 'var(--background)',
                                        minHeight: '64px' // Altura fixa para evitar pulos na troca de UI
                                    }}
                                >
                                    {/* --- MODO GRAVAÇÃO --- */}
                                    {audioRecorder.isRecording ? (
                                        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ width: '100%', px: 1 }}>
                                            <Stack direction="row" alignItems="center" spacing={2}>
                                                {/* Ícone de Microfone Pulsando (Substitui a bolinha) */}
                                                <motion.div
                                                    animate={{
                                                        scale: [1, 1.2, 1],
                                                        opacity: [0.5, 1, 0.5]
                                                    }}
                                                    transition={{
                                                        repeat: Infinity,
                                                        duration: 1.5,
                                                        ease: "easeInOut"
                                                    }}
                                                >
                                                    <MicIcon color="error" sx={{ fontSize: 28 }} />
                                                </motion.div>

                                                {/* Texto do Timer com largura fixa para não tremer */}
                                                <Typography variant="body1" color="error" fontWeight={600}>
                                                    <Box component="span" sx={{ minWidth: '45px', display: 'inline-block' }}>
                                                        0:{audioRecorder.timeLeft < 10 ? `0${audioRecorder.timeLeft}` : audioRecorder.timeLeft}
                                                    </Box>
                                                </Typography>
                                            </Stack>
                                            <Tooltip title="Parar e Enviar">
                                                <IconButton
                                                    onClick={audioRecorder.stopRecording}
                                                    color="error"
                                                    sx={{ border: '1px solid', borderColor: 'error.main' }}
                                                >
                                                    <StopCircleOutlinedIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </Stack>
                                    ) : (
                                        /* --- MODO TEXTO (PADRÃO) --- */
                                        <>
                                            <TextField
                                                fullWidth
                                                variant="standard" // Standard para limpar visualmente
                                                multiline
                                                maxRows={4}
                                                value={formState.userInput}
                                                onChange={(e) => formState.setUserInput(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && onUserSubmit()}
                                                disabled={formState.isLoading}
                                                placeholder={formState.step === ConversationStep.ASKING_TITLE ? "Digite ou grave um áudio..." : "Responda..."}
                                                autoFocus
                                                slotProps={{ input: { disableUnderline: true } }} // Remove linha do standard
                                                sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 4, px: 2, py: 1}}
                                            />
                                            <Stack direction="row" spacing={1}>
                                                {/* Botão de Áudio (só aparece se input estiver vazio ou a critério) */}
                                                {formState.userInput.length === 0 && (
                                                    <Tooltip title="Gravar áudio (Max 20s)">
                                                        <IconButton
                                                            onClick={audioRecorder.startRecording}
                                                            disabled={formState.isLoading}
                                                            color="primary"
                                                        >
                                                            <KeyboardVoiceOutlinedIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                                <IconButton
                                                    color="primary"
                                                    onClick={onUserSubmit}
                                                    disabled={formState.isLoading || (!formState.userInput.trim() && !audioRecorder.isRecording)}
                                                >
                                                    {formState.isLoading ? <CircularProgress size={24} /> : <SendIcon />}
                                                </IconButton>
                                            </Stack>
                                        </>
                                    )}
                                </Box>
                            </Box>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Box>
            <AuthPromptDialog
                open={formState.isAuthPromptOpen}
                onClose={() => formState.setIsAuthPromptOpen(false)}
            />
        </LocalizationProvider>
    )
}