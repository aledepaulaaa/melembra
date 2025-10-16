'use client'
//melembra/src/app/layout.tsx
import React from 'react'
import ClientLayout from '@/components/providers/ClientLayout'

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="pt-br">
            <body>
                {/* 4. Envolvemos os 'children' com nosso novo componente cliente */}
                <ClientLayout>
                    {children}
                </ClientLayout>
            </body>
        </html>
    )
}
