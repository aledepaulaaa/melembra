'use client'
//appbora/src/hooks/useWhatsAppInput.ts
import { useState } from 'react'

// A função de formatação para exibição continua a mesma e é muito útil.
export const formatDisplayNumber = (value: string): string => {
    const clean = value.replace(/\D/g, '')
    if (clean.length <= 2) return `+${clean}`
    if (clean.length <= 4) return `+${clean.slice(0, 2)} (${clean.slice(2)}`
    if (clean.length <= 9) return `+${clean.slice(0, 2)} (${clean.slice(2, 4)}) ${clean.slice(4)}`
    return `+${clean.slice(0, 2)} (${clean.slice(2, 4)}) ${clean.slice(4, 9)}-${clean.slice(9, 13)}`
}

// O hook agora é muito mais simples.
export function useWhatsAppInput(initialValue = '') {
    const [value, setValue] = useState(initialValue)

    // Para conveniência, retornamos o número já limpo.
    const cleanNumber = value.replace(/\D/g, '')

    // Removemos 'isValidating' e 'handleValidate'
    return { value, setValue, cleanNumber }
}