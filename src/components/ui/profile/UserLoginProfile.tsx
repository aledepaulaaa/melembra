'use client'
import useUserLogin from '@/hooks/useUserLogin'
// melemebra/src/components/ui/profile/UserLoginProfile.tsx
import { Visibility, VisibilityOff } from '@mui/icons-material'
import { TextField, Button, CircularProgress, Stack, InputAdornment, IconButton, Link, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material'

export default function UserLoginProfile() {
    const {
        isLoading, email, setEmail, password, setPassword, showPassword,
        toggleShowPassword, handleLogin, handlePasswordReset,setResetEmail,
        dialogOpen, openResetDialog, closeResetDialog, resetEmail
    } = useUserLogin()

    return (
        <>
            <Stack spacing={2} sx={{ mt: 2 }}>
                <TextField label="E-mail" type="email" placeholder='seuemail@email.com' value={email} onChange={(e) => setEmail(e.target.value)} fullWidth />
                <TextField
                    label="Senha"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    fullWidth
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton onClick={toggleShowPassword} edge="end">
                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />
                <Button variant="contained" onClick={handleLogin} disabled={isLoading}>
                    {isLoading ? <CircularProgress size={24} /> : 'Entrar'}
                </Button>
                <Link component="button" variant="body2" onClick={openResetDialog} sx={{ alignSelf: 'center' }}>
                    Esqueci minha senha
                </Link>
            </Stack>
            <Dialog open={dialogOpen} onClose={closeResetDialog}>
                <DialogTitle>Redefinir Senha</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="E-mail para redefinição"
                        type="email"
                        fullWidth
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        placeholder="Digite o e-mail da sua conta"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeResetDialog}>Cancelar</Button>
                    <Button onClick={handlePasswordReset} variant="contained">Enviar Link</Button>
                </DialogActions>
            </Dialog>
        </>
    )
}