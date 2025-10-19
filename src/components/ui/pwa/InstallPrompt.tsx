'use client'
// melembra/src/components/InstallPrompt.tsx
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
    const [installPromptEvent, setInstallPromptEvent] = React.useState<Event | null>(null)
    const [isAppInstalled, setIsAppInstalled] = React.useState(false)
    const [isIOS, setIsIOS] = React.useState(false)
    const [iosDialogOpen, setIosDialogOpen] = React.useState(false)

    React.useEffect(() => {
        // Verifica se já está em modo standalone
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsAppInstalled(true)
        }

        // Detecta se o dispositivo é iOS
        const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
        setIsIOS(isIOSDevice)

        const handleBeforeInstallPrompt = (event: Event) => {
            event.preventDefault()
            setInstallPromptEvent(event)
        }

        // Só adiciona o listener se não for iOS, pois o iOS não o suporta
        if (!isIOSDevice) {
            window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
        }

        return () => {
            if (!isIOSDevice) {
                window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
            }
        }
    }, [])

    const handleInstallClick = () => {
        if (isIOS) {
            // Se for iOS, abre o dialog de instruções
            setIosDialogOpen(true)
        } else if (installPromptEvent) {
            // Se for Android/Desktop, aciona o prompt nativo
            (installPromptEvent as any).prompt()
        } else {
            // Fallback para outros casos
            alert('Para instalar, procure a opção "Adicionar à Tela de Início" no menu do seu navegador.')
        }
    }

    // Não mostra o componente se o app já estiver instalado
    if (isAppInstalled) {
        return null
    }

    return (
        <>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 2, mt: 3, boxShadow: 0 }}>
                <Typography variant="h6" gutterBottom>Instalar Aplicativo</Typography>
                <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
                    Tenha uma experiência mais rápida e integrada adicionando o MeLembra à sua tela de início.
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
                            Para instalar o MeLembra <br/>siga estes passos simples:
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