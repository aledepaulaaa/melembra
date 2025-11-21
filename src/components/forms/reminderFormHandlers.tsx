'use client'
// appbora/app/lib/forms/reminderFormHandlers.tsx
import { saveReminder } from '@/app/actions/actions'
import { HandlerProps, ConversationStep, SerializableChatMessage } from '@/interfaces/IReminder'
import { getDownloadURL, uploadBytes, ref } from 'firebase/storage'
import { storage } from '@/app/lib/firebase'
import { addChatMessage, clearChatHistory, updateLastMessage } from '@/app/store/slices/reminderSlice'

/**
 * Adiciona uma mensagem serializável ao store do Redux.
 * Esta é a principal função para adicionar novas mensagens ao chat.
 */
export const addMessageToChat = (props: HandlerProps, message: Omit<SerializableChatMessage, 'id'>) => {
    props.dispatch(addChatMessage({ ...message, id: Date.now() }))
}

// Função auxiliar para chamar a IA (reutilizável p/ Texto e Áudio)
const processTextWithAI = async (props: HandlerProps, textToAnalyze: string) => {
    try {
        props.setIsLoading(true)
        props.dispatch(require('@/app/store/slices/reminderSlice').updateLastMessage({
            sender: 'bot', text: 'Analisando...'
        }))

        const analyzeResponse = await fetch('/api/gemini', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                text: textToAnalyze,
                currentDate: new Date().toISOString() // Envia a hora atual do usuário
            })
        })

        const { data } = await analyzeResponse.json()

        // Lógica de processamento (igual a que fizemos antes)
        let newDate = data.date ? new Date(`${data.date}T12:00:00`) : null

        props.setReminder(prev => ({
            ...prev,
            title: data.title || textToAnalyze,
            date: newDate || prev.date,
            time: data.time || prev.time,
            category: data.category || prev.category || 'Geral'
        }))

        props.setShowTextInput(false)

        // Smart Skip Logic
        if (data.title && data.date && data.time) {
            props.dispatch(require('@/app/store/slices/reminderSlice').updateLastMessage({
                sender: 'bot',
                text: `Entendi! "${data.title}" para ${new Date(`${data.date}T${data.time}`).toLocaleString('pt-BR')}.\nDeseja personalizar?`
            }))
            props.setStep(ConversationStep.ASKING_CUSTOMIZATION)
        } else if (data.date && !data.time) {
            props.dispatch(require('@/app/store/slices/reminderSlice').updateLastMessage({ sender: 'bot', text: `Certo, dia ${data.date}. Qual horário?` }))
            props.setStep(ConversationStep.ASKING_TIME)
        } else {
            // Fallback padrão
            props.dispatch(require('@/app/store/slices/reminderSlice').updateLastMessage({ sender: 'bot', text: 'Para quando devo agendar?' }))
            props.setStep(ConversationStep.ASKING_DATE)
        }

    } catch (e) {
        console.error(e)
    } finally {
        props.setIsLoading(false)
    }
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
                category: reminder.category
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
        reminder.title,
        reminder.date,
        userId,
        reminder.recurrence || 'Não repetir',
        reminder.cor,
        reminder.sobre || '',
        imageUrl,
        reminder.category || 'Geral'
    )

    if (result.success) {
        openSnackbar('Lembrete salvo com sucesso!', 'success')
        addMessageWithTyping(props, {
            sender: 'bot', text: 'Seu lembrete foi criado!',
        })

        // LÓGICA DE BLOQUEIO IMEDIATO PARA FREE
        if (props.subscription.plan === 'free') {
            // Pequeno delay para o usuário ler a mensagem de sucesso
            setTimeout(() => {
                props.router.refresh()
                props.router.push('/lembretes')
            }, 2000)
        } else {
            // Se for Premium, mostra botão de "Novo Lembrete" ou reseta o chat
            addMessageToChat(props, {
                sender: 'bot',
                text: 'Quer criar outro? Só clicar no ícone de novo chat lá em cima!'
            })
        }

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
        imagePreview: null, imageBase64: null, category: null
    })
    props.setShowTextInput(true)
    props.setStep(ConversationStep.ASKING_TITLE)
}

// --- FUNÇÃO Seleção de Categoria via Chip ---
export const handleCategorySelect = (props: HandlerProps, category: string) => {
    props.setReminder(prev => ({ ...prev, category }))

    // UX: Mostra o que foi selecionado
    addMessageToChat(props, { sender: 'user', text: `Categoria: ${category}` })

    // Avança
    addMessageWithTyping(props, { sender: 'bot', text: 'Sobre o que é o seu lembrete?' })

    props.setStep(ConversationStep.ASKING_TITLE)
    props.setShowTextInput(true) // Garante que o input apareça para digitar o título
}

