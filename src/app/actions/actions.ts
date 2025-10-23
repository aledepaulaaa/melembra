//melembra/src/app/actions/actions.ts
'use server'
import webpush from 'web-push'
// 1. IMPORTAÇÕES SEPARADAS: Admin para escrita, Cliente para leitura.
import { getFirebaseFirestore as getAdminDb, getFirebaseAuth } from '../lib/firebase-admin'
import { Timestamp as AdminTimestamp } from 'firebase-admin/firestore'

// --- INSTÂNCIAS ---
const db = getAdminDb() // SDK de Admin: usado para todas as operações de escrita (ignora regras de segurança)
const adminAuth = getFirebaseAuth()

// --- CONFIGURAÇÃO ---
webpush.setVapidDetails(
    `mailto:${process.env.VAPID_EMAIL || 'contatoaledev@gmail.com'}`,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
)

// --- FUNÇÕES DE ESCRITA E MODIFICAÇÃO (Convertidas para o Admin SDK) ---
export async function subscribeUser(sub: PushSubscriptionJSON, userId: string) {
    if (!userId) throw new Error('É necessário o UserID do usuário para inscrição')
    try {
        const docRef = db.collection('inscricoes').doc(userId)
        await docRef.set({ subscription: sub, userId: userId, createdAt: new Date() })
        return { success: true }
    } catch (error) {
        console.error("Erro em subscribeUser:", error)
        return { success: false, error: "Falha ao inscrever." }
    }
}

export async function unsubscribeUser(userId: string) {
    if (!userId) throw new Error('É necessário o UserID do usuário para remover a inscrição')
    try {
        const docRef = db.collection('inscricoes').doc(userId)
        await docRef.set({ subscription: null }, { merge: true })
        return { success: true }
    } catch (error) {
        console.error("Erro em unsubscribeUser:", error)
        return { success: false, error: "Falha ao desinscrever." }
    }
}

export async function updateReminderStatus(reminderId: string, completed: boolean) {
    if (!reminderId) return { success: false, error: 'ID do lembrete é obrigatório.' }
    try {
        const reminderRef = db.collection('reminders').doc(reminderId)
        await reminderRef.update({ completed: completed })
        return { success: true }
    } catch (error) {
        console.error('Erro ao atualizar status do lembrete:', error)
        return { success: false, error: 'Falha ao atualizar o lembrete.' }
    }
}

export async function deleteReminder(reminderId: string) {
    if (!reminderId) return { success: false, error: 'ID do lembrete é obrigatório.' }
    try {
        const reminderRef = db.collection('reminders').doc(reminderId)
        await reminderRef.delete()
        return { success: true }
    } catch (error) {
        console.error('Erro ao apagar lembrete:', error)
        return { success: false, error: 'Falha ao apagar o lembrete.' }
    }
}

export async function recordFreeUsage(userId: string) {
    if (!userId) return { success: false, error: 'UserID obrigatório' }
    try {
        const userDocRef = db.collection('users').doc(userId)
        await userDocRef.set({ lastFreeReminderAt: AdminTimestamp.now() }, { merge: true })
        return { success: true }
    } catch (error) {
        console.error('Erro ao registrar uso gratuito:', error)
        return { success: false, error: 'Falha ao registrar uso.' }
    }
}

export async function saveUserProfile(userId: string, profileData: { name: string, nickname: string, whatsappNumber: string, email: string, userId: string }) {
    if (!userId) return { success: false, error: 'UserID obrigatório' }
    try {
        const userDocRef = db.collection('users').doc(userId)
        await userDocRef.set(profileData, { merge: true })
        return { success: true }
    } catch (error) {
        console.error('Erro ao salvar perfil do usuário:', error)
        return { success: false, error: 'Falha ao salvar dados do perfil.' }
    }
}

export async function saveUserPreferences(userId: string, preferences: any) {
    if (!userId) return { success: false, error: 'UserID obrigatório' }
    try {
        const docRef = db.collection('preferences').doc(userId)
        await docRef.set(preferences, { merge: true })
        return { success: true }
    } catch (error) {
        console.error('Erro ao salvar preferências:', error)
        return { success: false, error: 'Falha ao salvar preferências.' }
    }
}

export async function saveUserPhoneNumber(userId: string, phoneNumber: string) {
    if (!userId) return { success: false, error: 'UserID obrigatório para salvar o número.' }
    if (!phoneNumber) return { success: false, error: 'Número de telefone obrigatório.' }
    try {
        const docRef = db.collection('users').doc(userId)
        await docRef.set({ whatsappNumber: phoneNumber }, { merge: true })
        return { success: true, message: 'Número salvo com sucesso!' }
    } catch (error) {
        console.error('Erro ao salvar o número de telefone:', error)
        return { success: false, error: 'Falha ao salvar o número.' }
    }
}

