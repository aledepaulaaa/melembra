//melembra/src/interfaces/IRedminderForm.ts
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime"

export type ChatMessage = {
    id: number
    sender: 'user' | 'bot'
    text?: string
    component?: React.ReactNode
}

export type ReminderState = {
    title: string | null
    date: Date | null
    time: string | null
    recurrence: string | null
}

export enum ConversationStep {
    ASKING_TITLE,
    ASKING_DATE, ASKING_TIME,
    ASKING_RECURRENCE,
    ASKING_NOTIFICATIONS,
    CONFIRMING,
    SAVING
}
export interface ReminderFormProps {
    onChatStart: () => void
}

export interface HandlerProps {
    userId: string | null
    router: AppRouterInstance
    reminder: ReminderState
    isLoading: boolean
    step: ConversationStep
    setReminder: React.Dispatch<React.SetStateAction<ReminderState>>
    setChatHistory: React.Dispatch<React.SetStateAction<ChatMessage[]>>
    setStep: React.Dispatch<React.SetStateAction<ConversationStep>>
    setShowTextInput: React.Dispatch<React.SetStateAction<boolean>>
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
    setIsBotTyping: React.Dispatch<React.SetStateAction<boolean>>
    onChatStart: () => void
}