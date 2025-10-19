"use client"
//melembra/src/components/PushNotificationManager.tsx
import { usePushNotification } from "@/hooks/usePushNotification"
import { Box, Button, TextField, Typography, Paper } from "@mui/material"
import NotificationsActiveOutlinedIcon from "@mui/icons-material/NotificationsActiveOutlined"

export default function PushNotificationManager() {
    const {
        isSupported,
        subscription,
        message,
        setMessage,
        handleSubscribe,
        handleUnsubscribe,
        handleSendTest,
    } = usePushNotification()

    if (!isSupported) {
        return <Typography>Notificações push não são suportadas neste navegador.</Typography>
    }

    return (
        <Paper elevation={0} sx={{ p: 3, borderRadius: 2, mt: 3, boxShadow: 0 }}>
            <Typography variant="h6" gutterBottom>Notificações Push</Typography>
            {subscription ? (
                <>
                    <Typography variant="body1">Suas notificações push estão ativadas!</Typography>
                    <Box sx={{ mt: 2, display: "flex", gap: 2, flexDirection: "column", justifyContent: "center" }}>
                        <TextField
                            label="Mensagem de teste"
                            variant="outlined"
                            fullWidth
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        />
                        <Button variant="contained" onClick={handleSendTest}>
                            Enviar Teste
                        </Button>
                    </Box>
                    <Button variant="contained" color="error" onClick={handleUnsubscribe} sx={{ mt: 1 }}>
                        Desativar
                    </Button>
                </>
            ) : (
                <>
                    <Typography variant="body1" mb={2}>Você ainda não ativou suas notificações.</Typography>
                    <Button
                        startIcon={<NotificationsActiveOutlinedIcon fontSize="large" />}
                        variant="contained"
                        onClick={handleSubscribe}
                    >
                        Ativar
                    </Button>
                </>
            )}
        </Paper>
    )
}