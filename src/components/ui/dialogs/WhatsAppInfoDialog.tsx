//bora-app/src/components/ui/WhatsAppInfoDialog.tsx
'use client'
import WhatsAppIcon from '@mui/icons-material/WhatsApp'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack, Alert, DialogContentText, Typography } from '@mui/material'

interface Props {
    open: boolean
    onClose: () => void
}

export default function WhatsAppInfoDialog({ open, onClose }: Props) {
    return (
        <Dialog open={open} onClose={onClose} fullWidth>
            <Stack spacing={1} direction="row" alignItems="center" sx={{ p: 2 }}>
                <DialogTitle sx={{ p: 0, fontWeight: 'bold' }}>Número do WhatsApp</DialogTitle>
                <WhatsAppIcon fontSize='medium' color="success" />
            </Stack>
            <DialogContent>
                <DialogContentText component="div" sx={{ color: 'text.primary' }}>
                    <Alert severity='info' sx={{ mb: 2, fontSize: 16 }}>
                        Para garantir que você receba todas as notificações, seu número precisa estar no formato internacional.
                    </Alert>
                    <Alert severity='success' sx={{ mb: 2, fontSize: 16 }}>
                        O formato ideal é: **+55 (DDD) 9....-....**
                        <br />
                        Exemplo para DDD 31: **+55 (31) 98334-7898**.
                        <br />
                        <Typography
                            variant="body1"
                        >
                            Recomendamos sempre incluir o nono dígito (9) para garantir a compatibilidade com todos os sistemas.
                        </Typography>
                    </Alert>
                    <Alert severity='info' sx={{ fontSize: 16}}>
                        Existem casos também onde o número salvo no WhatsApp pode ser: **+55(DDD)8334-7898** sem o dígito (9) e que também é aceito.
                        Recomendamos verificar seu número correto em seu whatsapp antes de salvar aqui no Me Lembra.
                    </Alert>
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} variant="contained" autoFocus>Entendi</Button>
            </DialogActions>
        </Dialog>
    )
}