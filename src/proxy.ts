//appbora/src/proxy.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// O nome do cookie pode variar, mas geralmente o Firebase Auth
// cria cookies que indicam a sessão do usuário. Usamos a presença
// dele como um sinal de que o usuário está provavelmente logado.
const AUTH_COOKIE_NAME = 'firebase-auth-token' // Nome genérico

// A função agora é exportada como 'proxy'
export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl
    const authToken = request.cookies.get(AUTH_COOKIE_NAME)

    const isUserAuthenticated = !!authToken

    // Rotas públicas que um usuário deslogado PODE acessar
    const publicPaths = ['/login', '/criarconta']

    // Se o usuário está LOGADO e tenta acessar as páginas de login/cadastro,
    // redirecionamos para a home.
    if (isUserAuthenticated && publicPaths.includes(pathname)) {
        return NextResponse.redirect(new URL('/', request.url))
    }

    // Rotas protegidas que um usuário DESLOGADO NÃO PODE acessar
    const protectedPaths = [
        '/meusdados',
        '/lembretes',
        '/preferencias',
        '/notificacoes',
        '/privacidade',
    ]

    // Se não está logado e tenta acessar uma rota protegida,
    // redirecionamos para a página de login.
    if (!isUserAuthenticated && protectedPaths.some(path => pathname.startsWith(path))) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // Se nenhuma regra de redirecionamento for acionada, permite que a requisição continue.
    return NextResponse.next()
}

// A configuração do 'matcher' continua a mesma, definindo quais rotas
// serão interceptadas pelo proxy.
export const config = {
    matcher: [
        /*
         * Corresponde a todos os caminhos de solicitação, exceto aqueles que começam com:
         * - api (rotas de API)
         * - _next/static (arquivos estáticos)
         * - _next/image (arquivos de otimização de imagem)
         * - favicon.ico (arquivo de favicon)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
}