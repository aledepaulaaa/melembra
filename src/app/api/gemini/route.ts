//appbora/src/app/api/gemini/route.ts
import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string)
// Usamos o modelo flash por ser mais rápido para tarefas de extração simples, ou o pro se preferir precisão
const model = genAI.getGenerativeModel({ model: 'gemini-flash-lite-latest' })

export async function POST(request: Request) {
    try {
        const { text, currentDate } = await request.json()

        const prompt = `
            Você é uma API JSON para um app de lembretes.
            
            CONTEXTO TEMPORAL:
            A data e hora exata do usuário AGORA é: ${currentDate}
            (Use esta data como base para calcular 'hoje', 'amanhã', 'próxima sexta', 'daqui a 2 horas', etc).

            FRASE DO USUÁRIO: "${text}"

            TAREFAS:
            1. Identifique o título da ação.
            2. Identifique a Categoria (Ex: Saúde, Trabalho, Casa, Geral).
            3. CALCULE A DATA (YYYY-MM-DD) baseada no contexto temporal. Se ele disser "hoje", use a data do 'AGORA'. Se "amanhã", some 1 dia.
            4. CALCULE O HORÁRIO (HH:mm) formato 24h. Se ele disser "tarde" sem hora, sugira 14:00. "Manhã" -> 09:00. "Noite" -> 20:00.
            
            RETORNO JSON (Sem markdown):
            {
                "title": "Título da ação",
                "date": "YYYY-MM-DD" ou null,
                "time": "HH:mm" ou null,
                "category": "Categoria",
                "recurrence": "Não repetir"
            }
        `

        const result = await model.generateContent(prompt)
        const response = await result.response
        let jsonText = response.text().replace(/```json/g, '').replace(/```/g, '').trim()
        const data = JSON.parse(jsonText)

        return NextResponse.json({ data })
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 })
    }
}