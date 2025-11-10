//bora-app/src/components/ui/MenuIconCustom.tsx
import { Box } from "@mui/material"

interface MenuIconCustomProps {
    color: string
}

export default function MenuIconCustom({ color }: MenuIconCustomProps) {

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-around',
                width: 24, // Largura total do ícone
                height: 24, // Altura total do ícone
            }}
        >
            {/* Barra 1 */}
            <Box
                sx={{
                    height: 4, // Altura (espessura) da linha
                    width: 24, // Largura da linha
                    backgroundColor: color,
                    borderRadius: 4,
                }}
            />
            {/* Barra 2 - Exemplo com largura menor e espaçamento vindo do 'justifyContent' */}
            <Box
                sx={{
                    height: 4, // Altura (espessura) da linha
                    width: 18, // Largura da linha
                    backgroundColor: color,
                    borderRadius: 4,
                    alignSelf: 'flex-start', // Alinha a barra (opcional)
                }}
            />
            {/* Barra 3 */}
            <Box
                sx={{
                    height: 4, // Altura (espessura) da linha
                    width: 24, // Largura da linha
                    backgroundColor: color,
                    borderRadius: 4,
                }}
            />
        </Box>
    )
}