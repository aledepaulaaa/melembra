'use client'
//bora-app/src/components/InstallPrompt.tsx
import React from 'react'
import {
    Button,
    Box,
    Typography,
    Paper,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
} from '@mui/material'
import AddToHomeScreenIcon from '@mui/icons-material/AddToHomeScreen'
import IosShareIcon from '@mui/icons-material/IosShare' // Ícone de compartilhamento do iOS

export default function InstallPrompt() {
    // ALTERADO: Tipagem correta para o evento
    const [promptEvent, setPromptEvent] = React.useState<BeforeInstallPromptEvent | null>(null)
    const [isAppInstalled, setIsAppInstalled] = React.useState(false)
    const [isIOS, setIsIOS] = React.useState(false)
    const [iosDialogOpen, setIosDialogOpen] = React.useState(false)

    React.useEffect(() => {
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsAppInstalled(true)
        }

        const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
        setIsIOS(isIOSDevice)

        // O TypeScript agora entende o tipo 'beforeinstallprompt'
        const handleBeforeInstallPrompt = (event: BeforeInstallPromptEvent) => {
            event.preventDefault()
            setPromptEvent(event)
        }

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener)

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener)
        }
    }, [])

    const handleInstallClick = () => {
        // Cenário 1: Dispositivo iOS -> Mostra o dialog de instruções
        if (isIOS) {
            setIosDialogOpen(true)
            return
        }

        // Cenário 2: Android/Desktop com prompt disponível -> Mostra o prompt nativo
        if (promptEvent) {
            promptEvent.prompt() // O TypeScript não reclama mais!
            return
        }

        // Cenário 3 (Fallback): Navegadores que não disparam o evento, mas suportam PWA
        // A melhor abordagem aqui é não fazer nada ou mostrar um alerta mais amigável
        // se você tiver certeza de que o navegador é compatível.
        // Por segurança, o botão pode simplesmente não fazer nada se não houver um prompt.
        // O alert anterior era a causa do problema visual.
        console.log('O prompt de instalação nativo não está disponível neste momento.')
    }

    // CORREÇÃO: Só mostra o botão se houver uma ação possível (iOS ou prompt disponível)
    const canInstall = isIOS || !!promptEvent;

    if (isAppInstalled || !canInstall) {
        return null // Não renderiza o componente se o app já estiver instalado ou se não for instalável
    }

    return (
        <>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 2, mt: 3, boxShadow: 0 }}>
                <Typography variant="h6" gutterBottom>Instalar Aplicativo</Typography>
                <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
                    Tenha uma experiência mais rápida e integrada adicionando o Bora à sua tela de início.
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddToHomeScreenIcon />}
                    onClick={handleInstallClick}
                >
                    Instalar App
                </Button>
            </Paper>
            {/* Dialog com instruções para iOS */}
            <Dialog
                open={iosDialogOpen}
                onClose={() => setIosDialogOpen(false)}
                aria-labelledby="ios-install-title"
            >
                <DialogTitle id="ios-install-title" sx={{ textAlign: "center", fontSize: 22 }}>Instalar no seu iPhone ou iPad</DialogTitle>
                <DialogContent>
                    <DialogContentText component="div">
                        <Typography component="h5" textAlign="center" fontWeight="bold" color="textPrimary" mb={4}>
                            Para instalar o Bora <br />siga estes passos simples:
                        </Typography>
                    </DialogContentText>
                    <Box component="ol" sx={{ pl: 2, mt: 2 }}>
                        <li>
                            <Typography variant="subtitle1" mb={2}>Toque no botão "Compartilhar" <IosShareIcon sx={{ verticalAlign: 'middle', mx: 0.5 }} /> no menu do Safari ou Chrome.</Typography>
                        </li>
                        <li>
                            <Typography variant="subtitle1" mb={2}>Role para baixo e selecione "Adicionar à Tela de Início".</Typography>
                        </li>
                        <li>
                            <Typography variant="subtitle1">Confirme tocando em "Adicionar" no canto superior direito.</Typography>
                        </li>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIosDialogOpen(false)} variant="contained" color="primary">
                        Entendi
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}