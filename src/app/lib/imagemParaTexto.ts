//appbora/src/app/lib/imagemParaTexto.ts
import { ImageAnnotatorClient } from '@google-cloud/vision'

// Mesma lógica de credenciais do audioParaTexto
const client = new ImageAnnotatorClient({
    credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    projectId: process.env.GOOGLE_PROJECT_ID,
})

export async function analyzeImage(imageBuffer: Buffer): Promise<string> {
    try {
        // Detecta texto (OCR) e Labels (o que é a imagem)
        const [result] = await client.annotateImage({
            image: { content: imageBuffer },
            features: [
                { type: 'TEXT_DETECTION' }, // Lê boletos, notas
                { type: 'LABEL_DETECTION' }  // Identifica objetos
            ]
        })

        const labels = result.labelAnnotations?.map(label => label.description).join(', ')
        const fullText = result.fullTextAnnotation?.text || ''

        // Retorna um resumo para o Gemini processar depois
        return `A imagem contém os seguintes objetos/temas: ${labels}. \nTexto detectado na imagem: ${fullText}`

    } catch (error) {
        console.error('Erro na Vision API:', error)
        throw new Error('Falha ao analisar imagem.')
    }
}