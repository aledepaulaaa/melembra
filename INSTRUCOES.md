Perfeito, caso seja necessário e recomendado criar um componente extra para lhe dar com estas novas implementações fique a vontade, pois acredito que quanto mais dinâmico, organizado o código ficar, melhor.  Até prefiro que faça isso e integre os novos componentes nos atuais para tornar a "mecanica" do app robusta ao invés de despejar código extra nos componentes atuais, obviamente que se for necessário adicionar mais linhas de códigos nos componentes existentes , será necessário, mas com cuidado, evitando adicionar muitas linhas.

A aplicação é composta por
-- Redux: slices definidos
-- Typescript: interfaces bem separadas
-- NextJs: tenho server actions, hooks, apis

Segue o código de todos os componentes necessários:
se precisar melhorar o prompt da API para o modelo, faça isso por favor, adicionando as devidas variaveis para que a API receba o prompt com a variável necessária, que irá gerar o conteúdo dinamico.

//appbora/src/app/api/gemini/route.ts
import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string)
const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

export async function POST(request: Request) {
    try {
        const { prompt } = await request.json()

        if (!prompt) {
            return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
        }

        const result = await model.generateContent(`
            Crie uma lista de sugestões de itens ou próximos passos de forma curta e direta, baseada na seguinte frase. 
            Responda apenas com a lista em formato de texto separado por vírgulas. Não inclua numeração ou frases adicionais. Frase: "${prompt}"`
        )
        const response = await result.response
        const text = response.text()
        const suggestions = text.split(',').map(s => s.trim())

        return NextResponse.json({ suggestions })
    } catch (error) {
        console.error('Error with Gemini API:', error)
        return NextResponse.json({ error: 'Failed to generate content' }, { status: 500 })
    }
}

interface principal:
//appbora/src/interfaces/IRedminderForm.ts
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime"
import { SubscriptionState } from "./IBoraPayment"
import { AlertColor } from "@mui/material"

export type ChatMessage = {
    id: number
    sender: 'user' | 'bot'
    text?: string
    component?: React.ReactNode
}

export interface SerializableChatMessage {
    id: number
    sender: 'user' | 'bot'
    text?: string
}

export type ReminderState = {
    title: string | null
    date: Date | null
    time: string | null
    recurrence: string | null
    cor: string
    sobre: string
    img: string
    imageFile: File | null
    imagePreview: string | null
    imageBase64?: string | null
}

export interface Reminder {
    id: string
    title: string
    scheduledAt: string
    completed?: boolean
    cor?: string
    sobre?: string
    img?: string
    recurrence?: string
}

export enum ConversationStep {
    ASKING_TITLE,
    ASKING_DATE, ASKING_TIME,
    ASKING_RECURRENCE,
    ASKING_NOTIFICATIONS,
    ASKING_CUSTOMIZATION,
    CONFIRMING,
    SAVING
}

export interface ReminderFormProps {
    onChatStart: () => void
}

export interface HandlerProps {
    userId: string | null | any
    router: AppRouterInstance
    reminder: ReminderState
    isLoading: boolean
    subscription: SubscriptionState
    step: ConversationStep
    chatHistory: SerializableChatMessage[]
    setReminder: React.Dispatch<React.SetStateAction<ReminderState>>
    setStep: React.Dispatch<React.SetStateAction<ConversationStep>>
    setShowTextInput: React.Dispatch<React.SetStateAction<boolean>>
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
    setIsBotTyping: React.Dispatch<React.SetStateAction<boolean>>
    setIsAuthPromptOpen: React.Dispatch<React.SetStateAction<boolean>>
    onChatStart: () => void
    openSnackbar: (message: string, severity?: AlertColor) => void
    dispatch: any
}

// Definindo a paleta de cores permitida
export const colorPalette = ['#913FF5', '#BB86FC', '#220a8dff', '#FFFFFF']

export interface ReminderCustomizationFormProps {
    // Campos de estado
    description: string
    selectedColor: string
    imageFile: File | null
    imagePreview: string | null
    isUploading: boolean
    // Funções para atualizar o estado
    onDescriptionChange: (text: string) => void
    onColorSelect: (color: string) => void
    onImageSelect: (file: File | null) => void
    onConfirm: () => void // Ação ao confirmar a personalização
}

slice
//appbora/src/app/store/slices/reminderSlice.ts
import { SerializableChatMessage } from '@/interfaces/IReminder'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface ReminderState {
    reminders: any[]
    isSaving: boolean
    chatHistory: SerializableChatMessage[]
}

