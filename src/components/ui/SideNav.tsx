'use client'
//melembra/src/components/ui/SideNav.tsx
import ThemeSwitcher from './ThemeSwitcher'
import { useRouter, usePathname } from 'next/navigation'
import HomeRoundedIcon from '@mui/icons-material/HomeRounded'
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded'
import PhonelinkSetupRoundedIcon from '@mui/icons-material/PhonelinkSetupRounded'
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography, Divider, Tooltip } from '@mui/material'

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
            <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: desktopOpen ? 'center' : 'flex-start', p: 2 }}>
                <Typography variant="subtitle1" mr={2} component="div" sx={{ display: desktopOpen ? 'block' : 'none' }}>
                    SUA LOGO AQUI
                </Typography>
            </Toolbar>
            <Divider />
            <List sx={{ flexGrow: 1 }}>
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
                                    justifyContent: desktopOpen ? 'initial' : 'center',
                                    px: 2.5,
                                    transition: theme.transitions.create(['padding', 'background-color'], {
                                        duration: theme.transitions.duration.short,
                                    }),
                                })}
                            >
                                <ListItemIcon
                                    sx={{
                                        minWidth: 0,
                                        mr: desktopOpen ? 3 : 0,
                                        justifyContent: 'center',
                                        color: 'inherit',
                                    }}
                                >
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText primary={item.text} sx={{ opacity: desktopOpen ? 1 : 0, transition: (t) => t.transitions.create('opacity') }} />
                            </ListItemButton>
                        </Tooltip>
                    </ListItem>
                ))}
            </List>
            <Box sx={{ p: 2, textAlign: 'center' }}>
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
