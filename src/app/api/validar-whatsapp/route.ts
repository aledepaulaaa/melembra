// melembra/src/app/api/validar-whatsapp/route.ts
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const { phoneNumber } = await request.json()
        let cleanNumber = (phoneNumber || '').replace(/\D/g, '')

        if (!cleanNumber) {
            return NextResponse.json({ success: false, error: 'Número de telefone inválido.' }, { status: 400 })
        }

        if (cleanNumber.length >= 10 && cleanNumber.length <= 11) {
            cleanNumber = `55${cleanNumber}`
        }

        const url = 'https://whatsapp-number-validator3.p.rapidapi.com/WhatsappNumberHasItWithToken'
        const options = {
            method: 'POST',
            headers: {
                'x-rapidapi-key': process.env.RAPIDAPI_KEY!,
                'x-rapidapi-host': 'whatsapp-number-validator3.p.rapidapi.com',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                phone_number: cleanNumber
            })
        }

        const response = await fetch(url, options)
        const data = await response.json()

        // --- A CORREÇÃO PRINCIPAL ESTÁ AQUI ---

        // Primeiro, verificamos se a chamada HTTP em si falhou.
        if (response.status !== 200) {
            console.error("RapidAPI respondeu com status de erro:", response.status, data)
            return NextResponse.json({ success: true, message: 'Serviço de validação indisponível, mas o número foi salvo.', inconclusive: true })
        }

        // Agora, verificamos o CONTEÚDO da resposta.
        if (data.status === 'valid') {
            // Se o status for 'valid', é um sucesso!
            return NextResponse.json({ success: true, message: 'Seu número de WhatsApp é válido e foi confirmado!' })
        } else {
            // Se o status for qualquer outra coisa ('invalid', 'error', etc.), consideramos um erro.
            console.warn("RapidAPI retornou um status não válido:", data)
            return NextResponse.json({ success: false, error: 'Este número não parece ter um WhatsApp ativo. Verifique por favor.' })
        }
        // --- FIM DA CORREÇÃO ---

    } catch (error) {
        console.error("Erro de rede ao validar número no RapidAPI:", error)
        return NextResponse.json({
            success: true,
            message: 'Não foi possível validar o número agora. Salvo para verificação posterior.',
            inconclusive: true
        }, { status: 500 })
    }
}