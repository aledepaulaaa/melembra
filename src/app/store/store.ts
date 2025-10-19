//melembra/src/app/store/store.ts
import { configureStore } from '@reduxjs/toolkit'
import reminderReducer from './slices/reminderSlice'
import subscriptionReducer from './slices/subscriptionSlice'
import authReducer from './slices/authSlice'

export const store = configureStore({
    reducer: {
        reminders: reminderReducer,
        subscription: subscriptionReducer,
        auth: authReducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch