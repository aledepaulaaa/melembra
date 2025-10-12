// melembra/src/components/ui/UserProfile.tsx
'use client'
import {
    Typography,
    Paper,
    TextField,
    Button,
    IconButton,
    InputAdornment,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import useUserProfile from '@/hooks/useUserProfile'

export default function UserProfile() {
    const {
        dialogOpen,
        email,
        setEmail,
        password,
        showPassword,
        setPassword,
        resetEmail,
        setDialogOpen,
        setResetEmail,
        handleLinkAccount,
        handlePasswordReset,
        setShowPassword
    } = useUserProfile()

    return (
        <Paper elevation={3} sx={{ p: 3, borderRadius: 2, mt: 3, width: '100%' }}>
            <Typography variant="h6" gutterBottom>
                Detalhes da Conta
            </Typography>
            <TextField
                label="E-mail"
                variant="outlined"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{ mb: 2 }}
            />
            <TextField
                label="Senha"
                variant="outlined"
                fullWidth
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton
                                aria-label="toggle password visibility"
                                onClick={() => setShowPassword(!showPassword)}
                                edge="end"
                            >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                        </InputAdornment>
                    ),
                }}
                sx={{ mb: 2 }}
            />
            <Button variant="contained" onClick={handleLinkAccount} fullWidth sx={{ mb: 1 }}>
                Associar Conta
            </Button>
            <Button variant="text" onClick={() => setDialogOpen(true)} fullWidth>
                Esqueci a Senha
            </Button>
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
                <DialogTitle>Redefinir Senha</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="E-mail de redefinição"
                        type="email"
                        fullWidth
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
                    <Button onClick={handlePasswordReset}>Enviar Link</Button>
                </DialogActions>
            </Dialog>
        </Paper>
    )
}