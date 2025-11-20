// appbora/src/app/lib/audioParaTexto.ts
import { SpeechClient } from '@google-cloud/speech'

// Configuração explícita das credenciais usando variáveis de ambiente
// Isso corrige o erro "Could not load the default credentials" no localhost e na Vercel
const speechClient = new SpeechClient({
    credentials: {
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        // O replace é crucial: variáveis de ambiente às vezes tratam \n como texto literal string "\\n"
        private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    projectId: process.env.FIREBASE_PROJECT_ID,
})

/**
 * Transcreve um áudio de curta duração (máx. 60 segundos) usando o método síncrono.
 *
 * @param audioBuffer O conteúdo do áudio como um Node.js Buffer.
 * @param formatConfig A configuração do formato do áudio (ex: 'LINEAR16', 'MP3').
 * @param languageCode O código do idioma (ex: 'pt-BR').
 * @returns A transcrição do áudio como uma string única.
 */
export async function transcribeShortAudio(
    audioBuffer: Buffer,
    formatConfig: { encoding: 'LINEAR16' | 'MP3' | 'WEBM_OPUS' | string, sampleRateHertz: number },
    languageCode: string = 'pt-BR'
): Promise<string> {

    // 1. Prepare o payload do áudio
    const audio = {
        content: audioBuffer.toString('base64'),
    }

    // 2. Configure a requisição
    const config = {
        encoding: formatConfig.encoding,
        sampleRateHertz: formatConfig.sampleRateHertz,
        languageCode: languageCode,
    }

    const request: any = {
        audio: audio,
        config: config,
    }

    try {
        console.log('🎙️ Iniciando transcrição síncrona Google Cloud...')

        // 3. Chame o método recognize
        const [response] = await speechClient.recognize(request)

        // 4. Processe a resposta
        const transcription = response.results
            ?.map(result => result.alternatives?.[0].transcript)
            .filter((t): t is string => !!t)
            .join(' ') || ''

        if (!transcription) {
            console.warn('⚠️ Transcrição retornou vazia.')
            return ''
        }

        console.log(`✅ Transcrição concluída: "${transcription.substring(0, 80)}..."`)
        return transcription

    } catch (error) {
        console.error('❌ Erro ao transcrever áudio:', error)
        throw new Error(`Speech-to-Text API failed: ${JSON.stringify(error)}`)
    }
}