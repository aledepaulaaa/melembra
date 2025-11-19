'use client'
//appbora/src/components/ui/layout/UnauthenticatedHeader.tsx
import NextLink from 'next/link'
import { AppBar, Toolbar, Box, Button, useTheme } from '@mui/material'
import LogoAnimated from '../logo/LogoAnimated'
import ThemeSwitcher from '../theme/ThemeSwitcher'

export default function UnauthenticatedHeader() {
    const theme = useTheme()
    return (
        <AppBar
            position="fixed"
            elevation={0}
            sx={{
                backgroundColor: 'transparent',
                backdropFilter: 'blur(10px)',
                borderBottom: `1px solid ${theme.palette.divider}`
            }}
        >
            <Toolbar>
                <LogoAnimated size={40} />
                <Box sx={{ flexGrow: 1 }} />
                <ThemeSwitcher />
                <Box sx={{ display: 'flex', gap: 1, ml: 1, mr: 4, p: 1 }}>
                    <Button
                        component={NextLink}
                        href="/login"
                        variant="contained"
                        sx={{ fontSize: 14, borderRadius: 4, fontWeight: 'bold' }}
                    >
                        Entrar
                    </Button>
                    <Button
                        component={NextLink}
                        href="/criarconta"
                        variant="outlined"
                        sx={{ fontSize: 14, borderRadius: 4, fontWeight: 'bold' }}
                    >
                        Criar conta grátis
                    </Button>
                </Box>
            </Toolbar>
        </AppBar>
    )
}