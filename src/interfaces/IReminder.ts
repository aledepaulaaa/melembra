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
    category: string | null
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
    archived?: boolean
    category?: string 
}

export enum ConversationStep {
    ASKING_CATEGORY,
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
    setUserInput: React.Dispatch<React.SetStateAction<string>>
    setStep: React.Dispatch<React.SetStateAction<ConversationStep>>
    setShowTextInput: React.Dispatch<React.SetStateAction<boolean>>
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
    setIsBotTyping: React.Dispatch<React.SetStateAction<boolean>>
    setIsAuthPromptOpen: React.Dispatch<React.SetStateAction<boolean>>
    onChatStart: () => void
    openSnackbar: (message: string, severity?: AlertColor) => void
    dispatch: any
}

// Lista pré-definida de categorias para os Chips
export const defaultCategories = ["Saúde", "Estudos", "Trabalho", "Casa", "Financeiro"]

export interface ReminderCustomizationFormProps {
    description: string
    selectedColor: string
    imageFile: File | null
    imagePreview: string | null
    isUploading: boolean
    onDescriptionChange: (text: string) => void
    onColorSelect: (color: string) => void
    onImageSelect: (file: File | null) => void
    onConfirm: () => void
}