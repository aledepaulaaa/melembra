'use client'
//melembra/src/components/providers/ThemeProvider.tsx
import React from 'react'
import { ThemeProvider as MuiThemeProvider, createTheme, CssBaseline } from '@mui/material'
import { Gabarito } from 'next/font/google'

export const ThemeContext = React.createContext({
    toggleColorMode: () => { },
    colorMode: { toggleColorMode: () => { } },
})

export const gabarito = Gabarito({
    weight: ['400', '500', '700', '900'],
    subsets: ['latin'],
    display: 'swap',
})

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [mode, setMode] = React.useState<'light' | 'dark'>('dark')
    const [isMounted, setIsMounted] = React.useState(false)

    React.useEffect(() => {
        // Este efeito roda APENAS no cliente, após a primeira renderização.
        setIsMounted(true)

        // Agora podemos rodar a lógica que depende do cliente com segurança
        const currentHour = new Date().getHours()
        if (currentHour >= 6 && currentHour < 18) {
            setMode('light')
        } else {
            setMode('dark')
        }
    }, []) // O array vazio garante que ele rode só uma vez

    const colorMode = React.useMemo(
        () => ({
            toggleColorMode: () => {
                setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'))
            },
        }),
        [],
    )

    const theme = React.useMemo(
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

    if (!isMounted) {
        return null
    }

    return (
        <ThemeContext.Provider value={{ colorMode, toggleColorMode: colorMode.toggleColorMode }}>
            <MuiThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </MuiThemeProvider>
        </ThemeContext.Provider>
    )
}