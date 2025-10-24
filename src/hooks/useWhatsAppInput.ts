// melembra/src/hooks/useWhatsAppInput.ts
import { useState } from 'react'
import { useSnackbar } from '@/contexts/SnackbarProvider'

// Função que formata um número limpo (ex: 5531983347898) para exibição
export const formatDisplayNumber = (value: string): string => {
    const clean = value.replace(/\D/g, '')
    if (clean.length <= 2) return `+${clean}`
    if (clean.length <= 4) return `+${clean.slice(0, 2)} (${clean.slice(2)}`
    if (clean.length <= 9) return `+${clean.slice(0, 2)} (${clean.slice(2, 4)}) ${clean.slice(4)}`
    return `+${clean.slice(0, 2)} (${clean.slice(2, 4)}) ${clean.slice(4, 9)}-${clean.slice(9, 13)}`
}

export function useWhatsAppInput(initialValue = '') {
    const { openSnackbar } = useSnackbar()
    const [value, setValue] = useState(initialValue)
    const [isValidating, setIsValidating] = useState(false)

    const handleValidate = async (): Promise<boolean> => {
        const cleanNumber = value.replace(/\D/g, '')
        if (cleanNumber.length < 11) { // Mínimo de DDI + DDD + 8 dígitos
            openSnackbar('Número inválido. Verifique o DDD e o número.', 'error')
            return false
        }

        setIsValidating(true)
        try {
            const response = await fetch('/api/validar-whatsapp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phoneNumber: cleanNumber }),
            })
            const result = await response.json()

            if (result.success) {
                openSnackbar(result.message, 'success')
                return true
            } else {
                openSnackbar(result.error, 'error')
                return false
            }
        } catch (error) {
            openSnackbar('Erro ao conectar com o serviço de validação.', 'error')
            return false
        } finally {
            setIsValidating(false)
        }
    }

    return { value, setValue, isValidating, handleValidate }
}