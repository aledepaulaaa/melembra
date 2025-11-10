'use-client'
//bora-app/src/app/perfil/page.tsx
import UserProfile from "@/components/ui/profile/UserProfile"
import { Box, Typography } from "@mui/material"

export default function PerfilPage() {
    return (
        <Box id="detalhes-conta">
            <Typography variant="h6" fontWeight={700} gutterBottom>
                Gerenciar conta
            </Typography>
            <UserProfile />
        </Box>
    )
}