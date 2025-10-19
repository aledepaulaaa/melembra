'use client'
// melemebra/src/components/ui/UserCreateProfile.tsx
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import useUserCreateProfile from '@/hooks/useUserCreateProfile'
import { VisibilityOff, Visibility } from '@mui/icons-material'
import { Box, TextField, Button, Accordion, AccordionSummary, AccordionDetails, Typography, CircularProgress, Stack, IconButton, InputAdornment } from '@mui/material'

export default function UserCreateProfile() {
    const {
        isLoading,
        formData,
        handleInputChange,
        handleCreateAccount,
        showPassword,
        toggleShowPassword
    } = useUserCreateProfile()

    return (
        <Box>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                Crie sua conta para salvar seus lembretes e ter acesso em qualquer dispositivo.
            </Typography>
            <Stack spacing={2}>
                <TextField
                    name="name"
                    label="Nome Completo *"
                    placeholder='Nome Completo...'
                    value={formData.name}
                    onChange={handleInputChange}
                    fullWidth
                />
                <TextField
                    name="email"
                    label="E-mail *"
                    type="email"
                    placeholder='seuemail@email.com'
                    value={formData.email}
                    onChange={handleInputChange}
                    fullWidth
                />
                <TextField
                    name="password"
                    sx={{ mb: 2 }}
                    label="Senha *"
                    placeholder="******"
                    variant="outlined"
                    fullWidth
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    aria-label="toggle password visibility"
                                    onClick={toggleShowPassword}
                                    edge="end"
                                >
                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />
                <Accordion sx={{ boxShadow: 0, '&:before': { display: 'none' } }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography color="text.secondary">Dados Opcionais</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Stack spacing={2}>
                            <TextField
                                name="nickname"
                                label="Apelido"
                                placeholder='seunickname'
                                value={formData.nickname}
                                onChange={handleInputChange}
                                fullWidth
                            />
                            <TextField
                                name="whatsappNumber"
                                label="Nº WhatsApp (Ex: 55119...)"
                                placeholder='Seu número do WhatsApp'
                                value={formData.whatsappNumber}
                                onChange={handleInputChange}
                                fullWidth
                            />
                        </Stack>
                    </AccordionDetails>
                </Accordion>
                <Button variant="contained" onClick={handleCreateAccount} disabled={isLoading} fullWidth>
                    {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Criar Minha Conta'}
                </Button>
            </Stack>
        </Box>
    )
}