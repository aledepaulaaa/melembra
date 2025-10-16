'use client'
//melembra/src/components/ui/ThemeSwitcher.tsx
import React from 'react'
import { useTheme } from '@mui/material/styles'
import { IconButton } from '@mui/material'
import LightModeIcon from '@mui/icons-material/LightMode'
import NightlightRoundIcon from '@mui/icons-material/NightlightRound'
import { motion } from 'framer-motion'
import { ThemeContext } from '../providers/ThemeProvider'

const iconVariants: any = {
    jump: {
        y: [0, -10, 0],
        rotate: [0, 10, -10, 0],
        transition: {
            duration: 0.4,
            ease: 'easeInOut',
        },
    },
}

export default function ThemeSwitcher() {
    const theme = useTheme()
    const colorMode = React.useContext(ThemeContext)

    return (
        <IconButton
            sx={{
                ml: 1,
                position: 'absolute',
                top: 16,
                right: 16,
                color: theme.palette.mode === 'light' ? theme.palette.secondary.main : theme.palette.primary.main
            }}
            onClick={colorMode.toggleColorMode}
        >
            <motion.div
                key={theme.palette.mode}
                variants={iconVariants}
                animate="jump"
            >
                {theme.palette.mode === 'dark' ? <NightlightRoundIcon /> : <LightModeIcon />}
            </motion.div>
        </IconButton>
    )
}