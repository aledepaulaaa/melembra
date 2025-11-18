//bora-app/src/app/manifest.ts
import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Bora',
        short_name: 'Bora',
        description: 'Você não vai esquecer de mais nada!',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#ffffff',
        icons: [
            // Tamanhos básicos e essenciais
            { src: '/icon-48x48.png', sizes: '48x48', type: 'image/png' },
            { src: '/icon-72x72.png', sizes: '72x72', type: 'image/png' },
            { src: '/icon-96x96.png', sizes: '96x96', type: 'image/png' },
            { src: '/icon-128x128.png', sizes: '128x128', type: 'image/png' },
            // Tamanho importante para Windows Tiles (IE/Edge legados)
            { src: '/icon-144x144.png', sizes: '144x144', type: 'image/png' },
            { src: '/icon-152x152.png', sizes: '152x152', type: 'image/png' },
            // ESSENCIAL para Android (ícone padrão)
            { src: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
            { src: '/icon-384x384.png', sizes: '384x384', type: 'image/png' },
            // ESSENCIAL para a tela de splash e ícones de alta resolução
            { src: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
            {
                src: '/icon-192x192.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/icon-512x512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'maskable'
            },
        ],
    }
}