export const handleUserInput = (props: HandlerProps, value: string, chatHistoryLength: number) => {
    if (props.isLoading) return
    if (chatHistoryLength === 0) props.onChatStart()

    const trimmedValue = value.trim()
    addMessageToChat(props, { sender: 'user', text: trimmedValue || "Pular" })

    if ((props.step === ConversationStep.ASKING_TITLE || props.step === ConversationStep.ASKING_CATEGORY) && trimmedValue.length > 15) {
        processTextWithAI(props, trimmedValue)
        return
    }

    switch (props.step) {
        case ConversationStep.ASKING_CATEGORY:
            // Se o usuário digitou algo na etapa de categoria (ex: clicou em "Outra"), salvamos como categoria
            if (!trimmedValue) return
            props.setReminder(prev => ({ ...prev, category: trimmedValue }))
            addMessageWithTyping(props, { sender: 'bot', text: 'Entendi. E o que devo lembrar?' })
            props.setStep(ConversationStep.ASKING_TITLE)
            break

        case ConversationStep.ASKING_TITLE:
            if (!trimmedValue) {
                props.openSnackbar("Seu lembrete precisa de um nome.", 'error')
                return
            }
            props.setReminder(prev => ({ ...prev, title: trimmedValue }))
            addMessageWithTyping(props, { sender: 'bot', text: 'Para quando devo agendar?' }) // Simplificado, pode usar getRandomDateResponse
            props.setShowTextInput(false) // Esconde teclado para mostrar DatePicker
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
        imagePreview: null, imageBase64: null, category: null
    })

    // 3. Reseta passos e inputs
    props.setUserInput('')
    props.setShowTextInput(true)
    props.setIsLoading(false)
    props.setStep(ConversationStep.ASKING_TITLE)

    setTimeout(() => {
        props.onChatStart()
        addMessageToChat(props, {
            sender: 'bot',
            text: 'Novo lembrete! O que manda?'
        })
    }, 100)
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

    // UX Feedback
    addMessageToChat(props, { sender: 'user', text: '🎤 ...' })
    addMessageWithTyping(props, { sender: 'bot', text: 'Ouvindo...' }, 100)

    try {
        // 1. Transcrição
        const formData = new FormData()
        formData.append('file', audioBlob)
        const transResponse = await fetch('/api/transcricao', { method: 'POST', body: formData })
        if (!transResponse.ok) throw new Error('Erro transcrição')
        const { text: transcribedText } = await transResponse.json()

        props.dispatch(updateLastMessage({ sender: 'user', text: transcribedText }))
        props.dispatch(updateLastMessage({ sender: 'bot', text: 'Analisando...' }))

        // 2. Inteligência Gemini
        const analyzeResponse = await fetch('/api/gemini', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: transcribedText, currentDate: new Date().toISOString() })
        })
        if (!analyzeResponse.ok) throw new Error('Erro IA')
        const { data } = await analyzeResponse.json()

        // 3. Processamento dos Dados (Smart Logic)
        let newDate = data.date ? new Date(`${data.date}T12:00:00`) : null

        // Atualiza estado com TUDO que a IA encontrou
        props.setReminder(prev => ({
            ...prev,
            title: data.title || transcribedText,
            sobre: data.description || prev.sobre,
            date: newDate || prev.date, // Mantém anterior se IA retornar null (caso de edição futura)
            time: data.time || prev.time,
            recurrence: data.recurrence || 'Não repetir',
            category: data.category || prev.category || 'Geral' // IA infere ou mantemos o que user escolheu
        }))

        props.setShowTextInput(false)

        // --- LÓGICA DE PULO DE ETAPAS (SMART SKIP) ---

        // Cenário 1: IA detectou Título, Data e Hora -> Vai direto para confirmar/personalizar
        if (data.title && data.date && data.time) {
            props.dispatch(updateLastMessage({
                sender: 'bot',
                text: `Entendi! "${data.title}" em ${data.date} às ${data.time} (${data.category}).\nDeseja personalizar ou salvar?`
            }))
            props.setStep(ConversationStep.ASKING_CUSTOMIZATION)
        }
        // Cenário 2: IA detectou Data mas não Hora
        else if (data.date && !data.time) {
            props.dispatch(updateLastMessage({ sender: 'bot', text: `Certo, dia ${data.date}. Qual o horário?` }))
            props.setStep(ConversationStep.ASKING_TIME)
        }
        // Cenário 3: Faltou Data (mesmo tendo título)
        else {
            props.dispatch(updateLastMessage({ sender: 'bot', text: `Entendi "${data.title}". Para qual dia?` }))
            props.setStep(ConversationStep.ASKING_DATE)
        }

    } catch (error) {
        console.error(error)
        props.dispatch(updateLastMessage({ sender: 'bot', text: 'Não entendi bem. Pode digitar?' }))
        props.setShowTextInput(true)
    } finally {
        props.setIsLoading(false)
    }
}

export const triggerCategoryFlow = (props: HandlerProps) => {
    // Bot pergunta qual categoria
    addMessageToChat(props, { sender: 'user', text: 'Definir Categoria' })
    addMessageWithTyping(props, {
        sender: 'bot',
        text: 'Ok, selecione uma abaixo ou clique em "Outra" para criar uma nova:'
    })

    // Muda o passo para renderizar os chips
    props.setStep(ConversationStep.ASKING_CATEGORY)
    props.setShowTextInput(true)
}

export const handleImageProcess = async (props: HandlerProps, imageFile: File) => {
    props.setIsLoading(true)
    addMessageToChat(props, { sender: 'user', text: '📷 [Analisando imagem...]' })

    try {
        const formData = new FormData()
        formData.append('file', imageFile)

        // 1. Cloud Vision
        const visionRes = await fetch('/api/vision', { method: 'POST', body: formData })
        if (!visionRes.ok) throw new Error('Erro na visão')
        const { text: imageDescription } = await visionRes.json()

        // 2. Envia descrição para o Gemini criar o lembrete
        // O Gemini vai receber: "Texto detectado: Boleto nubank vencimento 20/11..."
        // E vai retornar o JSON do lembrete pronto.
        await processTextWithAI(props, `Crie um lembrete baseado nesta imagem: ${imageDescription}`)

    } catch (error) {
        console.error(error)
        addMessageToChat(props, { sender: 'bot', text: 'Não consegui ler essa imagem. Tente uma mais clara.' })
    } finally {
        props.setIsLoading(false)
    }
}