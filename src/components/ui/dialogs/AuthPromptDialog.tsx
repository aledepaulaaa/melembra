'use client'
//appbora/src/components/ui/dialogs/AuthPromptDialog.tsx
import NextLink from 'next/link'
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Stack, Typography } from '@mui/material'

interface AuthPromptDialogProps {
    open: boolean
    onClose: () => void
}

export default function AuthPromptDialog({ open, onClose }: AuthPromptDialogProps) {
    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle fontWeight={700} fontSize={22} sx={{ color: '#fff' }}>Tá quase lá!</DialogTitle>
            <DialogContent>
                <DialogContentText
                    component="div"
                    sx={{
                        // Gradiente vertical: começa transparente e termina no roxo sutil
                        background: `linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(111, 19, 223, 0.28) 100%)`,
                        // Adicionei padding e bordas arredondadas para o background não ficar colado no texto
                        p: 3,
                        borderRadius: 4,
                        border: '1px solid rgba(187, 134, 252, 0.1)' // Um toque extra de refinamento na borda
                    }}
                >
                    <Typography fontWeight="bold" textAlign="center" variant="body1" sx={{ color: '#fff' }}>
                        Vi que você está offline. Para salvarmos seu lembrete, é só acessar sua conta.
                    </Typography>
                    <Typography fontWeight="bold" variant="body1" textAlign="center" mt={2} sx={{ color: '#fff' }}>
                        Se não tiver uma, é rapidinho criar!
                    </Typography>
                </DialogContentText>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Stack spacing={1} width="100%">
                    <Button
                        component={NextLink}
                        href="/login"
                        variant="contained"
                        fullWidth
                        sx={{ fontSize: 14, p: 1, borderRadius: 4, fontWeight: 'bold' }}
                    >
                        Entrar
                    </Button>
                    <Button
                        component={NextLink}
                        href="/criarconta"
                        variant="outlined"
                        fullWidth
                        sx={{ fontSize: 14, p: 1, borderRadius: 4, fontWeight: 'bold' }}
                    >
                        Criar Conta
                    </Button>
                </Stack>
            </DialogActions>
        </Dialog>
    )
}