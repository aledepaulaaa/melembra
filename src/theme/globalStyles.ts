//melembra/src/theme/globalStyles.ts
export const globalStyles = `
        :root {
        --background: #ffffff;
        --foreground: #171717;
        }

        @media (prefers-color-scheme: dark) {
        :root {
            --background: #0a0a0a;
            --foreground: #ededed;
        }
        }

        html, body {
        max-width: 100vw;
        overflow-x: hidden;
        }

        body {
        color: var(--foreground);
        background: var(--background);
        font-family: Arial, Helvetica, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        }

        * {
        box-sizing: border-box;
        padding: 0;
        margin: 0;
        }

        a {
        color: inherit;
        text-decoration: none;
        }

        @media (prefers-color-scheme: dark) {
        html {
            color-scheme: dark;
        }
        }

        .animated-border {
        position: relative;
        overflow: hidden;
        border-radius: 20px;
        background: #121212;
        border: 1px solid rgba(255, 255, 255, 0.2);
        backdrop-filter: blur(16px);
        box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
        
        }

        .animated-border::before {
        content: '';
        position: absolute;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        background: conic-gradient(
            transparent,
            rgba(187, 134, 252, 0.7),
            rgba(3, 103, 218, 0.7),
            transparent
        );
        animation: flow 4s linear infinite;
        z-index: -1;
        }

        /* Animação para rotacionar o gradiente */
        @keyframes flow {
        from {
            transform: rotate(0deg);
        }
        to {
            transform: rotate(360deg);
        }
        }

        /* Criar a máscara para o efeito de borda */
        .animated-border::after {
        content: '';
        position: absolute;
        top: 1px;
        left: 1px;
        right: 1px;
        bottom: 1px;
        background: var(--background);
        border-radius: 19px;
        z-index: -1;

        .shimmer-text {
            background: linear-gradient(
                90deg,
                rgba(255, 255, 255, 0.4) 0%,
                rgba(255, 255, 255, 1) 50%,
                rgba(255, 255, 255, 0.4) 100%
            );
            background-size: 200% 100%;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            animation: shimmer 2s linear infinite;
        }

        @keyframes shimmer {
            0% {
                background-position: 200% 0;
            }
            100% {
                background-position: -200% 0;
            }
        }
    }
`