const initialState: ReminderState = {
    reminders: [],
    isSaving: false,
    chatHistory: []
}

export const reminderSlice = createSlice({
    name: 'reminders',
    initialState,
    reducers: {
        addReminder: (state, action: PayloadAction<string>) => {
            const newId = state.reminders.length > 0 ? state.reminders[state.reminders.length - 1].id + 1 : 0
            state.reminders.push({ id: newId, text: action.payload })
        },
        updateReminder: (state, action: PayloadAction<{ id: number; text: string }>) => {
            const index = state.reminders.findIndex(item => item.id === action.payload.id)
            if (index !== -1) {
                state.reminders[index].text = action.payload.text
            }
        },
        resetReminders: (state) => {
            state.reminders = [{ id: 0, text: '' }]
        },
        setSavingStatus: (state, action: PayloadAction<boolean>) => {
            state.isSaving = action.payload
        },
        setChatHistory: (state, action: PayloadAction<SerializableChatMessage[]>) => {
            state.chatHistory = action.payload
        },
        addChatMessage: (state, action: PayloadAction<SerializableChatMessage>) => {
            state.chatHistory.push(action.payload)
        },
        clearChatHistory: (state) => {
            state.chatHistory = []
        },
        // Remove a última mensagem se ela tiver um componente (botões, etc.)
        clearLastMessageComponent: (state) => {
            if (state.chatHistory.length > 0) {
                // Esta ação não é trivial de implementar sem o componente.
                // Vamos lidar com isso de outra forma nos handlers.
            }
        }
    },
})

export const {
    addReminder,
    updateReminder,
    resetReminders,
    setSavingStatus,
    setChatHistory,
    addChatMessage,
    clearChatHistory,
} = reminderSlice.actions

export default reminderSlice.reducer

mock de respostas do chat para o fluxo de cada componente (pode ser melhorado) mas de preferencia, que adicione mais textos aqui ao invés de usar a IA, pois pode me gerar custos extras, então prefiro usar mockado
//appbora/src/lib/botResponses.ts
export const dateRequestResponses = [
    "Muito bem! E qual a data para o lembrete '{title}'?",
    "Ótimo, então você quer criar o lembrete '{title}', certo? Qual a data que quer definir para ele?",
    "Entendido. Para quando devo agendar '{title}'?",
    "Perfeito. Agora, me diga a data para '{title}'.",
]

export function getRandomDateResponse(title: string): string {
    const randomIndex = Math.floor(Math.random() * dateRequestResponses.length)
    return dateRequestResponses[randomIndex].replace('{title}', title)
}

"reminderFormUI" que carrega os componentes resposaveis do fluxo
'use client'
// appbora/src/lib/forms/reminderFormUI.tsx
import React from 'react'
import { motion } from 'framer-motion'
import { HandlerProps } from '@/interfaces/IReminder'
import DiamondIcon from '@mui/icons-material/Diamond'
import * as Handlers from './reminderFormHandlers'
import { MobileDatePicker, TimeClock } from '@mui/x-date-pickers'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import { Box, Button, IconButton, Stack, Tooltip, Typography } from '@mui/material'
import ReminderCustomizationForm from './ReminderCustomizationForm'
import { resizeImageToStorage } from '@/app/lib/resizeImageToStorage'
import { useSnackbar } from '@/contexts/SnackbarProvider'
import { fileToBase64 } from '@/app/utils/base64'

// --- Componentes de UI  ---
export const RenderDatePicker = (props: HandlerProps) => {
    // Estado para controlar a abertura do calendário manualmente
    const [isOpen, setIsOpen] = React.useState(false)

    return (
        <motion.div transition={{ delay: 0.5 }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Stack spacing={2} justifyContent="center" alignItems="center" sx={{ py: 2 }}>
                {/* Botão Gatilho - Substitui o Input de texto */}
                <IconButton
                    onClick={() => setIsOpen(true)}
                    sx={{
                        width: 80,
                        height: 80,
                        bgcolor: 'rgba(187, 134, 252, 0.08)', // Roxo bem sutil no fundo
                        border: '1px solid rgba(187, 134, 252, 0.3)',
                        borderRadius: '50%',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            bgcolor: 'rgba(187, 134, 252, 0.2)',
                            transform: 'scale(1.05)'
                        }
                    }}
                >
                    <CalendarMonthIcon sx={{ fontSize: 40, color: '#BB86FC' }} />
                </IconButton>
                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                    Toque no ícone para selecionar a data
                </Typography>
                <MobileDatePicker
                    open={isOpen}
                    onClose={() => setIsOpen(false)}
                    onAccept={(date) => {
                        setIsOpen(false)
                        Handlers.handleDateSelect(props, date)
                    }}
                    defaultValue={props.reminder.date || new Date()}
                    slotProps={{
                        textField: {
                            sx: { display: 'none' }
                        }
                    }}
                />
            </Stack>
        </motion.div>
    )
}

