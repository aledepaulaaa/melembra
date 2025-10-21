'use client'
//melembra/src/components/PushNotificationManager.tsx
import { usePushNotification } from "@/hooks/usePushNotification"
import { Box, Button, TextField, Typography, Paper, Skeleton } from "@mui/material"
import NotificationsActiveOutlinedIcon from "@mui/icons-material/NotificationsActiveOutlined"

export default function PushNotificationManager() {
    const {
        isSupported,
        isSubscribed,
        isLoading,
        message,
        setMessage,
        handleSubscribe,
        handleUnsubscribe,
        handleSendTest,
    } = usePushNotification()

    if (isLoading) {
        return <Skeleton variant="rounded" width="100%" height={150} />
    }

    if (!isSupported) {
        return (
            <Paper elevation={0} sx={{ p: 3, borderRadius: 2, mt: 3, boxShadow: 0 }}>
                <Typography variant="h6" gutterBottom>Notificações Push</Typography>
                <Typography color="text.secondary">Seu navegador não tem suporte para notificações push.</Typography>
            </Paper>
        )
    }

    return (
        <Paper elevation={0} sx={{ p: 3, borderRadius: 2, mt: 3, boxShadow: 0 }}>
            <Typography variant="h6" gutterBottom>Notificações Push</Typography>
            {isSubscribed ? (
                <>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                        Suas notificações estão ativas! Envie um teste para confirmar.
                    </Typography>
                    <Box sx={{ display: "flex", gap: 2, alignItems: 'center' }}>
                        <TextField
                            label="Mensagem de teste"
                            variant="outlined"
                            fullWidth
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        />
                        <Button variant="contained" onClick={handleSendTest}>Enviar</Button>
                    </Box>
                    <Button variant="outlined" color="error" onClick={handleUnsubscribe} sx={{ mt: 2 }}>
                        Desativar Notificações
                    </Button>
                </>
            ) : (
                <>
                    <Typography variant="body1" color="text.secondary" mb={2}>
                        Receba seus lembretes diretamente no seu dispositivo.
                    </Typography>
                    <Button
                        startIcon={<NotificationsActiveOutlinedIcon />}
                        variant="contained"
                        onClick={handleSubscribe}
                    >
                        Ativar Notificações
                    </Button>
                </>
            )}
        </Paper>
    )
}