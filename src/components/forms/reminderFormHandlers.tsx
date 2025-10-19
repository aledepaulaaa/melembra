// melembra/app/lib/forms/reminderFormHandlers.tsx
import { recordFreeUsage, saveReminder, saveUserPhoneNumber } from '@/app/actions/actions'
import { ChatMessage, ConversationStep, HandlerProps } from '@/interfaces/IReminderForm'
import { Button } from '@mui/material'
import * as UI from './reminderFormUI' // Importa nosso novo módulo de UI
import { getRandomDateResponse } from '@/app/lib/dateRequestResponses'

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
    newDate.setHours(0, 0, 0, 0)

    props.setReminder(prev => ({ ...prev, date: newDate }))
    props.setChatHistory(prev => prev.filter(msg => !msg.component))
    addMessageToChat(props, { sender: 'user', text: `Data: ${newDate.toLocaleDateString('pt-BR')}` })

    let minTimeForClock: Date | undefined = undefined
    if (isToday(newDate)) {
        minTimeForClock = new Date()
        minTimeForClock.setHours(minTimeForClock.getHours() + 1)
    }

    addMessageWithTyping(props, {
        sender: 'bot',
        text: `Entendido. Agora, qual o horário?`,
        component: <UI.RenderTimeClockWithConfirm handlerProps={props} minTime={minTimeForClock} />
    })
    props.setShowTextInput(false)
    props.setStep(ConversationStep.ASKING_TIME)
}

export const handleTimeSelect = (props: HandlerProps, timeFromClock: Date | null) => {
    if (!timeFromClock) return
    const formattedTime = timeFromClock.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    const finalDate = new Date(props.reminder.date!)
    finalDate.setHours(timeFromClock.getHours())
    finalDate.setMinutes(timeFromClock.getMinutes())
    props.setReminder(prev => ({ ...prev, date: finalDate, time: formattedTime }))
    props.setChatHistory(prev => prev.filter(msg => !msg.component))
    addMessageToChat(props, { sender: 'user', text: `Horário: ${formattedTime}` })
    
    // A CORREÇÃO ESTÁ AQUI: Passamos `formattedTime` para a função de renderização
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

export const moveToConfirmation = async (props: HandlerProps, phoneInput: string) => {
    const { openSnackbar } = props

    props.setIsLoading(true)
    props.setShowTextInput(false)

    if (phoneInput.trim() && props.userId) {
        addMessageWithTyping(props, { sender: 'bot', text: `Salvando seu número...` }, 500)
        await saveUserPhoneNumber(props.userId, phoneInput)
        openSnackbar('Número do WhatsApp salvo!', 'success')
    }

    addMessageWithTyping(props, {
        sender: 'bot',
        text: `Tudo pronto! Por favor, confirme os detalhes:`,
        component: UI.renderConfirmation(props)
    })
    props.setIsLoading(false)
    props.setStep(ConversationStep.CONFIRMING)
}

export const handleConfirmSave = async (props: HandlerProps) => {
    
    const { reminder, router, subscription, openSnackbar, getOrCreateAnonymousUser} = props
    
    const currentUserId = await getOrCreateAnonymousUser()

    if (!reminder.title || !reminder.date || !currentUserId) {
        openSnackbar("Ocorreu um erro. Faltam informações.", 'error')
        return
    }

    props.setIsLoading(true)
    props.setChatHistory(prev => prev.filter(msg => !msg.component))
    addMessageWithTyping(props, { sender: 'bot', text: `Salvando...` }, 100)

    const result = await saveReminder(reminder.title, reminder.date, currentUserId)

    if (result.success) {
        openSnackbar('Lembrete salvo com sucesso!', 'success')

        // 3. A LÓGICA CRÍTICA VAI AQUI!
        // Se o plano for 'free', registra o uso para bloquear no futuro.
        if (subscription.plan === 'free') {
            await recordFreeUsage(currentUserId)
        }

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
        openSnackbar(result.error || 'Falha ao salvar lembrete.', 'error')
        addMessageWithTyping(props, { sender: 'bot', text: `Ocorreu um erro: ${result.error}` })
    }

    props.setIsLoading(false)
    
}

export const handleCancel = (props: HandlerProps) => {
    props.setChatHistory(prev => prev.filter(msg => !msg.component))
    addMessageToChat(props, { sender: 'user', text: `Cancelar` })
    addMessageWithTyping(props, { sender: 'bot', text: 'Como posso te ajudar a lembrar de algo novo?' })
    props.setReminder({ title: null, date: null, time: null, recurrence: null })
    props.setShowTextInput(true)
    props.setStep(ConversationStep.ASKING_TITLE)
}

export const handleUserInput = (props: HandlerProps, value: string, chatHistoryLength: number) => {
    const { openSnackbar } = props

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
                openSnackbar("O título não pode ser vazio.", 'error')
                addMessageToChat(props, { sender: 'bot', text: 'Por favor, me diga o que você quer lembrar.' })
                return
            }
            props.setReminder(prev => ({ ...prev, title: trimmedValue }))
            addMessageWithTyping(props, { sender: 'bot', text: getRandomDateResponse(trimmedValue), component: UI.renderDatePicker(props) })
            props.setShowTextInput(false)
            props.setStep(ConversationStep.ASKING_DATE)
            break
        case ConversationStep.ASKING_NOTIFICATIONS:
            moveToConfirmation(props, trimmedValue)
            break
    }
}