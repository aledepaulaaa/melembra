'use client'
//melembra/src/components/ui/ThemeSwitcher.tsx
import React, { useContext } from 'react'
import { useTheme } from '@mui/material/styles'
import { IconButton } from '@mui/material'
import Brightness4Icon from '@mui/icons-material/Brightness4' // Ícone para modo escuro
import Brightness7Icon from '@mui/icons-material/Brightness7' // Ícone para modo claro
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
    const colorMode = useContext(ThemeContext)

    return (
        <IconButton
            sx={{ ml: 1, position: 'absolute', top: 16, right: 16 }}
            onClick={colorMode.toggleColorMode}
            color="inherit"
        >
            <motion.div
                key={theme.palette.mode}
                variants={iconVariants}
                animate="jump"
            >
                {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </motion.div>
        </IconButton>
    )
}