//appbora/src/hooks/forms/useReminderForm.ts
import React from "react"
import { ConversationStep, ReminderState } from "@/interfaces/IReminder"
import { useAppDispatch, useAppSelector } from "@/app/store/hooks"
import useAudioRecorder from "../useAudioRecorder"

export default function useReminderForm() {
    const dispatch = useAppDispatch()
    const chatHistory = useAppSelector((state) => state.reminders.chatHistory)

    const [userInput, setUserInput] = React.useState('')
    const [step, setStep] = React.useState<ConversationStep>(ConversationStep.ASKING_CATEGORY)

    const [isLoading, setIsLoading] = React.useState(false)
    const [showTextInput, setShowTextInput] = React.useState(true) // Pode começar false se formos mostrar só Chips
    const [isBotTyping, setIsBotTyping] = React.useState(false)
    const [isAuthPromptOpen, setIsAuthPromptOpen] = React.useState(false)

    const audioRecorder = useAudioRecorder()

    const [reminder, setReminder] = React.useState<ReminderState>({
        title: null,
        date: null,
        time: null,
        recurrence: null,
        category: null, // Inicializa categoria
        cor: "#BB86FC",
        sobre: "",
        img: "",
        imageFile: null,
        imagePreview: null,
        imageBase64: null,
    })

    return {
        step, reminder, userInput, isLoading,
        isBotTyping, showTextInput, isAuthPromptOpen,
        setStep, setReminder, setUserInput, setIsLoading,
        setIsBotTyping, setShowTextInput, setIsAuthPromptOpen,
        dispatch, chatHistory, audioRecorder
    }
}