//melembra/src/app/actions/actions.ts
'use server'
import webpush, { PushSubscription } from 'web-push'
import { db } from '../lib/firebase'
import { getFirebaseAuth } from '../lib/firebase-admin'
import { addDoc, collection, doc, setDoc, getDoc, getDocs, orderBy, query, where, Timestamp, updateDoc, deleteDoc } from 'firebase/firestore'

const adminAuth = getFirebaseAuth()

webpush.setVapidDetails(
    'mailto:contatoaledev@gmail.com',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
)

export async function subscribeUser(sub: PushSubscription, userId: string) {
    if (!userId) {
        throw new Error('É necessário o UserID do usuário para inscrição')
    }

    const docRef = doc(db, 'inscricoes', userId)
    await setDoc(docRef, {
        subscription: sub,
        userId: userId,
        createdAt: new Date(),
    })
    return { success: true }
}

export async function unsubscribeUser(userId: string) {
    if (!userId) {
        throw new Error('É necessário o UserID do usuário para remover a inscrição')
    }

    const docRef = doc(db, 'inscricoes', userId)
    await setDoc(docRef, { subscription: null, userId: userId }, { merge: true })
    return { success: true }
}

export async function sendNotification(message: string, userId: string) {
    const docRef = doc(db, 'inscricoes', userId)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists() || !docSnap.data()?.subscription) {
        throw new Error('Nenhuma inscrição encontrada para o usuário')
    }

    const subscription = docSnap.data()?.subscription

    try {
        await webpush.sendNotification(
            subscription,
            JSON.stringify({
                title: 'Lembrete',
                body: message,
                icon: '/icon-192x192.png',
            })
        )
        return { success: true }
    } catch (error) {
        console.error('Erro ao enviar notificação push:', error)
        return { success: false, error: 'Erro ao enviar notificação push' }
    }
}

export async function saveReminder(title: string, date: Date, userId: string) {
    if (!userId || !title || !date) {
        return { success: false, error: 'Dados do lembrete inválidos.' }
    }
    try {
        const docRef = await addDoc(collection(db, 'reminders'), {
            title,
            scheduledAt: Timestamp.fromDate(date),
            userId,
            createdAt: Timestamp.now(),
            sent: false,
        })
        return { success: true, reminderId: docRef.id }
    } catch (error) {
        console.error('Erro ao salvar lembrete:', error)
        return { success: false, error: 'Falha ao salvar lembrete.' }
    }
}

export async function getReminders(userId: string) {
    if (!userId) {
        return { success: false, error: 'UserID obrigatório para buscar lembretes' }
    }
    try {
        const q = query(
            collection(db, 'reminders'),
            where('userId', '==', userId),
            orderBy('scheduledAt', 'asc')
        )
        const querySnapshot = await getDocs(q)
        const reminders = querySnapshot.docs.map((doc) => {
            const data = doc.data()
            // Corrigindo o erro de Timestamp
            return {
                id: doc.id,
                ...data,
                scheduledAt: data.scheduledAt.toDate().toISOString(),
                createdAt: data.createdAt.toDate().toISOString(),
            }
        })
        return { success: true, reminders }
    } catch (error) {
        console.error('Erro ao buscar lembretes:', error)
        return {
            success: false,
            error: 'Falha ao buscar lembretes. Tente novamente.',
        }
    }
}

export async function createUser(userData: { email: string, password: string, name: string, nickname: string, whatsappNumber: string }) {
    const { email, password, name, nickname, whatsappNumber } = userData

    try {
        // 1. Tenta criar o usuário no Firebase Authentication
        const userRecord = await adminAuth.createUser({
            email,
            password,
            displayName: name, // Bônus: já define o nome de exibição
        })

        const userId = userRecord.uid

        // 2. Salva os dados adicionais no Firestore
        await saveUserProfile(userId, { name, nickname, whatsappNumber, email, userId })

        return { success: true, userId }
    } catch (error: any) {
        // Lida com erros comuns, como e-mail já existente
        if (error.code === 'auth/email-already-exists') {
            return { success: false, error: 'Este e-mail já está em uso.' }
        }
        console.error('Erro ao criar novo usuário:', error)
        return { success: false, error: 'Falha ao criar a conta. Tente novamente.' }
    }
}