export const RenderTimeClockWithConfirm = (props: HandlerProps & { minTime?: Date }) => {
    const [selectedTime, setSelectedTime] = React.useState<Date | null>(props.reminder.date || props.minTime || new Date())
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Stack direction="column" alignItems="center" justifyContent="center" spacing={1}>
                <TimeClock
                    ampm={false}
                    value={selectedTime}
                    onChange={(time) => setSelectedTime(time as Date)}
                    minTime={props.minTime}
                    sx={{ bgcolor: 'transparent', borderRadius: 2, my: 1, maxHeight: 300, overflow: "hidden" }}
                />
            </Stack>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                <Button variant="contained" onClick={() => Handlers.handleTimeSelect(props, selectedTime)}>
                    Confirmar Horário
                </Button>
            </Box>
        </motion.div>
    )
}

export const RenderRecurrenceButtons = (props: HandlerProps & { formattedTime: string }) => {
    const isFreePlan = props.subscription.plan !== 'plus' && props.subscription.plan !== 'premium'
    const recurrenceOptions = ['Diariamente', 'Semanalmente', 'Mensalmente']

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap', justifyContent: 'center', gap: 1 }}>
                <Button size="small" variant="outlined" onClick={() => Handlers.handleRecurrenceSelect(props, 'Não repetir')}>
                    Não repetir
                </Button>
                {recurrenceOptions.map((option) => (
                    <Tooltip key={option} title={isFreePlan ? "Recorrência só para Assinantes" : ""}>
                        <span>
                            <Button
                                size="small" variant="outlined" disabled={isFreePlan}
                                startIcon={isFreePlan ? <DiamondIcon fontSize="small" /> : null}
                                onClick={() => Handlers.handleRecurrenceSelect(props, option)}
                            >
                                {option}
                            </Button>
                        </span>
                    </Tooltip>
                ))}
            </Stack>
        </motion.div>
    )
}

// lógica apenas chamar os handlers corretos.
export const RenderCustomizationPrompt = (props: HandlerProps) => {
    const showCustomizationForm = () => {
        // Apenas adiciona a resposta do usuário. A renderização do formulário é controlada pelo 'step'.
        Handlers.addMessageToChat(props, { sender: 'user', text: `Sim, quero personalizar.` })
        Handlers.addMessageWithTyping(props, {
            sender: 'bot',
            text: 'Excelente! Configure os detalhes abaixo:'
        })
    }
    const skipCustomization = () => {
        Handlers.addMessageToChat(props, { sender: 'user', text: `Não, obrigado.` })
        Handlers.moveToConfirmation(props)
    }
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                <Button size="small" variant="contained" onClick={showCustomizationForm}>
                    Personalizar
                </Button>
                <Button size="small" variant="text" onClick={skipCustomization}>
                    Pular
                </Button>
            </Stack>
        </motion.div>
    )
}

