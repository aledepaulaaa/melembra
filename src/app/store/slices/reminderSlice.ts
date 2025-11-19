//appbora/src/app/store/slices/reminderSlice.ts
import { SerializableChatMessage } from '@/interfaces/IReminder'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface ReminderState {
    reminders: any[]
    isSaving: boolean
    chatHistory: SerializableChatMessage[]
}

const initialState: ReminderState = {
    reminders: [],
    isSaving: false,
    chatHistory: []
}

export const reminderSlice = createSlice({
    name: 'reminders',
    initialState,
    reducers: {
        addReminder: (state, action: PayloadAction<string>) => {
            const newId = state.reminders.length > 0 ? state.reminders[state.reminders.length - 1].id + 1 : 0
            state.reminders.push({ id: newId, text: action.payload })
        },
        updateReminder: (state, action: PayloadAction<{ id: number; text: string }>) => {
            const index = state.reminders.findIndex(item => item.id === action.payload.id)
            if (index !== -1) {
                state.reminders[index].text = action.payload.text
            }
        },
        updateLastMessage: (state, action: PayloadAction<{ text: string, sender: 'user' | 'bot' }>) => {
            // Encontra o índice da última mensagem desse remetente
            const index = [...state.chatHistory].reverse().findIndex(msg => msg.sender === action.payload.sender)
            
            if (index !== -1) {
                // Como usamos o reverse() para achar, precisamos calcular o índice real no array original
                const realIndex = state.chatHistory.length - 1 - index
                state.chatHistory[realIndex].text = action.payload.text
            }
        },
        resetReminders: (state) => {
            state.reminders = [{ id: 0, text: '' }]
        },
        setSavingStatus: (state, action: PayloadAction<boolean>) => {
            state.isSaving = action.payload
        },
        setChatHistory: (state, action: PayloadAction<SerializableChatMessage[]>) => {
            state.chatHistory = action.payload
        },
        addChatMessage: (state, action: PayloadAction<SerializableChatMessage>) => {
            state.chatHistory.push(action.payload)
        },
        clearChatHistory: (state) => {
            state.chatHistory = []
        },
        // Remove a última mensagem se ela tiver um componente (botões, etc.)
        clearLastMessageComponent: (state) => {
            if (state.chatHistory.length > 0) {
                // Esta ação não é trivial de implementar sem o componente.
                // Vamos lidar com isso de outra forma nos handlers.
            }
        }
    },
})

export const {
    addReminder,
    updateReminder,
    updateLastMessage,
    resetReminders,
    setSavingStatus,
    setChatHistory,
    addChatMessage,
    clearChatHistory,
} = reminderSlice.actions

export default reminderSlice.reducer