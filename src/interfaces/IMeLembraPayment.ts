// melembra/src/interfaces/IMeLembraPayments.ts
import { Timestamp } from "firebase-admin/firestore"

/**
 * Representa o status da assinatura de um usuário
 * - active: Assinatura paga e ativa
 * - trialing: Período de teste (se aplicável)
 * - past_due: Falha no pagamento, aguardando ação do usuário
 * - canceled: Cancelada pelo usuário, válida até o fim do período pago
 * - incomplete: Pagamento inicial não foi concluído
 * - unpaid: Pagamento falhou e a assinatura foi movida para este estado
 */
export type SubscriptionStatus =
    | 'active'
    | 'trialing'
    | 'past_due'
    | 'canceled'
    | 'incomplete'
    | 'unpaid'

/**
 * Estrutura do documento de assinatura que será salvo no Firestore
 * em /subscriptions/{userId}
 */
export interface ISubscription {
    userId: string
    stripeCustomerId: string
    stripeSubscriptionId: string
    stripePriceId: string
    status: SubscriptionStatus
    // Timestamps do Firestore para gerenciar o período da assinatura
    currentPeriodStart: Timestamp
    currentPeriodEnd: Timestamp
    createdAt: Timestamp
    canceledAt?: Timestamp
    endedAt?: Timestamp
}

// Define o formato do nosso estado de assinatura
export interface SubscriptionState {
    plan: 'free' | 'plus' | 'canceled' // Planos simples para a UI
    status: 'loading' | 'active' | 'inactive' | 'error'
    data: ISubscription | null // Opcional: Armazenar todos os dados se precisar
}

/**
 * Payload esperado pela nossa API para criar uma sessão de checkout
 */
export interface ICreateCheckoutPayload {
    userId: string
    priceId: string
}