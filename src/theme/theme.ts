//bora-app/src/theme/theme.ts
import { createTheme, PaletteMode } from '@mui/material'
import { Montserrat } from 'next/font/google'
import { Livvic } from 'next/font/google'

// Fonte para títulos
export const livvic = Livvic({
    weight: ['400', '500', '700', '900'],
    subsets: ['latin'],
    display: 'swap',
})

// Fonte para Descrições
export const montserrat = Montserrat({
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
            h1: {
                fontFamily: livvic.style.fontFamily,
                color: mode === 'dark' ? '#FFFFFF' : '#913ff5ff',
            },
            h2: {
                fontFamily: livvic.style.fontFamily,
                color: mode === 'dark' ? '#FFFFFF' : '#913ff5ff',
            },
            h3: {
                fontFamily: livvic.style.fontFamily,
                color: mode === 'dark' ? '#FFFFFF' : '#913ff5ff',
            },
            h4: {
                fontFamily: livvic.style.fontFamily
            },
            h5: {
                fontFamily: livvic.style.fontFamily
            },
            h6: {
                fontFamily: montserrat.style.fontFamily
            },
            body1: {
                fontFamily: montserrat.style.fontFamily
            },
            body2: {
                fontFamily: montserrat.style.fontFamily
            },
            subtitle1:{
                fontFamily: montserrat.style.fontFamily
            },
            subtitle2:{
                fontFamily: montserrat.style.fontFamily
            },
            caption: {
                fontFamily: montserrat.style.fontFamily
            }
        },
        components: {
            MuiCssBaseline: {
                styleOverrides: {
                    body: {
                        background: mode === 'dark' ? '#000000' : '#FFFFFF',
                        color: mode === 'dark' ? '#FFFFFF' : '#000000',
                        fontFamily: montserrat.style.fontFamily
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