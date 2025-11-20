//appbora/src/app/api/transcricao/route.ts
import { NextResponse } from 'next/server'
import { transcribeShortAudio } from '@/app/lib/audioParaTexto'

export async function POST(request: Request) {
    try {
        const formData = await request.formData()
        const file = formData.get('file') as Blob | null

        if (!file) {
            return NextResponse.json({ error: 'No audio file provided' }, { status: 400 })
        }

        // Converte Blob para Buffer
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        // Define a configuração baseada no tipo do arquivo enviado pelo navegador
        // Geralmente navegadores gravam em WebM/Opus ou OGG
        // O Google Speech-to-Text aceita 'WEBM_OPUS' nativamente
        const formatConfig = {
            encoding: 'WEBM_OPUS',
            sampleRateHertz: 48000, // Padrão comum, mas o Google pode detectar auto em alguns casos
        }

        const transcription = await transcribeShortAudio(buffer, formatConfig)

        return NextResponse.json({ text: transcription })

    } catch (error) {
        console.error('Erro ao processar áudio:', error)
        return NextResponse.json({ error: 'Falha ao transcrever áudio' }, { status: 500 })
    }
}