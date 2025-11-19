'use client'
// appbora/app/lib/forms/reminderFormHandlers.tsx
import { saveReminder } from '@/app/actions/actions'
import { HandlerProps, ConversationStep, SerializableChatMessage } from '@/interfaces/IReminder'
import { getDownloadURL, uploadBytes, ref } from 'firebase/storage'
import { storage } from '@/app/lib/firebase'
import { addChatMessage, clearChatHistory, updateLastMessage } from '@/app/store/slices/reminderSlice'
import { getRandomDateResponse } from '@/app/lib/dateRequestResponses'

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

/**
 * Lógica do "Novo Chat".
 * Reseta o estado do lembrete local, limpa o histórico do Redux e volta para o passo inicial.
 */
export const handleNewChat = (props: HandlerProps) => {
    // 1. Limpa histórico no Redux
    props.dispatch(clearChatHistory())

    // 2. Reseta estado local do lembrete
    props.setReminder({
        title: null, date: null, time: null, recurrence: null,
        cor: '#BB86FC', sobre: '', img: '', imageFile: null,
        imagePreview: null, imageBase64: null
    })

    // 3. Reseta passos e inputs
    props.setStep(ConversationStep.ASKING_TITLE)
    props.setShowTextInput(true)
    props.setUserInput('')
    props.setIsLoading(false)

    // 4. Inicia conversa novamente (opcional, dependendo se você quer que o bot fale primeiro ou não)
    props.onChatStart() // props que chama a função de inicializar o chat de novo, basicamente um "Oi" novamente
}

/**
 * Processa o áudio gravado:
 * 1. Envia para API de Transcrição.
 * 2. Envia texto para API do Gemini (Análise).
 * 3. Preenche o formulário e avança para confirmação/personalização.
 */
export const handleVoiceProcess = async (props: HandlerProps, audioBlob: Blob) => {
    if (!audioBlob) return

    props.setIsLoading(true)

    // 1. UX: Adiciona mensagem temporária do usuário
    addMessageToChat(props, { sender: 'user', text: '🎤 ...' })

    // 2. UX: Bot avisa que está ouvindo
    addMessageWithTyping(props, { sender: 'bot', text: 'Ouvindo...' }, 100)

    try {
        // --- TRANSCRICAO ---
        const formData = new FormData()
        formData.append('file', audioBlob)

        const transResponse = await fetch('/api/transcricao', {
            method: 'POST',
            body: formData
        })

        if (!transResponse.ok) throw new Error('Erro na transcrição')

        const { text: transcribedText } = await transResponse.json()

        // AQUI ESTÁ A MÁGICA DA UX PERFEITA:
        // Atualiza o "🎤 ..." do usuário com o texto real que ele falou
        props.dispatch(updateLastMessage({ sender: 'user', text: transcribedText }))

        // Atualiza o "Ouvindo..." do bot para algo indicando processamento da IA
        props.dispatch(updateLastMessage({ sender: 'bot', text: 'Analisando...' }))


        // --- ANÁLISE GEMINI ---
        // (Atenção: ajuste o endpoint conforme definimos na Etapa 1, você disse que renomeou para api/gemini)
        const analyzeResponse = await fetch('/api/gemini', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                text: transcribedText,
                currentDate: new Date().toISOString()
            })
        })

        if (!analyzeResponse.ok) throw new Error('Erro na inteligência')

        const { data } = await analyzeResponse.json()

        // Popula o estado
        let newDate = null
        if (data.date) {
            // Truque para evitar problemas de fuso horário (UTC vs Local):
            // Criamos a data setando o horário para meio-dia (T12:00:00), 
            // assim qualquer fuso -3h ou +3h continua caindo no mesmo dia.
            newDate = new Date(`${data.date}T12:00:00`)
        } else {
            // Se a IA não achou data, define hoje
            newDate = new Date()
        }

        props.setReminder(prev => ({
            ...prev,
            title: data.title || transcribedText,
            sobre: data.description || '',
            date: newDate,
            time: data.time || null,
            recurrence: data.recurrence || 'Não repetir'
        }))

        props.setShowTextInput(false)

        // Substitui o "Analisando..." pela resposta final
        props.dispatch(updateLastMessage({
            sender: 'bot',
            text: `Entendido! Criei o lembrete: "${data.title}".\nDeseja personalizar algo ou salvar?`
        }))

        props.setStep(ConversationStep.ASKING_CUSTOMIZATION)

    } catch (error) {
        console.error(error)
        props.openSnackbar('Não consegui entender o áudio perfeitamente.', 'error')

        // Se falhar, atualiza para mensagem de erro
        props.dispatch(updateLastMessage({ sender: 'bot', text: 'Tive um problema para ouvir. Tente escrever.' }))
        props.setShowTextInput(true)
    } finally {
        props.setIsLoading(false)
    }
}