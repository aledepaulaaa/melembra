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
            Você é uma API (JSON) que estrutura lembretes.
            Referência Agora: ${currentDate}.
            Frase do usuário: "${text}".

            Instruções:
            1. Analise a frase e extraia os dados.
            2. Tente inferir a CATEGORIA baseada no contexto (Ex: 'Remédio' -> 'Saúde', 'Pagar luz' -> 'Financeiro', 'Estudar' -> 'Estudos', 'Limpar' -> 'Casa', 'Reunião' -> 'Trabalho'). Se não souber, use 'Geral'.
            3. DATA: Formato YYYY-MM-DD. Calcule baseado no 'Agora'. Se não mencionar, retorne null.
            4. HORA: Formato HH:mm. Se não mencionar, retorne null.
            
            Retorne APENAS este JSON:
            {
                "title": "O que lembrar (resumido)",
                "date": "YYYY-MM-DD" ou null,
                "time": "HH:mm" ou null,
                "description": "Detalhes extras ou null",
                "recurrence": "Não repetir" (ou Diariamente, Semanalmente, Mensalmente),
                "category": "Nome da Categoria Inferida"
            }
        `

        const result = await model.generateContent(prompt)
        const response = await result.response
        let jsonText = response.text()

        // Limpeza de markdown caso a IA mande ```json
        jsonText = jsonText.replace(/```json/g, '').replace(/```/g, '').trim()

        const data = JSON.parse(jsonText)
        return NextResponse.json({ data })

    } catch (error) {
        console.error('Error analyzing text with Gemini:', error)
        return NextResponse.json({ error: 'Failed to analyze content' }, { status: 500 })
    }
}