export const RenderFullCustomizationForm = (props: HandlerProps) => {
    const { reminder, setReminder } = props
    const { openSnackbar } = useSnackbar()
    const [description, setDescription] = React.useState(reminder.sobre || '')
    const [selectedColor, setSelectedColor] = React.useState(reminder.cor || '#BB86FC')
    const [imageFile, setImageFile] = React.useState<File | null>(reminder.imageFile)
    const [imagePreview, setImagePreview] = React.useState<string | null>(reminder.imagePreview)
    const [isUploading, setIsUploading] = React.useState(false)

    const handleImageSelect = async (file: File | null) => {
        if (imagePreview) URL.revokeObjectURL(imagePreview)
        if (!file) {
            setImageFile(null)
            setImagePreview(null)
            setReminder(prev => ({ ...prev, imageBase64: null }))
            return
        }
        setIsUploading(true)
        try {
            const compressedFile = await resizeImageToStorage(file)
            const previewUrl = URL.createObjectURL(compressedFile)
            const base64String = await fileToBase64(compressedFile)
            setReminder(prev => ({ ...prev, imageBase64: base64String }))
            setImageFile(compressedFile)
            setImagePreview(previewUrl)
        } catch (error) {
            console.error("Erro ao processar imagem:", error)
            openSnackbar("Não foi possível processar essa imagem.", "error")
        } finally {
            setIsUploading(false)
        }
    }

    const handleConfirm = () => {
        const updatedCustomization = { sobre: description, cor: selectedColor, imageFile: imageFile, imagePreview: imagePreview }
        setReminder(prev => ({ ...prev, ...updatedCustomization }))

        const updatedHandlerProps = { ...props, reminder: { ...props.reminder, ...updatedCustomization } }

        Handlers.addMessageToChat(props, { sender: 'user', text: `Personalização definida.` })
        Handlers.moveToConfirmation(updatedHandlerProps)
    }

    return <ReminderCustomizationForm {...{
        description,
        selectedColor,
        imageFile,
        imagePreview,
        isUploading,
        onDescriptionChange: setDescription,
        onColorSelect: setSelectedColor,
        onImageSelect: handleImageSelect,
        onConfirm: handleConfirm
    }}
    />
}

export const RenderConfirmation = (props: HandlerProps) => {
    const { reminder } = props
    let customizationDetails = ''
    if (reminder.sobre) customizationDetails += `\nDescrição: "${reminder.sobre}"`
    if (reminder.imagePreview || reminder.imageBase64) customizationDetails += `\nImagem: Anexada`

    const summaryText = `
    Lembrete: "${reminder.title}"\nQuando: ${reminder.date?.toLocaleString('pt-BR')} às 
    ${reminder.time}\nRepetir: ${reminder.recurrence}${customizationDetails}
    `

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'flex-start' }}>
                {reminder.imagePreview && (
                    <img src={reminder.imagePreview} alt="Preview" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px' }} />
                )}
                <Typography sx={{ whiteSpace: 'pre-wrap', mt: 1, mb: 2 }}>{summaryText}</Typography>
                <Stack direction="row" spacing={1}>
                    <Button size="small" variant="contained" color="primary" onClick={() => Handlers.handleConfirmSave(props)}>Confirmar e Salvar</Button>
                    <Button size="small" variant="text" onClick={() => Handlers.handleCancel(props)}>Cancelar</Button>
                </Stack>
            </Box>
        </motion.div>
    )
}

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
import { ConversationStep, ReminderFormProps } from '@/interfaces/IReminder'
import useReminderForm from '@/hooks/forms/useReminderForm'
import { useAppSelector } from '@/app/store/hooks'
import { db } from '@/app/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { isToday } from 'date-fns'
import UsageCountdown from '../ui/planos/upgradeplanos/UsageCountdown'
import { useSnackbar } from '@/contexts/SnackbarProvider'
import DiamondOutlinedIcon from '@mui/icons-material/DiamondOutlined'
import AuthPromptDialog from '../ui/dialogs/AuthPromptDialog'
import { Box, TextField, IconButton, CircularProgress, Typography, Button, Paper } from '@mui/material'

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
    const subscription = useAppSelector((state) => state.subscription)
    const { plan, status: subStatus } = subscription
    const { openSnackbar } = useSnackbar()
    const [isBlocked, setIsBlocked] = React.useState(false)
    const [lastUsage, setLastUsage] = React.useState<Date | null>(null)
    const { user, status: authStatus } = useAppSelector((state) => state.auth)
    const userId = user?.uid

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

    React.useEffect(() => {
        if (chatContainerRef.current)
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }, [formState.chatHistory, formState.isBotTyping])

    // O objeto de props agora é construído corretamente e não causará mais erros de tipo.
    const handlerProps = { ...formState, userId, router, onChatStart, subscription, openSnackbar }

    const onUserSubmit = () => {
        Handlers.handleUserInput(handlerProps, formState.userInput, formState.chatHistory.length)
        formState.setUserInput('')
    }

    const messageVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }

    if (authStatus === 'loading') {
        return <CircularProgress />
    }

    if (isBlocked) {
        return <UpgradeBlocker lastUsage={lastUsage} />
    }

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
            <Box sx={{ display: 'flex', flexDirection: 'column', bgcolor: 'transparent', overflow: 'hidden', height: '100%' }}>
                <Box ref={chatContainerRef} sx={{ flexGrow: 1, overflowY: 'auto', p: 2, '&::-webkit-scrollbar': { width: '8px' } }}>
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
                                            {/* --- LÓGICA DE RENDERIZAÇÃO CORRIGIDA E FINAL --- */}
                                            {isLastBotMessage && formState.step === ConversationStep.ASKING_DATE
                                                && <UI.RenderDatePicker {...handlerProps} />}
                                            {isLastBotMessage && formState.step === ConversationStep.ASKING_TIME
                                                && <UI.RenderTimeClockWithConfirm {...handlerProps} />}
                                            {isLastBotMessage && formState.step === ConversationStep.ASKING_RECURRENCE
                                                && <UI.RenderRecurrenceButtons {...handlerProps} formattedTime={formState.reminder.time || ''} />}
                                            {/* CONDIÇÃO 1: Se o passo é customização E a última resposta do usuário foi "Sim", mostre o formulário. */}
                                            {isLastBotMessage && formState.step === ConversationStep.ASKING_CUSTOMIZATION
                                                && lastUserMessage === 'Sim, quero personalizar.' && (
                                                    <UI.RenderFullCustomizationForm {...handlerProps} />
                                                )}
                                            {/* CONDIÇÃO 2: Se o passo é customização E a última resposta NÃO foi "Sim", mostre os botões de Sim/Não. */}
                                            {isLastBotMessage && formState.step === ConversationStep.ASKING_CUSTOMIZATION
                                                && lastUserMessage !== 'Sim, quero personalizar.' && (
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
                <AnimatePresence>
                    {formState.showTextInput && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}>
                            <Box className="animated-border" sx={{ borderRadius: '20px', display: "flex", justifyContent: "center", p: 1 }}>
                                <Box sx={{ p: 2, display: 'flex', alignItems: 'center', width: '100%', borderRadius: '19px', bgcolor: 'var(--background)' }}>
                                    <TextField
                                        fullWidth variant="outlined" multiline maxRows={4}
                                        value={formState.userInput}
                                        onChange={(e) => formState.setUserInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && onUserSubmit()}
                                        disabled={formState.isLoading}
                                        placeholder={formState.step === ConversationStep.ASKING_TITLE ? "Bora, me lembra de..." : "DDD + Número ou Enter para pular"}
                                        autoFocus
                                        slotProps={{ input: { sx: { borderRadius: 4, p: 4 } } }}
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
            <AuthPromptDialog
                open={formState.isAuthPromptOpen}
                onClose={() => formState.setIsAuthPromptOpen(false)}
            />
        </LocalizationProvider>
    )
}

'use client'
// appbora/app/lib/forms/reminderFormHandlers.tsx
import { saveReminder } from '@/app/actions/actions'
import { HandlerProps, ConversationStep, SerializableChatMessage } from '@/interfaces/IReminder'
import { getDownloadURL, uploadBytes, ref } from 'firebase/storage'
import { storage } from '@/app/lib/firebase'
import { addChatMessage } from '@/app/store/slices/reminderSlice'
import { getRandomDateResponse } from '@/app/lib/dateRequestResponses'

// --- Funções de Lógica Refatoradas para Redux ---

/**
 * Adiciona uma mensagem serializável ao store do Redux.
 * Esta é a principal função para adicionar novas mensagens ao chat.
 */
export const addMessageToChat = (props: HandlerProps, message: Omit<SerializableChatMessage, 'id'>) => {
    props.dispatch(addChatMessage({ ...message, id: Date.now() }))
}

/**
 * Adiciona uma mensagem de bot com um efeito de "digitando".
 * O componente visual não é mais passado aqui, será renderizado pelo ReminderForm.
 */
export const addMessageWithTyping = (props: HandlerProps, message: Omit<SerializableChatMessage, 'id'>, delay = 1200) => {
    props.setIsBotTyping(true)
    setTimeout(() => {
        props.setIsBotTyping(false)
        addMessageToChat(props, message)
    }, delay)
}

export const handleDateSelect = (props: HandlerProps, newDate: Date | null) => {
    if (!newDate) return
    newDate.setHours(0, 0, 0, 0)

    props.setReminder(prev => ({ ...prev, date: newDate }))

    // Apenas adicionamos a resposta do usuário
    addMessageToChat(props, { sender: 'user', text: `Data: ${newDate.toLocaleDateString('pt-BR')}` })

    // Adicionamos a próxima pergunta do bot
    addMessageWithTyping(props, {
        sender: 'bot',
        text: `Entendido. Agora, qual o horário?`,
    })

    props.setShowTextInput(false)
    props.setStep(ConversationStep.ASKING_TIME)
}

