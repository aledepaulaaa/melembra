'use client'
//bora-app/src/app/layout.tsx
import React from 'react'
import ClientLayout from '@/components/providers/ClientLayout'

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
