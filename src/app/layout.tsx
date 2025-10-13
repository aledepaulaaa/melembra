'use client'
// src/app/layout.tsx
import React from 'react'
import { AuthProvider } from '@/components/AuthManager'
import { Provider } from 'react-redux'
import { store } from '@/app/store/store'
import ThemeProvider from '@/components/providers/ThemeProvider'
import SideNav from '@/components/ui/SideNav'
import PageTransition from '@/components/providers/PageTransition'
import { Box, Toolbar, AppBar, IconButton, Typography } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import ThemeSwitcher from '@/components/ui/ThemeSwitcher'

const drawerWidth = 240

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const [mobileOpen, setMobileOpen] = React.useState(false)

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen)
    }

    return (
        <html lang="pt-br">
            <body>
                <Provider store={store}>
                    <ThemeProvider>
                        <AuthProvider>
                            <Box sx={{ display: 'flex', overflowX: 'hidden' }}>
                                <AppBar
                                    position="fixed"
                                    elevation={0}
                                    sx={{
                                        backgroundColor: "transparent",
                                        backdropFilter: 'blur(8px)',
                                        width: { md: `calc(100% - ${drawerWidth}px)` },
                                        ml: { md: `${drawerWidth}px` },
                                        
                                        display: { md: 'none' } 
                                    }}
                                >
                                    <Toolbar>
                                        <IconButton
                                            color="inherit"
                                            aria-label="open drawer"
                                            edge="start"
                                            onClick={handleDrawerToggle}
                                            sx={{ mr: 2 }}
                                        >
                                            <MenuIcon />
                                        </IconButton>
                                        {/* NOVO: Box com flexGrow para empurrar o switcher para a direita */}
                                        <Box sx={{ flexGrow: 1 }}>
                                            {/* Substitua pela sua logo para a versão móvel */}
                                            <Typography variant="h6" noWrap component="div">
                                                LOGO
                                            </Typography>
                                        </Box>
                                        {/* NOVO: ThemeSwitcher dentro da AppBar */}
                                        <ThemeSwitcher />
                                    </Toolbar>
                                </AppBar>
                                <SideNav mobileOpen={mobileOpen} handleDrawerToggle={handleDrawerToggle} />
                                <Box
                                    component="main"
                                    sx={{
                                        flexGrow: 1,
                                        p: 3,
                                        width: { md: `calc(100% - ${drawerWidth}px)` },
                                        minHeight: '100vh',
                                        display: 'flex',
                                        flexDirection: 'column',
                                    }}
                                >
                                    <Toolbar sx={{ display: { md: 'none' } }} />
                                    <PageTransition>
                                        {children}
                                    </PageTransition>
                                </Box>
                            </Box>
                        </AuthProvider>
                    </ThemeProvider>
                </Provider>
            </body>
        </html>
    )
}