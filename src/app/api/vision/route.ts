//appbora/src/app/api/vision/route.ts
import { NextResponse } from 'next/server'
import { analyzeImage } from '@/app/lib/imagemParaTexto'

export async function POST(request: Request) {
    try {
        const formData = await request.formData()
        const file = formData.get('file') as Blob | null

        if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

        const buffer = Buffer.from(await file.arrayBuffer())
        const description = await analyzeImage(buffer)

        return NextResponse.json({ text: description })
    } catch (error) {
        return NextResponse.json({ error: 'Vision Failed' }, { status: 500 })
    }
}