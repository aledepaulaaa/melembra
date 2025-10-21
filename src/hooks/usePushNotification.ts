'use client'
//melembra/src/hooks/usePushNotification.ts
import { useState, useEffect } from "react"
import { urlBase64ToUint8Array } from "@/app/utils/base64"
import { sendNotification, subscribeUser, unsubscribeUser } from "@/app/actions/actions"

// NOVO: Importar os hooks do Redux e do Snackbar
import { useAppSelector } from "@/app/store/hooks"
import { useSnackbar } from "@/contexts/SnackbarProvider"

export const usePushNotification = () => {
    // ALTERADO: Lê o usuário do Redux, a fonte única da verdade.
    const { user } = useAppSelector((state) => state.auth)
    const { openSnackbar } = useSnackbar() // NOVO: Hook para feedback

    const [isSupported, setIsSupported] = useState(false)
    const [subscription, setSubscription] = useState<PushSubscription | null>(null)
    const [message, setMessage] = useState('Este é um lembrete de teste!')
    const [isLoading, setIsLoading] = useState(true) // NOVO: Estado de carregamento

    useEffect(() => {
        const checkSupportAndSubscription = async () => {
            if ('serviceWorker' in navigator && 'PushManager' in window) {
                setIsSupported(true)
                // Apenas verifica a inscrição existente, não pede permissão.
                const registration = await navigator.serviceWorker.ready
                const sub = await registration.pushManager.getSubscription()
                setSubscription(sub)
            }
            setIsLoading(false)
        }
        checkSupportAndSubscription()
    }, [user]) // Re-executa se o usuário mudar (login/logout)

    // A função registerServiceWorker não é mais necessária no useEffect.

    const handleSubscribe = async () => {
        // ALTERADO: Lógica completa para pedir permissão no clique.
        if (!user) {
            openSnackbar('Você precisa ter uma conta para ativar as notificações.', 'warning')
            return
        }
        if (Notification.permission === 'denied') {
            openSnackbar('As notificações estão bloqueadas. Altere nas configurações do seu navegador.', 'error')
            return
        }

        setIsLoading(true)
        try {
            // Pede a permissão ao usuário AQUI
            const permission = await Notification.requestPermission()
            if (permission !== 'granted') {
                openSnackbar('Permissão para notificações não concedida.', 'info')
                setIsLoading(false)
                return
            }

            const registration = await navigator.serviceWorker.ready
            const sub = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(
                    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
                ),
            })

            // Vincula a inscrição ao UID do usuário logado
            await subscribeUser(sub.toJSON() as any, user.uid)
            setSubscription(sub)
            openSnackbar('Notificações ativadas com sucesso!', 'success')
        } catch (error) {
            console.error("Erro ao inscrever:", error)
            openSnackbar('Não foi possível ativar as notificações.', 'error')
        } finally {
            setIsLoading(false)
        }
    }

    const handleUnsubscribe = async () => {
        // ALTERADO: Lógica mais robusta com feedback e verificação de usuário.
        if (!user) return
        if (!subscription) return

        setIsLoading(true)
        try {
            await subscription.unsubscribe()
            await unsubscribeUser(user.uid)
            setSubscription(null)
            openSnackbar('Notificações desativadas.', 'info')
        } catch (error) {
            console.error("Erro ao desinscrever:", error)
            openSnackbar('Falha ao desativar as notificações.', 'error')
        } finally {
            setIsLoading(false)
        }
    }

    const handleSendTest = async () => {
        // ALTERADO: Lógica mais robusta com feedback e verificação de usuário.
        if (!user) return
        if (!message.trim()) {
            openSnackbar('Digite uma mensagem para o teste.', 'warning')
            return
        }

        try {
            await sendNotification(message, user.uid)
            openSnackbar('Notificação de teste enviada!', 'success')
        } catch (error) {
            openSnackbar('Falha ao enviar a notificação.', 'error')
        }
    }

    return {
        isSupported,
        // ALTERADO: Exporta um booleano para facilitar a vida do componente
        isSubscribed: !!subscription,
        isLoading, // NOVO: Exporta o estado de carregamento
        message,
        setMessage,
        handleSubscribe,
        handleUnsubscribe,
        handleSendTest,
    }
}