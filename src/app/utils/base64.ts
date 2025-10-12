'use client'
//melembra/src/app/utils/base64.ts

export function urlBase64ToUint8Array(base64String: string) {
    if (typeof window === 'undefined') {
        throw new Error('Esta função só pode ser executada no navegador');
    }

    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
}