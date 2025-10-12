'use client'
//melembra/src/components/ui/SideNav.tsx
import React from 'react'
import { useRouter, usePathname } from 'next/navigation'
import HomeRoundedIcon from '@mui/icons-material/HomeRounded'
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded'
import PhonelinkSetupRoundedIcon from '@mui/icons-material/PhonelinkSetupRounded'
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar } from '@mui/material'

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
        <div>
            <Toolbar />
            <List>
                {menuItems.map((item) => (
                    <ListItem key={item.text} disablePadding>
                        <ListItemButton
                            selected={pathname === item.path}
                            onClick={() => {
                                router.push(item.path)
                                // Fecha o drawer após o clique em telas móveis
                                if (mobileOpen) handleDrawerToggle()
                            }}
                        >
                            <ListItemIcon>{item.icon}</ListItemIcon>
                            <ListItemText primary={item.text} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </div>
    )

    return (
        <Box
            component="nav"
            sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
            aria-label="mailbox folders"
        >
            {/* Drawer para telas pequenas e médias (temporário) */}
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{
                    keepMounted: true, // Melhora o desempenho de abertura em dispositivos móveis.
                }}
                sx={{
                    display: { xs: 'block', md: 'none' },
                    '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                }}
            >
                {drawerContent}
            </Drawer>
            {/* Drawer para telas grandes (permanente) */}
            <Drawer
                open
                variant="permanent"
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