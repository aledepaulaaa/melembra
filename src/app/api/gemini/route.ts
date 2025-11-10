//bora-app/src/app/api/gemini/route.ts
import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string)
const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

export async function POST(request: Request) {
    try {
        const { prompt } = await request.json()

        if (!prompt) {
            return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
        }

        const result = await model.generateContent(`
            Crie uma lista de sugestões de itens ou próximos passos de forma curta e direta, baseada na seguinte frase. 
            Responda apenas com a lista em formato de texto separado por vírgulas. Não inclua numeração ou frases adicionais. Frase: "${prompt}"`
        )
        const response = await result.response
        const text = response.text()
        const suggestions = text.split(',').map(s => s.trim())

        return NextResponse.json({ suggestions })
    } catch (error) {
        console.error('Error with Gemini API:', error)
        return NextResponse.json({ error: 'Failed to generate content' }, { status: 500 })
    }
}