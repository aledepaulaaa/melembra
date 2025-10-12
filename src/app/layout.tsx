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
                            <Box sx={{ display: 'flex' }}>
                                <AppBar
                                    position="fixed"
                                    sx={{
                                        backgroundColor: "transparent",
                                        width: { md: `calc(100% - ${drawerWidth}px)` },
                                        ml: { md: `${drawerWidth}px` },
                                        display: { md: 'none' } // A AppBar só aparecerá em telas menores
                                    }}
                                >
                                    <Toolbar>
                                        <IconButton
                                            color="inherit"
                                            aria-label="open drawer"
                                            edge="start"
                                            onClick={handleDrawerToggle}
                                            sx={{ 
                                                mr: 2, 
                                                display: { md: 'none' },
                                            }}
                                        >
                                            <MenuIcon />
                                        </IconButton>
                                        <Typography variant="h6" noWrap component="div">
                                            MeLembra
                                        </Typography>
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
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    {/* Toolbar fantasma para empurrar o conteúdo para baixo da AppBar em telas móveis */}
                                    <Toolbar sx={{ display: { md: 'none' }}} />
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