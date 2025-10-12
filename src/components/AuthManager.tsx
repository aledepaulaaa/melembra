'use client'
//melembra/src/components/AuthManager.tsx
import React from 'react'
import { auth } from '@/app/lib/firebase'
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth'

interface AuthContextType {
    userId: string | null
    loading: boolean
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [userId, setUserId] = React.useState<string | null>(null)
    const [loading, setLoading] = React.useState(true)

    React.useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // Usuário já autenticado (anônimo ou com login)
                setUserId(user.uid)
            } else {
                // Nenhum usuário logado, vamos criar um anônimo
                try {
                    const anonymousUser = await signInAnonymously(auth)
                    setUserId(anonymousUser.user.uid)
                } catch (error) {
                    console.error("Erro ao autenticar anonimamente:", error)
                    setUserId(null)
                }
            }
            setLoading(false)
        })

        // Limpeza da inscrição quando o componente for desmontado
        return () => unsubscribe()
    }, [])

    return (
        <AuthContext.Provider value={{ userId, loading }}>
            {children}
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