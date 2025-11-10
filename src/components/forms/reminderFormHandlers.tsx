//bora-app/app/lib/forms/reminderFormHandlers.tsx
import * as UI from './reminderFormUI' // Importa nosso novo módulo de UI
import { getRandomDateResponse } from '@/app/lib/dateRequestResponses'
import { recordFreeUsage, saveReminder, saveUserPhoneNumber } from '@/app/actions/actions'
import { ChatMessage, ConversationStep, HandlerProps } from '@/interfaces/IReminderForm'
import { Button } from '@mui/material'
import WhatsAppSettingsForm from './WhatsAppSettingsForm'

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

export const handleQuickReminder = (props: HandlerProps, minutes: number) => {
    // Calcula o tempo futuro
    const reminderTime = new Date(Date.now() + minutes * 60 * 1000)
    const formattedTime = reminderTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

    // Atualiza o estado do lembrete com a nova data/hora
    props.setReminder(prev => ({ ...prev, date: reminderTime, time: formattedTime }))
    
    // Limpa a UI e atualiza o chat
    props.setChatHistory(prev => prev.filter(msg => !msg.component))
    addMessageToChat(props, { sender: 'user', text: `Lembrar em ${minutes} minutos` })

    // Cria as props atualizadas para a próxima etapa
    const updatedHandlerProps = {
        ...props,
        reminder: { ...props.reminder, date: reminderTime, time: formattedTime }
    }

    // Pula diretamente para a pergunta de recorrência
    addMessageWithTyping(props, { 
        sender: 'bot', 
        text: `Ok! Lembrete agendado para ${formattedTime}. Ele irá se repetir?`, 
        component: UI.renderRecurrenceButtons(updatedHandlerProps, formattedTime) 
    })
    
    props.setStep(ConversationStep.ASKING_RECURRENCE)
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
        // minTimeForClock.setHours(minTimeForClock.getHours() + 1)
         minTimeForClock.setMinutes(minTimeForClock.getMinutes() + 5)
    }

    const updatedHandlerProps = {
        ...props,
        reminder: { ...props.reminder, date: newDate }
    }

    addMessageWithTyping(props, {
        sender: 'bot',
        text: `Entendido. Agora, qual o horário?`,
        // Passamos o objeto de props atualizado para o componente do chat.
        component: <UI.RenderTimeClockWithConfirm handlerProps={updatedHandlerProps} minTime={minTimeForClock} />
    })
    // --- FIM DA CORREÇÃO ---

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
    finalDate.setHours(timeFromClock.getHours())
    finalDate.setMinutes(timeFromClock.getMinutes())
    finalDate.setSeconds(0)

    props.setReminder(prev => ({ ...prev, date: finalDate, time: formattedTime }))
    props.setChatHistory(prev => prev.filter(msg => !msg.component))
    addMessageToChat(props, { sender: 'user', text: `Horário: ${formattedTime}` })

    // Cria um objeto de props com os dados mais recentes do lembrete
    const updatedHandlerProps = {
        ...props,
        reminder: { ...props.reminder, date: finalDate, time: formattedTime }
    }

    addMessageWithTyping(props, {
        sender: 'bot',
        text: `Perfeito. O lembrete irá se repetir?`,
        // Passa as props atualizadas para a próxima etapa
        component: UI.renderRecurrenceButtons(updatedHandlerProps, formattedTime)
    })

    props.setStep(ConversationStep.ASKING_RECURRENCE)
}

export const handleRecurrenceSelect = (props: HandlerProps, recurrence: string, time: string) => {
    props.setReminder(prev => ({ ...prev, recurrence: recurrence }))
    props.setChatHistory(prev => prev.filter(msg => !msg.component))
    addMessageToChat(props, { sender: 'user', text: `Recorrência: ${recurrence}` })

    const updatedHandlerProps = {
        ...props,
        reminder: { ...props.reminder, recurrence: recurrence }
    }

    addMessageWithTyping(props, {
        sender: 'bot',
        text: `Ótimo. Deseja receber notificações no WhatsApp?`,
        // Passa as props atualizadas para a próxima etapa
        component: <WhatsAppSettingsForm onSave={() => moveToConfirmation(updatedHandlerProps)} />
    })

    props.setShowTextInput(false) // Mude para false aqui, já que o WhatsAppForm tem seu próprio input
    props.setStep(ConversationStep.ASKING_NOTIFICATIONS)
}

export const moveToConfirmation = async (props: HandlerProps) => {
    props.setIsLoading(true)
    props.setShowTextInput(false)


    addMessageWithTyping(props, {
        sender: 'bot',
        text: `Tudo pronto! Por favor, confirme os detalhes:`,
        component: UI.renderConfirmation(props)
    })
    props.setIsLoading(false)
    props.setStep(ConversationStep.CONFIRMING)
}

export const handleConfirmSave = async (props: HandlerProps) => {

    const { reminder, router, subscription, userId, openSnackbar } = props

    const recurrence = reminder.recurrence || 'Não repetir'

    if (!reminder.title || !reminder.date || !userId) {
        openSnackbar("Ocorreu um erro. Faltam informações.", 'error')
        return
    }

    props.setIsLoading(true)
    props.setChatHistory(prev => prev.filter(msg => !msg.component))
    addMessageWithTyping(props, { sender: 'bot', text: `Salvando...` }, 100)

    const result = await saveReminder(reminder.title, reminder.date, userId, recurrence)

    if (result.success) {
        openSnackbar('Lembrete salvo com sucesso!', 'success')

        if (subscription.plan === 'free') {
            await recordFreeUsage(userId)
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
    const { openSnackbar, router, userId } = props

    if (!userId) {
        openSnackbar('Você precisa de uma conta para criar lembretes.', 'info')
        // Redireciona para a página de perfil para criar ou logar
        router.push('/perfil')
        return
    }

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
                openSnackbar("Seu lembrete precisa de um nome.", 'error')
                addMessageToChat(props, { sender: 'bot', text: 'Por favor, me diga o que você quer lembrar.' })
                return
            }

            props.setReminder(prev => ({ ...prev, title: trimmedValue }))

            const updatedHandlerProps = {
                ...props,
                reminder: { ...props.reminder, title: trimmedValue }
            }

            addMessageWithTyping(props, {
                sender: 'bot',
                text: getRandomDateResponse(trimmedValue),
                component: UI.renderDatePicker(updatedHandlerProps)
            })

            props.setShowTextInput(false)
            props.setStep(ConversationStep.ASKING_DATE)
            break
        case ConversationStep.ASKING_NOTIFICATIONS:
            moveToConfirmation(props)
            break
    }
}