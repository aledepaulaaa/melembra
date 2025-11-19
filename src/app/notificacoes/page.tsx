import { Box, Paper, Typography } from "@mui/material"
import PushNotificationManager from "@/components/ui/pwa/PushNotificationManager"

export default function NotificacoesPage(){
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <Paper elevation={0} sx={{ boxShadow: 'none', p: 1, width: '100%', maxWidth: 600, borderRadius: 4, textAlign: 'center' }}>
                <Typography variant="h4" m={2} component="h2" fontWeight={900} gutterBottom>Notificações</Typography>
                <PushNotificationManager />
            </Paper>
        </Box>
    )
}