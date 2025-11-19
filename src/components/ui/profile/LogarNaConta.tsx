'use client'
//appbora/src/components/ui/profile/LogarNaConta.tsx
import useUserLogin from '@/hooks/useUserLogin'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import LogoAnimated from '../logo/LogoAnimated'
import { TextField, Button, CircularProgress, Stack, InputAdornment, 
IconButton, Link, Dialog, DialogActions, DialogContent, DialogTitle, Box, Typography, useTheme } from '@mui/material'

export default function LogarNaConta() {
    const theme = useTheme()
    const {
        isLoading, email, setEmail, password, setPassword, showPassword,
        toggleShowPassword, handleLogin, handlePasswordReset, setResetEmail,
        dialogOpen, openResetDialog, closeResetDialog, resetEmail
    } = useUserLogin()

    return (
        <>
            <Stack spacing={4} sx={{ mt: 2 }}>
                <Box sx={{ display: "flex", gap: 1, alignItems: "center", mt: 10 }}>
                    <LogoAnimated size={55} />
                    <Typography
                        lineHeight={1}
                        fontWeight={900}
                        variant="h2"
                        textAlign="start"
                        component="h2"
                        sx={{ color: theme.palette.mode === 'dark' ? '#fff' : theme.palette.primary.main }}
                    >
                        Bora
                    </Typography>
                </Box>
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
                    <Button onClick={closeResetDialog} variant="contained" color="error">Cancelar</Button>
                    <Button onClick={handlePasswordReset} variant="contained">Enviar Link</Button>
                </DialogActions>
            </Dialog>
        </>
    )
}