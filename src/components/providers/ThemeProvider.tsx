'use client'
//bora-app/src/components/providers/ThemeProvider.tsx
import React from 'react'
import { createCustomTheme } from '@/theme/theme'
import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material'

export const ThemeContext = React.createContext({
    toggleColorMode: () => { },
    colorMode: { toggleColorMode: () => { } },
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

    const theme = React.useMemo(() => createCustomTheme(mode), [mode])

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