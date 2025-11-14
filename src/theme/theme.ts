//bora-app/src/theme/theme.ts
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
                paper: mode === 'dark' ? '#121212' : '#FFFFFF',
            },
            text: {
                primary: mode === 'dark' ? '#FFFFFF' : '#000000',
                secondary: mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
            },
            divider: mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
            primary: {
                main: '#913FF5',
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
                defaultProps: {
                    sx: {
                        p: 2,
                        borderRadius: 4,
                        fontWeight: 'bold',
                        textTransform: 'none',
                        fontSize: 16
                    }
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
            MuiDrawer: {
                styleOverrides: {
                    paper: {
                        backgroundColor: mode === 'dark' ? '#121212' : '#FFFFFF',
                        backgroundImage: 'none',
                    }
                }
            },
        },
    })
}