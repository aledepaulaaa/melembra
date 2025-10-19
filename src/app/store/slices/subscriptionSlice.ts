// melembra/src/app/store/slices/subscriptionSlice.ts
import { ISubscription, SubscriptionState } from '@/interfaces/IMeLembraPayment'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

// O estado inicial quando o app carrega
const initialState: SubscriptionState = {
    plan: 'free',
    status: 'loading',
    data: null,
}

export const subscriptionSlice = createSlice({
    name: 'subscription',
    initialState,
    reducers: {
        // Ação para quando começamos a verificar a assinatura
        setSubscriptionLoading: (state) => {
            state.status = 'loading'
        },
        // Ação para quando encontramos uma assinatura ativa
        setSubscriptionActive: (state, action: PayloadAction<ISubscription>) => {
            state.plan = 'plus' // Simplificamos para a UI saber que é 'plus'
            state.status = 'active'
            state.data = action.payload
        },
        // Ação para quando não há assinatura ou ela expirou/foi cancelada
        setSubscriptionInactive: (state) => {
            state.plan = 'free'
            state.status = 'inactive'
            state.data = null
        },
        // Ação em caso de erro ao buscar os dados
        setSubscriptionError: (state) => {
            state.plan = 'free'
            state.status = 'error'
            state.data = null
        },
    },
})

// Exporta as ações para serem usadas em outros lugares
export const {
    setSubscriptionLoading,
    setSubscriptionActive,
    setSubscriptionInactive,
    setSubscriptionError,
} = subscriptionSlice.actions

// Exporta o reducer para ser adicionado à store principal
export default subscriptionSlice.reducer