export const handleTimeSelect = (props: HandlerProps, timeFromClock: Date | null) => {
    if (!timeFromClock || !props.reminder.date) {
        props.openSnackbar('Temos um problema com a data, por favor tente novamente.', 'error')
        return
    }

    const formattedTime = timeFromClock.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    const finalDate = new Date(props.reminder.date)
    finalDate.setHours(timeFromClock.getHours(), timeFromClock.getMinutes(), 0)

    props.setReminder(prev => ({ ...prev, date: finalDate, time: formattedTime }))

    addMessageToChat(props, { sender: 'user', text: `Horário: ${formattedTime}` })

    addMessageWithTyping(props, {
        sender: 'bot',
        text: `Perfeito. O lembrete irá se repetir?`,
    })

    props.setStep(ConversationStep.ASKING_RECURRENCE)
}

export const handleRecurrenceSelect = (props: HandlerProps, recurrence: string) => {
    props.setReminder(prev => ({ ...prev, recurrence: recurrence }))

    addMessageToChat(props, { sender: 'user', text: `Recorrência: ${recurrence}` })

    addMessageWithTyping(props, {
        sender: 'bot',
        text: `Deseja personalizar seu lembrete com cores, imagens ou uma descrição?`,
    })
    props.setStep(ConversationStep.ASKING_CUSTOMIZATION)
}

export const moveToConfirmation = async (props: HandlerProps) => {
    props.setIsLoading(true)
    props.setShowTextInput(false)

    addMessageWithTyping(props, {
        sender: 'bot',
        text: `Tudo pronto! Por favor, confirme os detalhes:`,
    })
    props.setIsLoading(false)
    props.setStep(ConversationStep.CONFIRMING)
}

export const handleConfirmSave = async (props: HandlerProps) => {
    const { reminder, userId, openSnackbar, chatHistory, setIsAuthPromptOpen } = props
    let imageUrl = reminder.img || ''

    if (!userId) {
        const pendingData = {
            reminder: {
                title: reminder.title,
                date: reminder.date?.toISOString(),
                recurrence: reminder.recurrence,
                cor: reminder.cor,
                sobre: reminder.sobre,
                imageBase64: reminder.imageBase64,
            },
            history: chatHistory,
        }
        localStorage.setItem('pendingBoraData', JSON.stringify(pendingData))
        setIsAuthPromptOpen(true)
        return
    }

    if (!reminder.title || !reminder.date) {
        openSnackbar("Ocorreu um erro. Faltam informações.", 'error')
        return
    }

    props.setIsLoading(true)
    addMessageWithTyping(props, { sender: 'bot', text: `Preparando tudo...` }, 100)

    if (reminder.imageFile) {
        try {
            addMessageToChat(props, { sender: 'bot', text: 'Enviando imagem...' })
            const storageRef = ref(storage, `reminders/${userId}/${Date.now()}_${reminder.imageFile.name}`)
            const snapshot = await uploadBytes(storageRef, reminder.imageFile)
            imageUrl = await getDownloadURL(snapshot.ref)
            addMessageToChat(props, { sender: 'bot', text: 'Imagem salva!' })
        } catch (error) {
            console.error("Erro no upload:", error)
            openSnackbar("Falha ao salvar a imagem.", 'error')
            props.setIsLoading(false)
            return
        }
    }

    addMessageToChat(props, { sender: 'bot', text: 'Salvando seu lembrete...' })

    const result = await saveReminder(
        reminder.title, reminder.date, userId,
        reminder.recurrence || 'Não repetir', reminder.cor,
        reminder.sobre || '', imageUrl
    )

    if (result.success) {
        openSnackbar('Lembrete salvo com sucesso!', 'success')
        addMessageWithTyping(props, {
            sender: 'bot', text: 'Seu lembrete foi criado!',
        })
    } else {
        openSnackbar(result.error || 'Falha ao salvar lembrete.', 'error')
        addMessageWithTyping(props, { sender: 'bot', text: `Ocorreu um erro: ${result.error}` })
    }
    props.setIsLoading(false)
}

