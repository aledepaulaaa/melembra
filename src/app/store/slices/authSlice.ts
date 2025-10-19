// melemebra/src/app/store/slices/authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

// O objeto User do Firebase não é serializável, então pegamos só o que precisamos.
interface SerializedUser {
    uid: string
    email: string | null
    isAnonymous: boolean
}

interface AuthState {
    user: SerializedUser | null
    status: 'loading' | 'authenticated' | 'unauthenticated'
}

const initialState: AuthState = {
    user: null,
    status: 'loading',
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setAuthUser: (state, action: PayloadAction<SerializedUser>) => {
            state.user = action.payload
            state.status = 'authenticated'
        },
        clearAuthUser: (state) => {
            state.user = null
            state.status = 'unauthenticated'
        },
    },
})

export const { setAuthUser, clearAuthUser } = authSlice.actions
export default authSlice.reducer