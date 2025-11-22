'use client'
//appbora/src/components/forms/ReminderForm.tsx
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
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined'
import TextsmsOutlinedIcon from '@mui/icons-material/TextsmsOutlined'
import StopCircleOutlinedIcon from '@mui/icons-material/StopCircleOutlined'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import CategoryIcon from '@mui/icons-material/Category'
import MicIcon from '@mui/icons-material/Mic'
import { ConversationStep, ReminderFormProps } from '@/interfaces/IReminder'
import useReminderForm from '@/hooks/forms/useReminderForm'
import { useAppSelector } from '@/app/store/hooks'
import { db } from '@/app/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { isToday } from 'date-fns'
import UsageCountdown from '@/components/ui/planos/upgradeplanos/UsageCountdown'
import { useSnackbar } from '@/contexts/SnackbarProvider'
import AuthPromptDialog from '@/components/ui/dialogs/AuthPromptDialog'
import {
    Box, TextField, IconButton, CircularProgress, Typography, Button, Paper, Tooltip,
    Stack, Menu, MenuItem, ListItemIcon, ListItemText, useTheme
} from '@mui/material'

const UpgradeBlocker = ({ lastUsage }: { lastUsage: Date | null }) => {
    const router = useRouter()
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 4 }}>
                <Typography variant="h6" fontWeight={700}>Limite diário atingido!</Typography>
                <Typography sx={{ my: 1 }}>Seu próximo lembrete gratuito estará disponível em:</Typography>
                {lastUsage && <UsageCountdown lastUsageTime={lastUsage} />}
                <Typography sx={{ my: 2 }}>Para criar lembretes ilimitados, assine um plano.</Typography>
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
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
    const openMenu = Boolean(anchorEl)
    const { user, status: authStatus } = useAppSelector((state) => state.auth)
    const userId = user?.uid
    const theme = useTheme()
    const isPremium = plan === 'premium'

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
            Handlers.handleVoiceProcess(handlerProps, audioRecorder.audioBlob)
            audioRecorder.resetAudio()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [audioRecorder.audioBlob])

    const onUserSubmit = () => {
        onChatStart()
        Handlers.handleUserInput(handlerProps, formState.userInput, formState.chatHistory.length)
        formState.setUserInput('')
    }

    const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget)
    }
    const handleMenuClose = () => {
        setAnchorEl(null)
    }
    const handleCategoryOption = () => {
        handleMenuClose()
        onChatStart() // Ativa logo
        // Aciona o fluxo de categoria manualmente
        Handlers.triggerCategoryFlow(handlerProps)
    }

    const messageVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }

    const fileInputRef = React.useRef<HTMLInputElement>(null)

    const handleImageUploadClick = () => {
        handleMenuClose() // Fecha o menu
        if (fileInputRef.current) {
            fileInputRef.current.click() // Abre o seletor de arquivos nativo
        }
    }

    // 2. Ação quando o usuário seleciona a foto
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            onChatStart() // Garante que a UI reaja (logo embaça)
            // Chama o handler de processamento (Vision + Gemini)
            Handlers.handleImageProcess(handlerProps, file)
        }
        // Limpa o input para permitir selecionar a mesma foto novamente se quiser
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    if (authStatus === 'loading') return <CircularProgress />
    if (isBlocked) return <UpgradeBlocker lastUsage={lastUsage} />

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
            <Box sx={{ display: 'flex', flexDirection: 'column', bgcolor: 'transparent', overflow: 'hidden', height: '100%', position: 'relative' }}>
                <input
                    type="file"
                    accept="image/*"
                    hidden
                    ref={fileInputRef}
                    onChange={handleFileChange}
                />
                {/* --- BOTÃO CHAT (Canto Superior Direito) --- */}
                {formState.chatHistory.length > 1 && (
                    <Box sx={{ position: 'absolute', top: 30, right: 15, zIndex: 10 }}>
                        <Tooltip title="Novo Lembrete">
                            <IconButton
                                size="large"
                                onClick={() => Handlers.handleNewChat(handlerProps)}
                                sx={{
                                    bgcolor: 'background.paper',
                                    boxShadow: 1,
                                    '&:hover': { bgcolor: 'background.default', boxShadow: 1 }
                                }}
                            >
                                <TextsmsOutlinedIcon color="primary" fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Box>
                )}
                {/* --- ÁREA DE CHAT --- */}
                <Box ref={chatContainerRef} sx={{ flexGrow: 1, overflowY: 'auto', p: 8, pb: 10, '&::-webkit-scrollbar': { width: '8px' } }}>
                    <AnimatePresence>
                        {formState.chatHistory.map((msg, index) => {
                            const isLastBotMessage = msg.sender === 'bot' && index === formState.chatHistory.length - 1
                            const lastUserMessage = [...formState.chatHistory].reverse().find(m => m.sender === 'user')?.text

                            return (
                                <motion.div key={msg.id} variants={messageVariants} initial="hidden" animate="visible" exit="hidden" layout>
                                    <Box sx={{ display: 'flex', justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start', my: 1 }}>
                                        <Box sx={{ bgcolor: msg.sender === 'user' ? 'primary.main' : 'background.paper', p: 1.5, borderRadius: 2, maxWidth: '80%' }}>
                                            {msg.text && <Typography sx={{ whiteSpace: 'pre-wrap' }}>{msg.text}</Typography>}
                                            {/* {msg.text === 'Seu lembrete foi criado!' && (
                                                <Button variant="outlined" sx={{ mt: 1 }} onClick={() => router.push('/lembretes')}>
                                                    Ver meus lembretes
                                                </Button>
                                            )} */}
                                            {/* Renderização condicional dos passos do fluxo */}
                                            {isLastBotMessage && formState.step === ConversationStep.ASKING_CATEGORY && (
                                                <UI.RenderCategorySelector {...handlerProps} />
                                            )}
                                            {isLastBotMessage && formState.step === ConversationStep.ASKING_DATE
                                                && <UI.RenderDatePicker {...handlerProps} />}
                                            {isLastBotMessage && formState.step === ConversationStep.ASKING_TIME
                                                && <UI.RenderTimeClockWithConfirm {...handlerProps} />}
                                            {isLastBotMessage && formState.step === ConversationStep.ASKING_RECURRENCE
                                                && <UI.RenderRecurrenceButtons {...handlerProps} formattedTime={formState.reminder.time || ''} />}
                                            {isLastBotMessage && formState.step === ConversationStep.ASKING_CUSTOMIZATION && (
                                                // Verifica o conteúdo da mensagem do BOT para decidir qual componente mostrar
                                                msg.text?.includes('Excelente')
                                                    ? <UI.RenderFullCustomizationForm {...handlerProps} />
                                                    : <UI.RenderCustomizationPrompt {...handlerProps} />
                                            )}
                                            {isLastBotMessage && formState.step === ConversationStep.CONFIRMING && <UI.RenderConfirmation {...handlerProps} />}
                                            {isLastBotMessage && formState.step === ConversationStep.SAVED && (
                                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                                    <Button
                                                        variant="contained"
                                                        color="secondary" // Ou a cor que preferir para destaque
                                                        fullWidth
                                                        onClick={() => router.push('/lembretes')}
                                                        sx={{ mt: 2, borderRadius: 4 }}
                                                    >
                                                        Ver Meus Lembretes
                                                    </Button>
                                                </motion.div>
                                            )}
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
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} style={{ padding: 8 }}>
                            <Box className="animated-border" sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: '20px', display: "flex", justifyContent: "center", p: 0.5 }}>
                                <Box
                                    sx={{
                                        p: 1,
                                        pl: 2,
                                        display: 'flex',
                                        alignItems: 'flex-end',
                                        width: '100%',
                                        borderRadius: '19px',
                                        bgcolor: 'var(--background)',
                                        minHeight: '56px' // Altura fixa para evitar pulos na troca de UI
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
                                                        Gravando... 0:{audioRecorder.timeLeft < 10 ? `0${audioRecorder.timeLeft}` : audioRecorder.timeLeft}
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
                                            {/* --- BOTÃO MAIS (+) / MENU --- */}
                                            <IconButton onClick={handleMenuClick}
                                                sx={{
                                                    color: 'text.secondary',
                                                    mb: 0.5,
                                                    ml: 0.5
                                                }}
                                            >
                                                <AddCircleOutlineIcon fontSize="medium" />
                                            </IconButton>
                                            <Menu
                                                anchorEl={anchorEl}
                                                open={openMenu}
                                                onClose={handleMenuClose}
                                                anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
                                                transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                                                PaperProps={{ sx: { borderRadius: 3, mb: 1 } }}
                                            >
                                                <MenuItem onClick={handleCategoryOption}>
                                                    <ListItemIcon><CategoryIcon fontSize="small" /></ListItemIcon>
                                                    <ListItemText>Categorias</ListItemText>
                                                </MenuItem>
                                                <MenuItem onClick={handleImageUploadClick} disabled={!isPremium}>
                                                    <ListItemIcon><ImageOutlinedIcon fontSize="small" /></ListItemIcon>
                                                    <ListItemText>
                                                        Anexar Imagem {!isPremium && "(Premium)"}
                                                    </ListItemText>
                                                </MenuItem>
                                            </Menu>
                                            <TextField
                                                fullWidth
                                                variant="standard" // Standard para limpar visualmente
                                                multiline
                                                maxRows={4}
                                                value={formState.userInput}
                                                onChange={(e) => formState.setUserInput(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && onUserSubmit()}
                                                disabled={formState.isLoading}
                                                sx={{ mx: 1 }}
                                                autoFocus
                                                placeholder={
                                                    formState.step === ConversationStep.ASKING_CATEGORY
                                                        ? "Digite o nome da categoria..."
                                                        : "Bora..."
                                                }
                                                slotProps={{
                                                    input: {
                                                        disableUnderline: true,
                                                        style: { paddingBottom: 12, paddingLeft: 8 }
                                                    }
                                                }}
                                            />
                                            <Stack direction="row" spacing={0.5} sx={{ mb: 0.5, mr: 0.5 }}>
                                                {/* Botão de Áudio */}
                                                <Tooltip title="Gravar áudio (Max 20s)">
                                                    <IconButton
                                                        onClick={audioRecorder.startRecording}
                                                        disabled={formState.isLoading}
                                                        color="primary"
                                                    >
                                                        <KeyboardVoiceOutlinedIcon />
                                                    </IconButton>
                                                </Tooltip>
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