// melembra/app/lib/forms/reminderFormHandlers.tsx
import { toast } from 'react-toastify'
import { saveReminder, saveUserPhoneNumber } from '@/app/actions/actions'
import { ChatMessage, ConversationStep, HandlerProps } from '@/interfaces/IReminderForm'
import { getRandomDateResponse } from './dateRequestResponses'
import { Button } from '@mui/material'
import * as UI from './reminderFormUI' // Importa nosso novo módulo de UI

// --- Funções de Lógica Pura ---
export const addMessageToChat = (props: HandlerProps, message: Omit<ChatMessage, 'id'>) => {
    props.setChatHistory(prev => [...prev, { ...message, id: prev.length }])
}

export const addMessageWithTyping = (props: HandlerProps, message: Omit<ChatMessage, 'id'>, delay = 1200) => {
    props.setIsBotTyping(true)
    setTimeout(() => {
        props.setIsBotTyping(false)
        addMessageToChat(props, message)
    }, delay)
}

const isToday = (someDate: Date) => {
    const today = new Date()
    return someDate.getDate() === today.getDate() &&
        someDate.getMonth() === today.getMonth() &&
        someDate.getFullYear() === today.getFullYear()
}

export const handleDateSelect = (props: HandlerProps, newDate: Date | null) => {
    if (!newDate) return
    props.setReminder(prev => ({ ...prev, date: newDate }))
    props.setChatHistory(prev => prev.filter(msg => !msg.component))
    addMessageToChat(props, { sender: 'user', text: `Data: ${newDate.toLocaleDateString('pt-BR')}` })

    // --- LÓGICA DE VALIDAÇÃO ---
    let minTimeForClock: Date | undefined = undefined
    if (isToday(newDate)) {
        minTimeForClock = new Date()
        minTimeForClock.setHours(minTimeForClock.getHours() + 1) // Adiciona 1 hora
    }

    addMessageWithTyping(props, {
        sender: 'bot',
        text: `Entendido. Agora, qual o horário?`,
        component: UI.renderTimeClock(props, minTimeForClock)
    })
    props.setShowTextInput(false)
    props.setStep(ConversationStep.ASKING_TIME)
}

export const handleTimeSelect = (props: HandlerProps, newTime: Date | null) => {
    if (!newTime) return
    const formattedTime = newTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    const combinedDate = props.reminder.date
    if (combinedDate) {
        combinedDate.setHours(newTime.getHours())
        combinedDate.setMinutes(newTime.getMinutes())
        props.setReminder(prev => ({
            ...prev,
            date: combinedDate,
            time: formattedTime
        }))
    }
    props.setChatHistory(prev => prev.filter(msg => !msg.component))
    addMessageToChat(props,
        {
            sender: 'user',
            text: `Horário: ${formattedTime}`
        })
    addMessageWithTyping(props, {
        sender: 'bot',
        text: `Perfeito. O lembrete irá se repetir?`,
        component: UI.renderRecurrenceButtons(props, formattedTime)
    })
    props.setStep(ConversationStep.ASKING_RECURRENCE)
}

export const handleRecurrenceSelect = (props: HandlerProps, recurrence: string, time: string) => {
    props.setReminder(prev => ({ ...prev, recurrence: recurrence }))
    props.setChatHistory(prev => prev.filter(msg => !msg.component))
    addMessageToChat(props, { sender: 'user', text: `Recorrência: ${recurrence}` })
    addMessageWithTyping(props, { sender: 'bot', text: `Ótimo. Deseja receber notificações no WhatsApp? Digite seu número ou pressione Enter para pular.` })
    props.setShowTextInput(true)
    props.setStep(ConversationStep.ASKING_NOTIFICATIONS)
}

export const moveToConfirmation = async (props: HandlerProps, phoneInput: string, time: string) => {
    props.setIsLoading(true); props.setShowTextInput(false)
    if (phoneInput.trim() && props.userId) {
        addMessageWithTyping(props, { sender: 'bot', text: `Salvando seu número...` }, 500)
        await saveUserPhoneNumber(props.userId, phoneInput)
        toast.success('Número do WhatsApp salvo!')
    }

    const summaryText = `Lembrete: "${props.reminder.title}"\nQuando: ${props.reminder.date?.toLocaleDateString('pt-BR')} às ${time}\nRepetir: ${props.reminder.recurrence}`

    addMessageWithTyping(props, {
        sender: 'bot',
        text: `Tudo pronto! Por favor, confirme os detalhes:`,
        component: UI.renderConfirmation(props, summaryText)
    })
    props.setIsLoading(false); props.setStep(ConversationStep.CONFIRMING)
}

export const handleConfirmSave = async (props: HandlerProps) => {
    const { reminder, userId, router } = props
    if (!reminder.title || !reminder.date || !userId) { toast.error("Ocorreu um erro. Faltam informações."); return }
    props.setIsLoading(true); props.setChatHistory(prev => prev.filter(msg => !msg.component))
    addMessageWithTyping(props, { sender: 'bot', text: `Salvando...` }, 100)
    const result = await saveReminder(reminder.title, reminder.date, userId)
    if (result.success) {
        toast.success('Lembrete salvo com sucesso!')
        addMessageWithTyping(props, {
            sender: 'bot', text: 'Seu lembrete foi criado!',
            component:
                <Button variant="outlined"
                    sx={{ mt: 1 }}
                    onClick={() => router.push('/lembretes')}
                >
                    Ver meus lembretes
                </Button>
        })
    } else {
        toast.error(result.error || 'Falha ao salvar lembrete.'); addMessageWithTyping(props, { sender: 'bot', text: `Ocorreu um erro: ${result.error}` })
    }
    props.setIsLoading(false)
}

export const handleCancel = (props: HandlerProps) => {
    props.setChatHistory(prev => prev.filter(msg => !msg.component))
    addMessageToChat(props, { sender: 'user', text: `Cancelar` })
    addMessageWithTyping(props, { sender: 'bot', text: 'Como posso te ajudar a lembrar de algo novo?' })
    props.setReminder({ title: null, date: null, time: null, recurrence: null })
    props.setShowTextInput(true); props.setStep(ConversationStep.ASKING_TITLE)
}

export const handleUserInput = (props: HandlerProps, value: string, chatHistoryLength: number) => {
    if (props.isLoading) return

    // E agora, ele usa o onChatStart que VEM DE DENTRO do objeto 'props'
    if (chatHistoryLength === 0) {
        props.onChatStart()
    }

    const trimmedValue = value.trim()
    addMessageToChat(props, { sender: 'user', text: trimmedValue || "Pular" })

    switch (props.step) {
        case ConversationStep.ASKING_TITLE:
            if (!trimmedValue) {
                toast.error("O título não pode ser vazio.")
                addMessageToChat(props, { sender: 'bot', text: 'Por favor, me diga o que você quer lembrar.' });
                return
            }
            props.setReminder(prev => ({ ...prev, title: trimmedValue }))
            addMessageWithTyping(props, { sender: 'bot', text: getRandomDateResponse(trimmedValue), component: UI.renderDatePicker(props) })
            props.setShowTextInput(false); props.setStep(ConversationStep.ASKING_DATE)
            break
        case ConversationStep.ASKING_NOTIFICATIONS:
            moveToConfirmation(props, trimmedValue, props.reminder.time || '')
            break
    }
}