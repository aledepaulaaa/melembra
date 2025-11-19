'use client'
//appbora/src/hooks/forms/useReminderForm.ts
import React from "react"
import { ConversationStep, ReminderState } from "@/interfaces/IReminder"
import { useAppDispatch, useAppSelector } from "@/app/store/hooks"
import useAudioRecorder from "../useAudioRecorder"

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

    const audioRecorder = useAudioRecorder()

    const [reminder, setReminder] = React.useState<ReminderState>({
        title: null, date: null, time: null, recurrence: null,
        cor: "#BB86FC", sobre: "", img: "",
        imageFile: null, imagePreview: null, imageBase64: null,
    })

    React.useEffect(() => {
        if (audioRecorder.audioBlob && !isLoading) {
            // Montamos um objeto "mock" das props necessárias para o handler funcionar
            // Isso evita ter que passar tudo via argumento na chamada do hook
            // OBS: Precisamos de uma referência segura para as funções de set

            const handlerProps = {
                dispatch,
                setReminder,
                setStep,
                setShowTextInput,
                setIsLoading,
                setIsBotTyping,
                setIsAuthPromptOpen, // Adicionado para satisfazer a interface
                openSnackbar: (msg: string, sev: any) => console.log(msg), // Placeholder, será injetado no componente real
                reminder,
                chatHistory,
                // As props abaixo não são usadas no voiceProcess mas a interface pede
                userId: null,
                router: null as any,
                subscription: null as any,
                onChatStart: () => { },
                userInput: ''
            }

            // Precisamos passar o openSnackbar real do componente UI, 
            // então talvez seja melhor chamar o handleVoiceProcess DIRETO no componente UI
            // mas para manter a lógica separada, vamos expor o audioBlob e tratar no componente.
        }
    }, [audioRecorder.audioBlob])

    return {
        // Estado local
        step, reminder, userInput, isLoading,
        isBotTyping, showTextInput, isAuthPromptOpen,
        // Setters
        setStep, setReminder, setUserInput, setIsLoading,
        setIsBotTyping, setShowTextInput, setIsAuthPromptOpen,
        // Redux
        dispatch, chatHistory,
        // Audio Recorder
        audioRecorder
    }
}