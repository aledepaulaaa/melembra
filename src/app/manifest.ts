//appbora/src/app/manifest.ts
import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    // Pega a versão gerada no build ou usa um fallback
    const appVersion = process.env.NEXT_PUBLIC_APP_VERSION || '1'

    // Função auxiliar para adicionar a versão
    // Resultado: /icon-192x192.png?v=1715623456789
    const iconUrl = (path: string) => `${path}?v=${appVersion}`

    return {
        name: 'Bora',
        short_name: 'Bora',
        description: 'Você não vai esquecer de mais nada!',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#ffffff',
        // Importante: isso ajuda o navegador a saber que o manifesto em si mudou
        id: `/?v=${appVersion}`,
        icons: [
            { src: iconUrl('/icon-48x48.png'), sizes: '48x48', type: 'image/png' },
            { src: iconUrl('/icon-72x72.png'), sizes: '72x72', type: 'image/png' },
            { src: iconUrl('/icon-96x96.png'), sizes: '96x96', type: 'image/png' },
            { src: iconUrl('/icon-128x128.png'), sizes: '128x128', type: 'image/png' },
            { src: iconUrl('/icon-144x144.png'), sizes: '144x144', type: 'image/png' },
            { src: iconUrl('/icon-152x152.png'), sizes: '152x152', type: 'image/png' },
            // Ícones principais
            { src: iconUrl('/icon-192x192.png'), sizes: '192x192', type: 'image/png' },
            { src: iconUrl('/icon-180x180.png'), sizes: '180x180', type: 'image/png' },
            { src: iconUrl('/icon-256x256.png'), sizes: '256x256', type: 'image/png' },
            { src: iconUrl('/icon-512x512.png'), sizes: '512x512', type: 'image/png' },
            {
                src: iconUrl('/icon-192x192.png'),
                sizes: '192x192',
                type: 'image/png',
                purpose: 'maskable' // Adicionei o purpose maskable aqui também se necessário
            },
            {
                src: iconUrl('/icon-512x512.png'),
                sizes: '512x512',
                type: 'image/png',
                purpose: 'maskable'
            },
        ],
    }
}