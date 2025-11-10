//bora-app/src/app/store/slices/reminderSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface ReminderItem {
    id: number
    text: string
}

interface ReminderState {
    reminders: ReminderItem[]
    isSaving: boolean
}

const initialState: ReminderState = {
    reminders: [{ id: 0, text: '' }],
    isSaving: false,
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
        resetReminders: (state) => {
            state.reminders = [{ id: 0, text: '' }]
        },
        setSavingStatus: (state, action: PayloadAction<boolean>) => {
            state.isSaving = action.payload
        },
    },
})

export const { addReminder, updateReminder, resetReminders, setSavingStatus } = reminderSlice.actions
export default reminderSlice.reducer