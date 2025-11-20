//bora-app/next.config.js
/** @type {import('next').NextConfig} */
const withPWA = require('@ducanh2912/next-pwa').default({
  dest: 'public', // Onde o service worker e outros arquivos serão gerados
  register: true, // Registra o service worker automaticamente
  skipWaiting: true, // ESSENCIAL: Força o novo service worker a ativar assim que for instalado
   // Diz ao service worker gerado para importar e executar nosso código customizado de push.
  importScripts: ['/sw-push-handler.js'],
  // disable: process.env.NODE_ENV === 'development', // Desativa a PWA em ambiente de desenvolvimento para não ter problemas com cache
})

const nextConfig = {
  env: {
    // Cria um timestamp único no momento do build (ex: 1715623456789)
    NEXT_PUBLIC_APP_VERSION: new Date().getTime().toString(),
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ]
  },
};

module.exports = withPWA(nextConfig);