'use client'
// bora-app/src/components/ui/SideNav.tsx
import ThemeSwitcher from '../theme/ThemeSwitcher'
import { menuItems } from './menuItems'
import LogoAnimated from '../logo/LogoAnimated'
import { useRouter, usePathname } from 'next/navigation'
import SubscriptionStatus from './SubscriptionStatus'
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar, Divider, Tooltip, useTheme } from '@mui/material'

// Importações necessárias para a autenticação
import { signOut } from 'firebase/auth'
import { auth } from '@/app/lib/firebase'
import { useSnackbar } from '@/contexts/SnackbarProvider'

const defaultDrawerWidth = 250

interface SideNavProps {
    mobileOpen: boolean
    handleDrawerToggle: () => void
    desktopOpen?: boolean
    handleDesktopToggle?: () => void
    drawerWidth?: number
    miniWidth?: number
}

// Lembre-se de ajustar o menuItems.ts para que 'Sair' tenha uma ação
// Ex: { text: 'Sair', action: 'logout', icon: <LogoutIcon /> }

export default function SideNav({
    mobileOpen,
    handleDrawerToggle,
    desktopOpen = true,
    drawerWidth = defaultDrawerWidth,
    miniWidth = 64,
}: SideNavProps) {
    const router = useRouter()
    const pathname = usePathname()
    const theme = useTheme()
    const { openSnackbar } = useSnackbar() // Hook para notificações

    // Função para lidar com o logout do usuário
    const handleLogout = async () => {
        try {
            await signOut(auth)
            openSnackbar('Você foi desconectado com segurança.', 'info')
            router.push('/login') // Redireciona para a tela de login
        } catch (error) {
            console.error("Erro ao fazer logout:", error)
            openSnackbar('Ocorreu um erro ao tentar sair.', 'error')
        }
    }

    // Função central para lidar com cliques nos itens do menu
    const handleMenuItemClick = (item: (typeof menuItems)[0]) => {
        if (item.action === 'logout') {
            handleLogout()
        } else if (item.path) {
            router.push(item.path)
        }

        // Fecha o menu mobile se estiver aberto
        if (mobileOpen) {
            handleDrawerToggle()
        }
    }

    const drawerContent = (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: "transparent" }}>
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
                {/* ThemeSwitcher que SÓ aparece quando o menu está ENCOLHIDO */}
                <Box sx={(theme) => ({
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
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
                                // O item 'Sair' não terá um 'path', então a seleção não se aplica
                                selected={item.path ? pathname === item.path : false}
                                // AQUI ESTÁ A MUDANÇA PRINCIPAL
                                onClick={() => handleMenuItemClick(item)}
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
                                        color: theme.palette.mode === 'dark' ? '#fff' : theme.palette.primary.main,
                                    }}
                                >
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText
                                    primary={item.text}
                                    sx={{
                                        color: theme.palette.mode === 'dark' ? '#fff' : theme.palette.primary.main,
                                        opacity: desktopOpen ? 1 : 0, transition: (t) => t.transitions.create('opacity'),
                                        fontWeight: "bold"
                                    }}
                                />
                            </ListItemButton>
                        </Tooltip>
                    </ListItem>
                ))}
            </List>
            <Divider />
            <SubscriptionStatus desktopOpen={desktopOpen} />
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
                        boxShadow: "none",
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
                        boxShadow: "none",
                        backgroundColor: theme.palette.background.default,
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