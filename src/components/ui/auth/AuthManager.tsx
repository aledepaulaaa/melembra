'use client'
// melemebra/src/components/ui/auth/AuthManager.tsx (VERSÃO FINAL E CORRETA)
import React from 'react'
import { auth } from '@/app/lib/firebase'
import { onAuthStateChanged, User } from 'firebase/auth'
import { useAppDispatch } from '@/app/store/hooks'
import { clearAuthUser, setAuthUser } from '@/app/store/slices/authSlice'

interface AuthContextType {
    user: User | null
    userId: string | null
    loading: boolean
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined)

function AuthListener({ children }: { children: React.ReactNode }) {
    const dispatch = useAppDispatch()

    React.useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                // Se um usuário for encontrado, serializamos e despachamos para o Redux.
                dispatch(setAuthUser({
                    uid: user.uid,
                    email: user.email,
                    isAnonymous: user.isAnonymous,
                }))
            } else {
                // Se não houver usuário, limpamos o estado no Redux.
                dispatch(clearAuthUser())
            }
        })
        return () => unsubscribe() // Limpa o listener
    }, [dispatch])

    return <>{children}</>
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = React.useState<User | null>(null)
    const [loading, setLoading] = React.useState(true)

    React.useEffect(() => {
        // Este é o listener principal. Ele APENAS ouve.
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser)
            setLoading(false)
        })
        return () => unsubscribe()
    }, [])

    return (
        <AuthContext.Provider value={{ user, userId: user?.uid || null, loading }}>
            <AuthListener>{children}</AuthListener>
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = React.useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider')
    }
    return context
}