// melembra/src/components/providers/ClientLayout.tsx
import React from "react"
import { store } from "@/app/store/store"
import { Provider } from "react-redux"
import { AuthProvider } from "../ui/auth/AuthManager"
import SideNav from "../ui/layout/SideNav"
import { useSubscription } from "@/hooks/useSubscription"
import ThemeProvider from "./ThemeProvider"
import ThemeSwitcher from "../ui/theme/ThemeSwitcher"
import MenuIconCustom from "../ui/layout/MenuIconCustom"
import PageTransition from "./PageTransition"
import UpgradeButtonHeader from "../ui/planos/upgradeplanos/UpgradeButtonHeader"
import { Box, AppBar, Toolbar, IconButton, useTheme } from "@mui/material"
import { SnackbarProvider } from "@/contexts/SnackbarProvider"
import { useAppSelector } from "@/app/store/hooks"

const drawerWidth = 240
const miniWidth = 64

function MainLayout({ children }: { children: React.ReactNode }) {
    const [mobileOpen, setMobileOpen] = React.useState(false)
    const [desktopOpen, setDesktopOpen] = React.useState(true)
    const theme = useTheme()
    const { user } = useAppSelector((state) => state.auth)

    useSubscription(user?.uid as string)

    const handleMobileToggle = () => setMobileOpen((s) => !s)
    const handleDesktopToggle = () => setDesktopOpen((s) => !s)

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
                    boxShadow: 0,
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
                    <Box sx={{ flexGrow: 1, textAlign: 'center' }}>
                        <UpgradeButtonHeader />
                    </Box>
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
                    alignItems: "center",
                    flexDirection: 'column',
                    ml: { md: desktopOpen ? `${drawerWidth}px` : `${miniWidth}px` },
                    transition: theme.transitions.create('margin', {
                        easing: theme.transitions.easing.sharp,
                        duration: theme.transitions.duration.standard,
                    }),
                })}
            >
                <Toolbar sx={{ display: { xs: 'block', md: 'none' } }} />
                <Toolbar sx={{ display: { xs: 'none', md: 'block' } }} />
                <Toolbar
                    sx={{
                        display: { xs: 'none', md: 'flex' },
                        justifyContent: 'center',
                        position: 'absolute',
                        alignItems: 'center',
                        top: 5,
                    }}
                >
                    <UpgradeButtonHeader />
                </Toolbar>
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
                <SnackbarProvider>
                    <AuthProvider>
                        <MainLayout>{children}</MainLayout>
                    </AuthProvider>
                </SnackbarProvider>
            </ThemeProvider>
        </Provider>
    )
}