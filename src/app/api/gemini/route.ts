//appbora/src/app/api/gemini/route.ts
import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string)
// Usamos o modelo flash por ser mais rápido para tarefas de extração simples, ou o pro se preferir precisão
const model = genAI.getGenerativeModel({ model: 'gemini-flash-lite-latest' })

export async function POST(request: Request) {
    try {
        const { text, currentDate } = await request.json()

        if (!text) {
            return NextResponse.json({ error: 'Text is required' }, { status: 400 })
        }

         const prompt = `
            Você é uma API que converte linguagem natural em JSON para um app de lembretes.
            Hoje é: ${currentDate} (Data e Hora do usuário).

            Instrução: Analise a frase: "${text}".
            
            Regras de Data:
            1. Se o usuário disser "amanhã", calcule a data baseada no "Hoje é" acima.
            2. O campo 'date' DEVE ser estritamente no formato "YYYY-MM-DD" (Ex: 2025-11-20).
            3. Se não houver data, retorne null.
            
            Regras de Hora:
            1. O campo 'time' deve ser "HH:mm" (24h). Ex: "08:00", "14:30".
            2. Se não houver hora, retorne null.

            Retorne APENAS este JSON sem formatação markdown:
            {
                "title": "Resumo curto da ação",
                "date": "YYYY-MM-DD" ou null,
                "time": "HH:mm" ou null,
                "description": "Detalhes adicionais se houver",
                "recurrence": "Não repetir" (ou Diariamente, Semanalmente, Mensalmente)
            }
        `

        const result = await model.generateContent(prompt)
        const response = await result.response
        let jsonText = response.text()

        // Limpeza básica caso o modelo retorne ```json ... ```
        jsonText = jsonText.replace(/```json/g, '').replace(/```/g, '').trim()

        const data = JSON.parse(jsonText)

        return NextResponse.json({ data })
    } catch (error) {
        console.error('Error analyzing text with Gemini:', error)
        return NextResponse.json({ error: 'Failed to analyze content' }, { status: 500 })
    }
}