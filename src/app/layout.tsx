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
