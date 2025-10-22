'use client'
//melembra/src/hooks/usePushNotification.ts
import React from "react"
import { useAppSelector } from "@/app/store/hooks"
import { useSnackbar } from "@/contexts/SnackbarProvider"
import { urlBase64ToUint8Array } from "@/app/utils/base64"
import { sendNotification, subscribeUser, unsubscribeUser } from "@/app/actions/actions"

export const usePushNotification = () => {
    const { user } = useAppSelector((state) => state.auth)
    const { openSnackbar } = useSnackbar()
    const [isSupported, setIsSupported] = React.useState(false)
    const [subscription, setSubscription] = React.useState<PushSubscription | null>(null)
    const [message, setMessage] = React.useState('Este é um lembrete de teste!')
    const [isLoading, setIsLoading] = React.useState(true)

    React.useEffect(() => {
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator && window.PushManager) {
            setIsSupported(true)
        }
    }, [])

    React.useEffect(() => {
        if (!isSupported || !user) {
            // Se não há suporte ou usuário, não há o que carregar.
            setIsLoading(false)
            return
        }

        const checkSubscription = async () => {
            try {
                const registration = await navigator.serviceWorker.ready
                const sub = await registration.pushManager.getSubscription()
                setSubscription(sub)
            } catch (error) {
                console.error("Erro ao verificar a inscrição do Service Worker:", error)
            } finally {
                setIsLoading(false)
            }
        }

        checkSubscription()
    }, [isSupported, user])

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
        isSubscribed: !!subscription,
        isLoading,
        message,
        setMessage,
        handleSubscribe,
        handleUnsubscribe,
        handleSendTest,
    }
}