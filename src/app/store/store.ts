//melembra/src/app/store/store.ts
import { configureStore } from '@reduxjs/toolkit'
import reminderReducer from './slices/reminderSlice'

export const store = configureStore({
    reducer: {
        reminders: reminderReducer,
    },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch