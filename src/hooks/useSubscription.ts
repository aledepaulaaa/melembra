// melembra/src/hooks/useSubscription.ts
import { useEffect } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '@/app/lib/firebase' // SDK do CLIENTE para o frontend
import {
    setSubscriptionActive,
    setSubscriptionInactive,
    setSubscriptionLoading,
    setSubscriptionError,
} from '@/app/store/slices/subscriptionSlice'
import { useAppDispatch } from '@/app/store/hooks'
import { ISubscription } from '@/interfaces/IMeLembraPayment'

export function useSubscription(userId: string | null) {
    const dispatch = useAppDispatch()

    useEffect(() => {
        if (!userId) {
            // Se não há usuário, o plano é 'free' por padrão
            dispatch(setSubscriptionInactive())
            return
        }

        // Inicia o estado como 'carregando'
        dispatch(setSubscriptionLoading())

        // Referência ao documento de assinatura do usuário
        const subscriptionDocRef = doc(db, 'subscriptions', userId)

        // onSnapshot cria um listener em tempo real
        const unsubscribe = onSnapshot(
            subscriptionDocRef,
            (docSnapshot) => {
                if (docSnapshot.exists()) {
                    const subscriptionData = docSnapshot.data() as ISubscription
                    const isActive = subscriptionData.status === 'active' || subscriptionData.status === 'trialing'

                    if (isActive) {
                        // Se a assinatura está ativa, atualiza o estado
                        dispatch(setSubscriptionActive(subscriptionData))
                    } else {
                        // Se não está ativa (ex: cancelada, past_due), o plano é 'free'
                        dispatch(setSubscriptionInactive())
                    }
                } else {
                    // Se o documento não existe, o usuário não tem assinatura
                    dispatch(setSubscriptionInactive())
                }
            },
            (error) => {
                // Em caso de erro na escuta (ex: permissões)
                console.error("Erro ao ouvir o status da assinatura:", error)
                dispatch(setSubscriptionError())
            }
        )

        // Função de limpeza: remove o listener quando o componente é desmontado
        // Isso é crucial para evitar vazamentos de memória
        return () => unsubscribe()

    }, [userId, dispatch])
}