export async function linkEmailToAnonymousUser(userId: string, email: string, password: string) {
    try {
        // VERIFICAÇÃO: Checa se o e-mail já está em uso por outra conta
        await adminAuth.getUserByEmail(email)
        // Se a linha acima NÃO deu erro, o e-mail já existe.
        return { success: false, error: 'Este e-mail já está em uso por outra conta.' }
    } catch (error: any) {
        // Se o erro for 'user-not-found', ÓTIMO! Significa que o e-mail está livre.
        if (error.code !== 'auth/user-not-found') {
            return { success: false, error: 'Ocorreu um erro ao verificar o e-mail.' }
        }
    }

    try {
        // Se o e-mail está livre, prossegue com a atualização
        await adminAuth.updateUser(userId, {
            email,
            password,
        })
        return { success: true }
    } catch (error) {
        return { success: false, error: 'Falha ao associar e-mail. Tente novamente.' }
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

export async function getUserPreferences(userId: string) {
    if (!userId) {
        return { success: false, error: 'UserID obrigatório' }
    }
    try {
        const docRef = doc(db, 'preferences', userId)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
            return { success: true, preferences: docSnap.data() }
        } else {
            return { success: true, preferences: { enableTips: true } }
        }
    } catch (error) {
        console.error('Erro ao buscar preferências:', error)
        return { success: false, error: 'Falha ao buscar preferências.' }
    }
}

export async function saveUserPreferences(userId: string, preferences: any) {
    if (!userId) {
        return { success: false, error: 'UserID obrigatório' }
    }
    try {
        const docRef = doc(db, 'preferences', userId)
        await setDoc(docRef, preferences, { merge: true })
        return { success: true }
    } catch (error) {
        console.error('Erro ao salvar preferências:', error)
        return { success: false, error: 'Falha ao salvar preferências.' }
    }
}

export async function saveUserPhoneNumber(userId: string, phoneNumber: string) {
    if (!userId) {
        return { success: false, error: 'UserID obrigatório para salvar o número.' }
    }
    if (!phoneNumber) {
        return { success: false, error: 'Número de telefone obrigatório.' }
    }

    try {
        const docRef = doc(db, 'users', userId)
        await setDoc(docRef, { whatsappNumber: phoneNumber }, { merge: true })
        return { success: true, message: 'Número salvo com sucesso!' }
    } catch (error) {
        console.error('Erro ao salvar o número de telefone:', error)
        return { success: false, error: 'Falha ao salvar o número.' }
    }
}

export async function updateReminderStatus(reminderId: string, completed: boolean) {
    if (!reminderId) {
        return { success: false, error: 'ID do lembrete é obrigatório.' }
    }
    try {
        const reminderRef = doc(db, 'reminders', reminderId)
        await updateDoc(reminderRef, {
            completed: completed
        })
        return { success: true }
    } catch (error) {
        console.error('Erro ao atualizar status do lembrete:', error)
        return { success: false, error: 'Falha ao atualizar o lembrete.' }
    }
}

export async function deleteReminder(reminderId: string) {
    if (!reminderId) {
        return { success: false, error: 'ID do lembrete é obrigatório.' }
    }
    try {
        const reminderRef = doc(db, 'reminders', reminderId)
        await deleteDoc(reminderRef)
        return { success: true }
    } catch (error) {
        console.error('Erro ao apagar lembrete:', error)
        return { success: false, error: 'Falha ao apagar o lembrete.' }
    }
}

export async function recordFreeUsage(userId: string) {
    if (!userId) {
        return { success: false, error: 'UserID obrigatório' }
    }
    try {
        const userDocRef = doc(db, 'users', userId)
        await setDoc(userDocRef, {
            lastFreeReminderAt: Timestamp.now()
        }, { merge: true })
        return { success: true }
    } catch (error) {
        console.error('Erro ao registrar uso gratuito:', error)
        return { success: false, error: 'Falha ao registrar uso.' }
    }
}

export async function saveUserProfile(userId: string, profileData: { name: string, nickname: string, whatsappNumber: string, email: string, userId: string }) {
    if (!userId) {
        return { success: false, error: 'UserID obrigatório' }
    }
    try {
        const userDocRef = doc(db, 'users', userId)
        // Salva todos os dados, incluindo o próprio userId e o email
        await setDoc(userDocRef, profileData, { merge: true })
        return { success: true }
    } catch (error) {
        console.error('Erro ao salvar perfil do usuário:', error)
        return { success: false, error: 'Falha ao salvar dados do perfil.' }
    }
}