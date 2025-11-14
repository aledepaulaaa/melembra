//bora-app/src/hooks/forms/useReminderForm.ts
import React from "react"
import { ChatMessage, ConversationStep, ReminderState } from "@/interfaces/IReminder"

export default function useReminderForm() {
    const [userInput, setUserInput] = React.useState('')
    const [chatHistory, setChatHistory] = React.useState<ChatMessage[]>([])
    const [step, setStep] = React.useState<ConversationStep>(ConversationStep.ASKING_TITLE)
    const [isLoading, setIsLoading] = React.useState(false)
    const [showTextInput, setShowTextInput] = React.useState(true)
    const [isBotTyping, setIsBotTyping] = React.useState(false)
    const [reminder, setReminder] = React.useState<ReminderState>({
        title: null,
        date: null,
        time: null,
        recurrence: null,
        cor: "#BB86FC",
        sobre: "",
        img: "",
        imageFile: null,
        imagePreview: null
    })

    return {
        userInput,
        setUserInput,
        chatHistory,
        setChatHistory,
        step,
        setStep,
        reminder,
        setReminder,
        isLoading,
        isBotTyping,
        setIsLoading,
        setIsBotTyping,
        showTextInput,
        setShowTextInput,
    }
}