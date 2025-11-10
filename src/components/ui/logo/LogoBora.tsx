'use client'
//bora-app/src/components/ui/LogoMeLembra.tsx
import Image from "next/image"
import { useTheme } from '@mui/material/styles'

// Prop opcional para controlar o tamanho
interface LogoProps {
    size?: number
}

export default function LogoBora({ size = 40 }: LogoProps) {
    // Hook do Material-UI para acessar o tema atual (claro ou escuro)
    const theme = useTheme()
    const isDarkMode = theme.palette.mode === 'dark'

    // Escolhe o caminho do SVG com base no modo do tema
    const logoSrc = isDarkMode ? "/logo_bora_dark.svg" : "/logo_bora_light.svg"

    return (
        <Image
            src={logoSrc}
            width={100} // Largura intrínseca do arquivo
            height={100} // Altura intrínseca do arquivo
            alt="Logo Bora"
            priority={true}
            // Usa o `size` da prop para o estilo dinâmico
            style={{ width: size, height: size, transition: 'width 0.2s, height 0.2s' }}
        />
    )
}