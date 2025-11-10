//bora-app/src/hooks/useWhatsAppInput.ts
import { useState } from 'react'

// Função que formata um número limpo (ex: 5531983347898) para exibição
export const formatDisplayNumber = (value: string): string => {
    const clean = value.replace(/\D/g, '')
    if (clean.length <= 2) return `+${clean}`
    if (clean.length <= 4) return `+${clean.slice(0, 2)} (${clean.slice(2)}`
    if (clean.length <= 9) return `+${clean.slice(0, 2)} (${clean.slice(2, 4)}) ${clean.slice(4)}`
    return `+${clean.slice(0, 2)} (${clean.slice(2, 4)}) ${clean.slice(4, 9)}-${clean.slice(9, 13)}`
}

interface ValidationResult {
    success: boolean
    message?: string
    error: string
    inconclusive?: boolean
}

export function useWhatsAppInput(initialValue = '') {
    const [value, setValue] = useState(initialValue)
    const [isValidating, setIsValidating] = useState(false)

    const handleValidate = async (): Promise<ValidationResult> => {
        const cleanNumber = value.replace(/\D/g, '')

        // A validação de comprimento básica acontece aqui
        if (cleanNumber.length < 11) {
            return { success: false, error: 'Número inválido. Verifique o DDI, DDD e o número.' }
        }

        setIsValidating(true)
        try {
            const response = await fetch('/api/validar-whatsapp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phoneNumber: cleanNumber }),
            })
            // O resultado da API é retornado diretamente
            const result = await response.json()
            return result
        } catch (error) {
            // Em caso de falha de rede, retornamos um resultado "inconclusivo"
            return { success: true, inconclusive: true, error: 'Erro de conexão com o serviço de validação.' }
        } finally {
            setIsValidating(false)
        }
    }

    return { value, setValue, isValidating, handleValidate }
}