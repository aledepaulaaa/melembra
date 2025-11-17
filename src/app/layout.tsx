//bora-app/src/app/layout.tsx
import React from 'react'
import ClientLayout from '@/components/providers/ClientLayout'
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: {
        template: '%s | Bora',
        default: 'Aplicativo - Bora',
    },
    description: 'Nunca mais esqueça de nada.',
    openGraph: {
        title: 'Bora - Vou te lembrar de tudo!',
        description: 'Organize sua vida com lembretes inteligentes via WhatsApp.',
        url: 'https://www.aplicativobora.com.br',
        siteName: 'Bora',
        // URL da imagem para aparecer no compartilhamento
        images: [{ url: 'https://www.aplicativobora.com.br/bora_share.png' }],
        locale: 'pt_BR',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Bora - Seu Assistente Pessoal de Lembretes',
        description: 'Nunca mais esqueça de nada com lembretes inteligentes via WhatsApp.',
        images: ['https://www.aplicativobora.com.br/bora_share.png'],
        // creator: '@seu_usuario_no_twitter', // Opcional
    },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="pt-br">
            <body>
                <ClientLayout>
                    {children}
                </ClientLayout>
            </body>
        </html>
    )
}
