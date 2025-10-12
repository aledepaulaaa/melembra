'use client'
//melembra/src/hooks/usePushNotification.ts
import { useState, useEffect } from "react"
import { urlBase64ToUint8Array } from "@/app/utils/base64"
import { sendNotification, subscribeUser, unsubscribeUser } from "@/app/actions/actions"
import { useAuth } from "@/components/AuthManager"

export const usePushNotification = () => {
    const { userId } = useAuth()
    const [isSupported, setIsSupported] = useState(false)
    const [subscription, setSubscription] = useState<PushSubscription | null>(null)
    const [message, setMessage] = useState('')

    useEffect(() => {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            setIsSupported(true)
            registerServiceWorker()
        }
    }, [])

    async function registerServiceWorker() {
        const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/',
            updateViaCache: 'none',
        })
        const sub = await registration.pushManager.getSubscription()
        setSubscription(sub)
    }

    const handleSubscribe = async () => {
        if (!userId) {
            console.error("User ID not available")
            return
        }
        const registration = await navigator.serviceWorker.ready
        const sub = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(
                process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
            ),
        })
        setSubscription(sub)
        const serializedSub = JSON.parse(JSON.stringify(sub))
        await subscribeUser(serializedSub, userId)
    }

    const handleUnsubscribe = async () => {
        if (subscription) {
            await subscription.unsubscribe()
            setSubscription(null)
            await unsubscribeUser(userId as string)
        }
    }

    const handleSendTest = async () => {
        if (subscription) {
            await sendNotification(message, userId as string)
            setMessage('')
        }
    }

    return {
        isSupported,
        subscription,
        message,
        setMessage,
        handleSubscribe,
        handleUnsubscribe,
        handleSendTest,
    }
}