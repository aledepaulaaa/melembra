'use client'
//appbora/src/components/ui/auth/AuthManager.tsx
import React from 'react'
import { auth } from '@/app/lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { useAppDispatch } from '@/app/store/hooks'
import { setAuthUser, clearAuthUser } from '@/app/store/slices/authSlice'
import Cookies from 'js-cookie'

const AUTH_COOKIE_NAME = 'firebase-auth-token'

/**
 * AuthListener é um componente "invisível" que sincroniza o estado de
 * autenticação do Firebase com a store do Redux.
 * Ele deve ser renderizado apenas uma vez no topo da árvore de componentes.
 */
function AuthListener() {
    const dispatch = useAppDispatch()

    React.useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // Se um usuário for encontrado, serializamos e despachamos para o Redux.
                dispatch(setAuthUser({
                    uid: user.uid,
                    email: user.email,
                    isAnonymous: user.isAnonymous,
                }))

                const token = await user.getIdToken()
                Cookies.set(AUTH_COOKIE_NAME, token, {
                    expires: 7, // Expira em 7 dias
                    secure: process.env.NODE_ENV === 'production',
                    path: '/'
                })

            } else {
                // Se não houver usuário, limpamos o estado no Redux.
                dispatch(clearAuthUser())

                Cookies.remove(AUTH_COOKIE_NAME, { path: '/' })
            }
        })
        // A função de limpeza é chamada quando o componente é desmontado
        return () => unsubscribe()
    }, [dispatch])

    // Este componente não renderiza nenhuma UI
    return null
}

/**
 * AuthProvider é o componente que você usará no seu layout.
 * Sua única função é garantir que o AuthListener seja montado e
 * que os componentes filhos (o resto do seu app) sejam renderizados.
 */
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    return (
        <>
            <AuthListener />
            {children}
        </>
    )
}