export async function saveReminder(title: string, date: Date, userId: string) {
    if (!userId || !title || !date) return { success: false, error: 'Dados do lembrete inválidos.' }
    try {
        const docRef = await db.collection('reminders').add({
            title,
            scheduledAt: AdminTimestamp.fromDate(date),
            userId,
            createdAt: AdminTimestamp.now(),
            sent: false,
            preNotificationSent: false,
        })
        return { success: true, reminderId: docRef.id }
    } catch (error) {
        console.error('Erro ao salvar lembrete:', error)
        return { success: false, error: 'Falha ao salvar lembrete.' }
    }
}


// --- FUNÇÕES DE AUTH (Já usavam Admin SDK, sem alterações) ---
export async function createUser(userData: { email: string, password: string, name: string, nickname: string, whatsappNumber: string }) {
    const { email, password, name, nickname, whatsappNumber } = userData
    try {
        const userRecord = await adminAuth.createUser({ email, password, displayName: name })
        const userId = userRecord.uid
        await saveUserProfile(userId, { name, nickname, whatsappNumber, email, userId })
        return { success: true, userId }
    } catch (error: any) {
        if (error.code === 'auth/email-already-exists') {
            return { success: false, error: 'Este e-mail já está em uso.' }
        }
        console.error('Erro ao criar novo usuário:', error)
        return { success: false, error: 'Falha ao criar a conta. Tente novamente.' }
    }
}

export async function resetUserPassword(email: string) {
    try {
        await adminAuth.generatePasswordResetLink(email)
        return { success: true }
    } catch (error) {
        console.error('Erro ao enviar link de redefinição:', error)
        return { success: false, error: 'Falha ao enviar link de redefinição de senha.' }
    }
}

// --- FUNÇÕES DE LEITURA (Usam o Cliente SDK para respeitar as regras de segurança) ---
export async function getReminders(userId: string) {
    if (!userId) return { success: false, error: 'UserID obrigatório.' }
    try {
        // --- CORREÇÃO AQUI: Convertido para o Admin SDK ---
        const remindersRef = db.collection('reminders')
        const q = remindersRef.where('userId', '==', userId).orderBy('scheduledAt', 'asc')
        const querySnapshot = await q.get() // O método .get() é do Admin SDK

        const reminders = querySnapshot.docs.map((doc) => {
            const data = doc.data()
            return {
                id: doc.id,
                ...data,
                // O Timestamp do Admin SDK também tem o método .toDate()
                scheduledAt: (data.scheduledAt as AdminTimestamp).toDate().toISOString(),
                createdAt: (data.createdAt as AdminTimestamp).toDate().toISOString(),
            }
        })
        return { success: true, reminders }
        // --- FIM DA CORREÇÃO ---
    } catch (error) {
        console.error('Erro ao buscar lembretes:', error)
        return { success: false, error: 'Falha ao buscar lembretes.' }
    }
}

export async function getUserPreferences(userId: string) {
    if (!userId) return { success: false, error: 'UserID obrigatório' }
    try {
        const docRef = db.collection('preferences').doc(userId)
        const docSnap = await docRef.get()
        return { success: true, preferences: docSnap.exists ? docSnap.data() : { enableTips: true } }
    } catch (error) {
        console.error('Erro ao buscar preferências:', error)
        return { success: false, error: 'Falha ao buscar preferências.' }
    }
}


// --- FUNÇÕES ESPECIAIS (Leitura com Admin SDK por necessidade) ---
export async function sendNotification(message: string, userId: string) {
    if (!userId) throw new Error('UserID é necessário')
    // Precisa ler do DB de Admin para obter a subscription, que pode conter dados sensíveis
    const docRef = db.collection('inscricoes').doc(userId)
    const docSnap = await docRef.get()

    if (!docSnap.exists || !docSnap.data()?.subscription) {
        throw new Error('Nenhuma inscrição encontrada para o usuário')
    }
    const subscription = docSnap.data()?.subscription

    try {
        await webpush.sendNotification(subscription, JSON.stringify({ title: 'Lembrete', body: message, icon: '/icon-192x192.png' }))
        return { success: true }
    } catch (error) {
        console.error('Erro ao enviar notificação push:', error)
        return { success: false, error: 'Erro ao enviar notificação push' }
    }
}