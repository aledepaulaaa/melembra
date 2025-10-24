// melembra/src/app/api/validar-whatsapp/route.ts
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const { phoneNumber } = await request.json()

        // 1. Limpa o número para enviar apenas dígitos para a API
        const cleanNumber = phoneNumber.replace(/\D/g, '')

        if (!cleanNumber) {
            return NextResponse.json({ success: false, error: 'Número de telefone inválido.' }, { status: 400 })
        }

        // 2. Monta a requisição para a RapidAPI
        const options = {
            method: 'POST',
            url: 'https://whatsapp-number-validator3.p.rapidapi.com/WhatsappNumberHasItWithToken',
            headers: {
                'x-rapidapi-key': process.env.RAPIDAPI_KEY!,
                'x-rapidapi-host': 'whatsapp-number-validator3.p.rapidapi.com',
                'Content-Type': 'application/json'
            },
            data: {
                phone_number: cleanNumber
            }
        }

        // 3. Faz a chamada usando fetch
        const response = await fetch(options.url, options)
        const data = await response.json()

        // 4. Interpreta e retorna a resposta da RapidAPI
        // Exemplo de resposta da API: { "exists": true }
        if (data.exists) {
            return NextResponse.json({ success: true, message: 'Seu número de WhatsApp é válido!' })
        } else {
            return NextResponse.json({ success: false, error: 'Este número não parece ter WhatsApp. Verifique por favor.' })
        }

    } catch (error) {
        console.error("Erro ao validar número no RapidAPI:", error)
        return NextResponse.json({ success: false, error: 'Não foi possível validar o número neste momento.' }, { status: 500 })
    }
}