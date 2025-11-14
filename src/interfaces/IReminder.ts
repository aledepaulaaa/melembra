//bora-app/src/interfaces/IRedminderForm.ts
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime"
import { SubscriptionState } from "./IBoraPayment"
import { AlertColor } from "@mui/material"

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
    cor: string
    sobre: string
    img: string
    imageFile: File | null
    imagePreview: string | null
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
}

export enum ConversationStep {
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
    setReminder: React.Dispatch<React.SetStateAction<ReminderState>>
    setChatHistory: React.Dispatch<React.SetStateAction<ChatMessage[]>>
    setStep: React.Dispatch<React.SetStateAction<ConversationStep>>
    setShowTextInput: React.Dispatch<React.SetStateAction<boolean>>
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
    setIsBotTyping: React.Dispatch<React.SetStateAction<boolean>>
    onChatStart: () => void
    openSnackbar: (message: string, severity?: AlertColor) => void
}

// Definindo a paleta de cores permitida
export const colorPalette = ['#913FF5', '#BB86FC', '#220a8dff', '#FFFFFF']

export interface ReminderCustomizationFormProps {
    // Campos de estado
    description: string
    selectedColor: string
    imageFile: File | null
    imagePreview: string | null
    isUploading: boolean
    // Funções para atualizar o estado
    onDescriptionChange: (text: string) => void
    onColorSelect: (color: string) => void
    onImageSelect: (file: File | null) => void
    onConfirm: () => void // Ação ao confirmar a personalização
}