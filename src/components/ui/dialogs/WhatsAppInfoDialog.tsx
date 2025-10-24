//melembra/src/components/ui/WhatsAppInfoDialog.tsx
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
                <WhatsAppIcon fontSize='large' color="success" />
                <DialogTitle sx={{ p: 0, fontWeight: 'bold' }}>Formato do Número WhatsApp</DialogTitle>
            </Stack>
            <DialogContent>
                <DialogContentText component="div" sx={{ color: 'text.primary' }}>
                    <Alert severity='info' sx={{ mb: 2 }}>
                        Para garantir que você receba todas as notificações, seu número precisa estar no formato internacional.
                    </Alert>
                    <Alert severity='success'>
                        O formato ideal é: **+55 (DDD) 9....-....**
                        <br />
                        Exemplo para DDD 31: **+55 (31) 98334-7898**.
                        <br />
                        <Typography
                            variant="caption"
                        >
                            Recomendamos sempre incluir o nono dígito (9) para garantir a compatibilidade com todos os sistemas.
                        </Typography>
                    </Alert>
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} variant="contained" autoFocus>Entendi</Button>
            </DialogActions>
        </Dialog>
    )
}