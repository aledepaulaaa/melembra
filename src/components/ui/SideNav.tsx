'use client'
// melembra/src/components/ui/SideNav.tsx
import React from 'react'
import ThemeSwitcher from './ThemeSwitcher'
import { useRouter, usePathname } from 'next/navigation'
import HomeRoundedIcon from '@mui/icons-material/HomeRounded'
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded'
import PhonelinkSetupRoundedIcon from '@mui/icons-material/PhonelinkSetupRounded'
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography, Divider } from '@mui/material'

const drawerWidth = 240

interface SideNavProps {
    mobileOpen: boolean
    handleDrawerToggle: () => void
}

export default function SideNav({ mobileOpen, handleDrawerToggle }: SideNavProps) {
    const router = useRouter()
    const pathname = usePathname()

    const menuItems = [
        { text: 'Início', path: '/', icon: <HomeRoundedIcon /> },
        { text: 'Lembretes', path: '/lembretes', icon: <CalendarMonthRoundedIcon /> },
        { text: 'Configurações', path: '/configuracoes', icon: <PhonelinkSetupRoundedIcon /> },
    ]

    const drawerContent = (
        // NOVO: Usando Box com Flexbox para empurrar o ThemeSwitcher para baixo
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* NOVO: Toolbar para a Logo */}
            <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
                {/* Substitua a Typography pela sua tag <Image> ou <img> */}
                <Typography variant="subtitle1" mr={2} component="div">
                    SUA LOGO AQUI
                </Typography>
            </Toolbar>
            <Divider />
            <List sx={{ flexGrow: 1 }}> {/* flexGrow empurra o resto para baixo */}
                {menuItems.map((item) => (
                    <ListItem key={item.text} disablePadding>
                        <ListItemButton
                            selected={pathname === item.path}
                            onClick={() => {
                                router.push(item.path)
                                if (mobileOpen) handleDrawerToggle()
                            }}
                        >
                            <ListItemIcon>{item.icon}</ListItemIcon>
                            <ListItemText primary={item.text} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
            <Divider />
            {/* NOVO: ThemeSwitcher na parte de baixo do menu */}
            <Box sx={{ p: 2, textAlign: 'center' }}>
                <ThemeSwitcher />
            </Box>
        </Box>
    )

    return (
        <Box
            component="nav"
            sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
            aria-label="mailbox folders"
        >
            {/* Drawer temporário (móvel) */}
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{ keepMounted: true }}
                sx={{
                    display: { xs: 'block', md: 'none' },
                    '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                }}
            >
                {drawerContent}
            </Drawer>
            {/* Drawer permanente (desktop) */}
            <Drawer
                variant="permanent"
                open
                sx={{
                    display: { xs: 'none', md: 'block' },
                    '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                }}
            >
                {drawerContent}
            </Drawer>
        </Box>
    )
}