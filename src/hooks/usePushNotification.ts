//melembra/src/hooks/usePushNotification.ts
'use client'
import React from "react"
import { useAppSelector } from "@/app/store/hooks"
import { useSnackbar } from "@/contexts/SnackbarProvider"
import { urlBase64ToUint8Array } from "@/app/utils/base64"
import { sendNotification, subscribeUser, unsubscribeUser } from "@/app/actions/actions"

const REGISTRATION_PATH = '/sw-push-handler.js' // ajuste se o seu SW estiver em outro caminho

async function ensureServiceWorkerRegistered(): Promise<ServiceWorkerRegistration | null> {
    if (!('serviceWorker' in navigator)) return null

    try {
        // tenta pegar uma registration existente — é rápido e não espera por 'ready'
        let registration = await navigator.serviceWorker.getRegistration()
        if (registration) return registration

        // se não existir, tenta registrar um SW no path configurado
        registration = await navigator.serviceWorker.register(REGISTRATION_PATH)
        // registration pode não estar ativo imediatamente; devolvemos o objeto mesmo assim
        return registration
    } catch (err) {
        console.error('[SW] Falha ao garantir registro do Service Worker:', err)
        return null
    }
}

export const usePushNotification = () => {
    const { user } = useAppSelector((state) => state.auth)
    const { openSnackbar } = useSnackbar()
    const [isSupported, setIsSupported] = React.useState(false)
    const [subscription, setSubscription] = React.useState<PushSubscription | null>(null)
    const [message, setMessage] = React.useState('Este é um lembrete de teste!')
    const [isLoading, setIsLoading] = React.useState(true)

    React.useEffect(() => {
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window) {
            setIsSupported(true)
        } else {
            setIsSupported(false)
        }
    }, [])

    React.useEffect(() => {
        if (!isSupported) {
            setIsLoading(false)
            return
        }

        let mounted = true
        const checkSubscription = async () => {
            setIsLoading(true)
            try {
                const registration = await ensureServiceWorkerRegistered()
                if (!registration) {
                    console.warn('[Push] Nenhuma registration disponível para PushManager')
                    if (mounted) {
                        setSubscription(null)
                    }
                    return
                }

                // usa getSubscription() (rápido) em vez de .ready que pode esperar indefinidamente
                const sub = await registration.pushManager.getSubscription()
                if (mounted) setSubscription(sub)
            } catch (error) {
                console.error("Erro ao verificar a inscrição do Service Worker:", error)
            } finally {
                if (mounted) setIsLoading(false)
            }
        }

        checkSubscription()

        return () => { mounted = false }
    }, [isSupported, user])

    const handleSubscribe = async () => {
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
            const permission = await Notification.requestPermission()
            if (permission !== 'granted') {
                openSnackbar('Permissão para notificações não concedida.', 'info')
                return
            }

            const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
            if (!vapidPublicKey) {
                throw new Error("Chave VAPID pública não configurada no ambiente.")
            }

            const registration = await ensureServiceWorkerRegistered()
            if (!registration) throw new Error('Service Worker não disponível para inscrição.')

            const sub = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
            })

            // envia para o servidor (server action)
            const result = await subscribeUser(sub.toJSON(), user.uid)
            if (!result || !result.success) {
                throw new Error(result?.error || 'Falha ao salvar inscrição no servidor.')
            }

            setSubscription(sub)
            openSnackbar('Notificações ativadas com sucesso!', 'success')

        } catch (error) {
            console.error("Erro detalhado ao inscrever:", error)
            openSnackbar(error instanceof Error ? error.message : 'Não foi possível ativar as notificações.', 'error')

            try {
                const registration = await navigator.serviceWorker.getRegistration()
                const sub = registration ? await registration.pushManager.getSubscription() : null
                if (sub) await sub.unsubscribe()
                setSubscription(null)
            } catch (cleanupError) {
                console.error("Erro ao tentar limpar a inscrição falha:", cleanupError)
            }
        } finally {
            setIsLoading(false)
        }
    }

    const handleUnsubscribe = async () => {
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
        subscription,
        isLoading,
        message,
        setMessage,
        handleSubscribe,
        handleUnsubscribe,
        handleSendTest,
    }
}
