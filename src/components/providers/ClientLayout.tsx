import React from "react"
import { store } from "@/app/store/store"
import MenuIcon from '@mui/icons-material/Menu'
import { Provider } from "react-redux"
import { AuthProvider } from "../AuthManager"
import SideNav from "../ui/SideNav"
import ThemeProvider from "./ThemeProvider"
import ThemeSwitcher from "../ui/ThemeSwitcher"
import PageTransition from "./PageTransition"
import { Box, AppBar, Toolbar, IconButton, Typography } from "@mui/material"
import LogoMeLembra from "../ui/LogoMeLembra"

const drawerWidth = 240
const miniWidth = 64

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const [mobileOpen, setMobileOpen] = React.useState(false)
    const [desktopOpen, setDesktopOpen] = React.useState(true)

    const handleMobileToggle = () => setMobileOpen((s) => !s)
    const handleDesktopToggle = () => setDesktopOpen((s) => !s)

    return (
        <Provider store={store}>
            <ThemeProvider>
                <AuthProvider>
                    <Box sx={{ display: 'flex', overflowX: 'hidden' }}>
                        {/* AppBar mobile (hamburger) */}
                        <AppBar
                            position="fixed"
                            elevation={0}
                            sx={{
                                backgroundColor: "transparent",
                                backdropFilter: 'blur(8px)',
                                display: { xs: 'flex', md: 'none' },
                                width: '100%',
                            }}
                        >
                            <Toolbar>
                                <IconButton
                                    color="inherit"
                                    aria-label="open drawer"
                                    edge="start"
                                    onClick={handleMobileToggle}
                                    sx={{ mr: 2 }}
                                >
                                    <MenuIcon />
                                </IconButton>
                                <Box sx={{ flexGrow: 1 }}>
                                    <LogoMeLembra />
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
                                transition: theme.transitions.create(['left', 'transform', 'background-color'], {
                                    easing: theme.transitions.easing.sharp,
                                    duration: theme.transitions.duration.short,
                                }),
                            })}
                        >
                            {/* aumenta levemente as "linhas" do ícone */}
                            <MenuIcon sx={{ fontSize: 20 }} />
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
                                transition: theme.transitions.create('margin', {
                                    easing: theme.transitions.easing.sharp,
                                    duration: theme.transitions.duration.standard,
                                }),
                                ml: { md: desktopOpen ? `${drawerWidth}px` : `${miniWidth}px` },
                            })}
                        >
                            {/* placeholder toolbar só para mobile (evita conteúdo atrás do AppBar) */}
                            <Toolbar sx={{ display: { xs: 'block', md: 'none' } }} />
                            {/* Toolbar desktop vazio (pode conter breadcrumb/titulo) */}
                            <Toolbar sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: 'flex-start', px: 0 }} />
                            <PageTransition>
                                {children}
                            </PageTransition>
                        </Box>
                    </Box>
                </AuthProvider>
            </ThemeProvider>
        </Provider>
    )
}