export const handleCancel = (props: HandlerProps) => {
    addMessageToChat(props, { sender: 'user', text: `Cancelar` })
    addMessageWithTyping(props, { sender: 'bot', text: 'Como posso te ajudar a lembrar de algo novo?' })
    props.setReminder({
        title: null, date: null, time: null, recurrence: null,
        cor: '#BB86FC', sobre: '', img: '', imageFile: null,
        imagePreview: null, imageBase64: null
    })
    props.setShowTextInput(true)
    props.setStep(ConversationStep.ASKING_TITLE)
}

export const handleUserInput = (props: HandlerProps, value: string, chatHistoryLength: number) => {
    if (props.isLoading) return
    if (chatHistoryLength === 0) props.onChatStart()

    const trimmedValue = value.trim()
    addMessageToChat(props, { sender: 'user', text: trimmedValue || "Pular" })

    switch (props.step) {
        case ConversationStep.ASKING_TITLE:
            if (!trimmedValue) {
                props.openSnackbar("Seu lembrete precisa de um nome.", 'error')
                addMessageToChat(props, { sender: 'bot', text: 'Por favor, me diga o que você quer lembrar.' })
                return
            }
            props.setReminder(prev => ({ ...prev, title: trimmedValue }))
            addMessageWithTyping(props, {
                sender: 'bot',
                text: getRandomDateResponse(trimmedValue),
            })
            props.setShowTextInput(false)
            props.setStep(ConversationStep.ASKING_DATE)
            break
        case ConversationStep.ASKING_NOTIFICATIONS:
            moveToConfirmation(props)
            break
    }
}

hook do formulario ReminderForm
'use client'
//appbora/src/hooks/forms/useReminderForm.ts
import React from "react"
import { ConversationStep, ReminderState } from "@/interfaces/IReminder"
import { useAppDispatch, useAppSelector } from "@/app/store/hooks"

export default function useReminderForm() {
    const dispatch = useAppDispatch()
    const chatHistory = useAppSelector((state) => state.reminders.chatHistory)

    // Os estados que são puramente da UI local permanecem aqui
    const [userInput, setUserInput] = React.useState('')
    const [step, setStep] = React.useState<ConversationStep>(ConversationStep.ASKING_TITLE)
    const [isLoading, setIsLoading] = React.useState(false)
    const [showTextInput, setShowTextInput] = React.useState(true)
    const [isBotTyping, setIsBotTyping] = React.useState(false)
    const [isAuthPromptOpen, setIsAuthPromptOpen] = React.useState(false)
    const [reminder, setReminder] = React.useState<ReminderState>({
        title: null,
        date: null,
        time: null,
        recurrence: null,
        cor: "#BB86FC",
        sobre: "",
        img: "",
        imageFile: null,
        imagePreview: null,
        imageBase64: null,
    })

    return {
        // Estado local
        step,
        reminder,
        userInput,
        isLoading,
        isBotTyping,
        showTextInput,
        isAuthPromptOpen,
        // Setters do estado local
        setStep,
        setReminder,
        setUserInput,
        setIsLoading,
        setIsBotTyping,
        setShowTextInput,
        setIsAuthPromptOpen,
        // Conexão com Redux
        dispatch,
        chatHistory, // Este vem do Redux
    }
}



componente Home, da tela inicial "/" para caso o usuário esteja deslogado mas queira criar seu lembrete, neste caso, ele é solicitado que logue em sua conta para completar o salvamento, é interessante também permitir estes usuários deslogados de testar usar o recurso de áudio, deve ser possível também para eles então o componente Home estou compartilhando para que vc veja que também tenho esta implementação

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
            <ReminderFlow onChatStart={() => setIsChatStarted(true)} />
        </Box>
    )
}

Como pode ver minha aplicação é bem robusta, já com temas definidos, motion do Frammer, estilos, componetização bem estruturada, lógica implementada, tipagens definidas, então tente seguir a base completa, o que tem definido e apenas implementar o necessário sem alterar a estrutura altamente rica e bem definida. Siga os padrões de implementações e coloque esta nova camada robusta.

Divida em etapas pequenas caso seja necessário por favor, e a cada etapa, por exemplo: "etapa 1, implementar áudio e etc..."

após acabar a etapa 1, me pergunte se pode continuar avançando.

Ajuste os componentes necessários nos trechos, sem gerar todo o código dos componentes existentes novamente, mas os componentes novos, crie 100% eles, seguindo a base estrutural, estilos, animações e o compartilhamento de estados de forma robusta
