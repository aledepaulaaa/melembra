'use client'
//melembra/src/components/ui/SideNav.tsx
import ThemeSwitcher from './ThemeSwitcher'
import LogoAnimated from './LogoAnimated'
import { useRouter, usePathname } from 'next/navigation'
import HomeRoundedIcon from '@mui/icons-material/HomeRounded'
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded'
import PhonelinkSetupRoundedIcon from '@mui/icons-material/PhonelinkSetupRounded'
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar, Divider, Tooltip } from '@mui/material'

const defaultDrawerWidth = 240

interface SideNavProps {
    mobileOpen: boolean
    handleDrawerToggle: () => void
    desktopOpen?: boolean
    handleDesktopToggle?: () => void
    drawerWidth?: number
    miniWidth?: number
}

export default function SideNav({
    mobileOpen,
    handleDrawerToggle,
    desktopOpen = true,
    drawerWidth = defaultDrawerWidth,
    miniWidth = 64,
}: SideNavProps) {
    const router = useRouter()
    const pathname = usePathname()

    const menuItems = [
        { text: 'Início', path: '/', icon: <HomeRoundedIcon /> },
        { text: 'Lembretes', path: '/lembretes', icon: <CalendarMonthRoundedIcon /> },
        { text: 'Configurações', path: '/configuracoes', icon: <PhonelinkSetupRoundedIcon /> },
    ]

    const drawerContent = (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                backgroundColor: "transparent"
            }}
        >
            {/* --- SEÇÃO SUPERIOR --- */}
            <Box>
                {/* Container da Logo que desaparece */}
                <Box
                    sx={(theme) => ({
                        transition: theme.transitions.create(['opacity', 'height'], {
                            duration: theme.transitions.duration.short
                        }),
                        height: desktopOpen ? 64 : 0,
                        opacity: desktopOpen ? 1 : 0,
                        overflow: 'hidden',
                        pointerEvents: desktopOpen ? 'auto' : 'none',
                    })}
                >
                    <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', px: 2 }}>
                        <LogoAnimated size={40} />
                    </Toolbar>
                </Box>
                {/* --- A CORREÇÃO ESTÁ AQUI --- */}
                {/* ThemeSwitcher que SÓ aparece quando o menu está ENCOLHIDO */}
                <Box sx={(theme) => ({
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    // Define uma altura fixa para ocupar o espaço da logo quando encolhido
                    height: desktopOpen ? 0 : 64,
                    transition: theme.transitions.create('opacity'),
                    opacity: desktopOpen ? 0 : 1,
                    pointerEvents: desktopOpen ? 'none' : 'auto',
                })}>
                    <ThemeSwitcher />
                </Box>
            </Box>
            <Divider />
            {/* Lista de Itens do Menu */}
            <List sx={{ flexGrow: 1, pt: 1 }}>
                {menuItems.map((item) => (
                    <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
                        <Tooltip title={desktopOpen ? '' : item.text} placement="right">
                            <ListItemButton
                                selected={pathname === item.path}
                                onClick={() => {
                                    router.push(item.path)
                                    if (mobileOpen) handleDrawerToggle()
                                }}
                                sx={(theme) => ({
                                    minHeight: 48,
                                    justifyContent: 'center',
                                    px: 2.5,
                                    transition: theme.transitions.create(['padding', 'background-color'], {
                                        duration: theme.transitions.duration.short,
                                    }),
                                })}
                            >
                                <ListItemIcon
                                    sx={{
                                        minWidth: 0,
                                        mr: desktopOpen ? 3 : 'auto',
                                        justifyContent: 'center',
                                        color: 'inherit',
                                    }}
                                >
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText
                                    primary={item.text}
                                    sx={{ opacity: desktopOpen ? 1 : 0, transition: (t) => t.transitions.create('opacity') }}
                                />
                            </ListItemButton>
                        </Tooltip>
                    </ListItem>
                ))}
            </List>
            <Divider />
            {/* ThemeSwitcher que SÓ aparece quando o menu está ABERTO */}
            <Box
                sx={(theme) => ({
                    p: 2,
                    textAlign: 'center',
                    flexShrink: 0,
                    transition: theme.transitions.create('opacity'),
                    opacity: desktopOpen ? 1 : 0,
                    pointerEvents: desktopOpen ? 'auto' : 'none',
                })}
            >
                <ThemeSwitcher />
            </Box>
        </Box>
    )

    return (
        <Box
            component="nav"
            aria-label="mailbox folders"
            sx={{
                width: { md: desktopOpen ? drawerWidth : miniWidth },
                flexShrink: { md: 0 },
                backgroundColor: "transparent"
            }}
        >
            {/* Temporary drawer -> mobile (overlay) */}
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{ keepMounted: true }}
                sx={{
                    display: { xs: 'block', md: 'none' },
                    '& .MuiDrawer-paper': {
                        boxSizing: 'border-box',
                        width: drawerWidth,
                    },
                }}
            >
                {drawerContent}
            </Drawer>
            {/* Persistent / mini drawer -> desktop */}
            <Drawer
                variant="permanent"
                open
                sx={(theme) => ({
                    display: { xs: 'none', md: 'block' },
                    '& .MuiDrawer-paper': {
                        boxSizing: 'border-box',
                        width: desktopOpen ? drawerWidth : miniWidth,
                        overflowX: 'hidden',
                        whiteSpace: 'nowrap',
                        transition: theme.transitions.create('width', {
                            easing: theme.transitions.easing.sharp,
                            duration: theme.transitions.duration.standard,
                        }),
                    },
                })}
            >
                {drawerContent}
            </Drawer>
        </Box>
    )
}
