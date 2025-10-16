// melembra/src/theme/theme.ts
import { createTheme, PaletteMode } from '@mui/material'
import { Gabarito } from 'next/font/google'

// 1. Definição da fonte movida para cá
export const gabarito = Gabarito({
    weight: ['400', '500', '700', '900'],
    subsets: ['latin'],
    display: 'swap',
})

// 2. Função que cria o tema com base no modo (light ou dark)
export const createCustomTheme = (mode: PaletteMode) => {
    return createTheme({
        palette: {
            mode,
            background: {
                default: mode === 'dark' ? '#121212' : '#FFFFFF',
                paper: mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
            },
            primary: {
                main: '#913ff5ff',
            },
            secondary: {
                main: '#BB86FC',
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
    })
}