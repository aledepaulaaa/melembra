'use client'
// melemebra/src/components/ui/UpgradeAccountDialog.tsx
import { useRouter } from 'next/navigation'
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material'

interface Props {
    open: boolean
    onClose: () => void
}

export default function UpgradeAccountDialog({ open, onClose }: Props) {
    const router = useRouter()

    const handleCreateAccount = () => {
        onClose()
        router.push('/perfil')
    }

    return (
        <Dialog
            open={open}
            onClose={onClose}
        >
            <DialogTitle fontWeight="bold" fontSize={24}>Obaaa, vai assinar o Plus?</DialogTitle>
            <DialogContent>
                <Box
                    sx={{
                        p: 4,
                        display: "flex",
                        justifyContent: "center",
                        flexDirection: "column",
                        borderRadius: 4,
                    }}
                >
                    <Typography variant="h6">Crie sua conta, ou <br/>faça login se já tiver uma.</Typography>
                    <Typography variant="h5" fontWeight="bold" sx={{ mt: 4 }}>É rapidinho, viu?!</Typography>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} variant="contained" color="error">Depois</Button>
                <Button onClick={handleCreateAccount} variant="contained">Criar | Login</Button>
            </DialogActions>
        </Dialog>
    )
}