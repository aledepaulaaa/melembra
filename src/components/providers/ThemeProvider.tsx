'use client'
//melembra/src/components/providers/ThemeProvider.tsx
import React, { useState, useMemo, createContext } from 'react'
import {
    ThemeProvider as MuiThemeProvider,
    createTheme,
    CssBaseline,
} from '@mui/material'
import { Gabarito } from 'next/font/google'

export const ThemeContext = createContext({
    toggleColorMode: () => { },
    globalStyles: '',
    colorMode: { toggleColorMode: () => { } },
})

export const gabarito = Gabarito({
    weight: ['400', '500', '700', '900'],
    subsets: ['latin'],
    display: 'swap',
})

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [mode, setMode] = useState<'light' | 'dark'>('dark')

    const colorMode = useMemo(
        () => ({
            toggleColorMode: () => {
                setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'))
            },
        }),
        [],
    )

    const globalStyles = `
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
    }
`

    const theme = useMemo(
        () =>
            createTheme({
                palette: {
                    mode,
                    background: {
                        default: mode === 'dark' ? '#121212' : '#FFFFFF',
                        paper: mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                    },
                    primary: {
                        main: '#BB86FC',
                    },
                    secondary: {
                        main: '#03DAC6',
                    },
                },
                typography: {
                    fontFamily: gabarito.style.fontFamily,
                },
                components: {
                    MuiCssBaseline: {
                        styleOverrides: {
                            body: {
                                background: mode === 'dark' ? '#000000' : '#FFFFFF',
                                color: mode === 'dark' ? '#FFFFFF' : '#000000',
                                fontFamily: gabarito.style.fontFamily,
                            },
                        },
                    },
                    MuiButton: {
                        styleOverrides: {
                            root: {
                                borderRadius: 8,
                            },
                        },
                    },
                    MuiPaper: {
                        styleOverrides: {
                            root: {
                                background: 'rgba(255, 255, 255, 0.1)',
                                backdropFilter: 'blur(16px)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
                            },
                        },
                    },
                },
            }),
        [mode],
    )

    return (
        <ThemeContext.Provider value={{ colorMode, globalStyles, toggleColorMode: colorMode.toggleColorMode }}>
            <MuiThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </MuiThemeProvider>
        </ThemeContext.Provider>
    )
}