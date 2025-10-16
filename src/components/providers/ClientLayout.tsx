// melembra/src/components/providers/ClientLayout.tsx
import React from "react"
import { store } from "@/app/store/store"
import { Provider } from "react-redux"
import { AuthProvider } from "../AuthManager"
import SideNav from "../ui/SideNav"
import ThemeProvider from "./ThemeProvider"
import ThemeSwitcher from "../ui/ThemeSwitcher"
import MenuIconCustom from "../ui/MenuIconCustom"
import PageTransition from "./PageTransition"
import { Box, AppBar, Toolbar, IconButton, useTheme } from "@mui/material"

const drawerWidth = 240
const miniWidth = 64

// --- INÍCIO DA CORREÇÃO ---

// 1. Criamos um componente interno que contém TODA a lógica de UI.
//    Agora o `useTheme()` é chamado DENTRO do ThemeProvider e funcionará.
function MainLayout({ children }: { children: React.ReactNode }) {
    const [mobileOpen, setMobileOpen] = React.useState(false)
    const [desktopOpen, setDesktopOpen] = React.useState(true)
    const theme = useTheme() // Este hook agora lê o tema correto!

    const handleMobileToggle = () => setMobileOpen((s) => !s)
    const handleDesktopToggle = () => setDesktopOpen((s) => !s)

    // Esta linha agora vai funcionar como esperado
    const iconColor = theme.palette.mode === 'dark' 
        ? theme.palette.primary.main 
        : theme.palette.secondary.main

    return (
        <Box sx={{ display: 'flex', overflowX: 'hidden' }}>
            {/* AppBar mobile (hamburger) */}
            <AppBar
                position="fixed"
                elevation={0}
                sx={{
                    backgroundColor: "transparent",
                    display: { xs: 'flex', md: 'none' },
                    width: '100%',
                    boxShadow: 0
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleMobileToggle}
                    >
                        <MenuIconCustom color={iconColor} />
                    </IconButton>
                    <ThemeSwitcher />
                </Toolbar>
            </AppBar>
            <SideNav
                mobileOpen={mobileOpen}
                handleDrawerToggle={handleMobileToggle}
                desktopOpen={desktopOpen}
                handleDesktopToggle={handleDesktopToggle}
                drawerWidth={drawerWidth}
                miniWidth={miniWidth}
            />
            {/* Floating desktop hamburger (ancorado) */}
            <IconButton
                aria-label="toggle drawer"
                onClick={handleDesktopToggle}
                sx={(theme) => ({
                    display: { xs: 'none', md: 'flex' },
                    position: 'fixed',
                    top: theme.spacing(2),
                    left: { md: desktopOpen ? `${drawerWidth + 16}px` : `${miniWidth + 16}px` },
                    zIndex: theme.zIndex.appBar + 1,
                    borderRadius: '50%',
                    width: 44,
                    height: 44,
                    backgroundColor: theme.palette.background.paper,
                    '&:hover': {
                        backgroundColor: theme.palette.action.hover,
                    },
                    transition: theme.transitions.create(['left', 'transform', 'background-color'], {
                        easing: theme.transitions.easing.sharp,
                        duration: theme.transitions.duration.short,
                    }),
                })}
            >
                <MenuIconCustom color={iconColor} />
            </IconButton>
            {/* MAIN: shift (ml) depende se o drawer desktop está aberto */}
            <Box
                component="main"
                sx={(theme) => ({
                    flexGrow: 1,
                    p: 3,
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    width: '100%',
                    ml: { md: desktopOpen ? `${drawerWidth}px` : `${miniWidth}px` },
                    transition: theme.transitions.create('margin', {
                        easing: theme.transitions.easing.sharp,
                        duration: theme.transitions.duration.standard,
                    }),
                })}
            >
                <Toolbar sx={{ display: { xs: 'block', md: 'none' } }} />
                <Toolbar sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: 'flex-start', px: 0 }} />
                <PageTransition>
                    {children}
                </PageTransition>
            </Box>
        </Box>
    )
}

// 2. O componente `ClientLayout` agora só é responsável por criar os Providers.
export default function ClientLayout({ children }: { children: React.ReactNode }) {
    return (
        <Provider store={store}>
            <ThemeProvider>
                <AuthProvider>
                    {/* 3. Renderizamos a UI (MainLayout) DENTRO dos providers */}
                    <MainLayout>{children}</MainLayout>
                </AuthProvider>
            </ThemeProvider>
        </Provider>
    )
}
// --- FIM DA CORREÇÃO ---