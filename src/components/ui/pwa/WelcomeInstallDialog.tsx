'use client'
// melembra/src/components/ui/WelcomeInstallDialog.tsx
import {
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Box,
    Typography,
    Accordion,
    AccordionDetails,
    AccordionSummary,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import IosShareIcon from '@mui/icons-material/IosShare'
import LogoMeLembra from '../logo/LogoMeLembra'
import React from 'react'
import { useSnackbar } from '@/contexts/SnackbarProvider'

export default function WelcomeInstallDialog() {
    const { openSnackbar } = useSnackbar()
    const [isOpen, setIsOpen] = React.useState(false)
    const [installPrompt, setInstallPrompt] = React.useState<any>(null)
    const [isIOS, setIsIOS] = React.useState(false)

    React.useEffect(() => {
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches
        const hasSeenDialog = localStorage.getItem('hasSeenInstallDialog')
        setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream)

        if (isStandalone || hasSeenDialog) return

        const handleBeforeInstallPrompt = (event: Event) => {
            event.preventDefault()
            setInstallPrompt(event)
        }

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

        const timer = setTimeout(() => setIsOpen(true), 2000)

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
            clearTimeout(timer)
        }
    }, [])

    const handleInstall = () => {
        if (installPrompt) {
            installPrompt.prompt()
        }
        // Para iOS, o botão não faz nada, pois as instruções já estão visíveis
    }

    const handleClose = () => {
        setIsOpen(false)
        localStorage.setItem('hasSeenInstallDialog', 'true')
        if (!isIOS && !installPrompt) {
            openSnackbar("Ok, se mudar de ideia, pode instalar o app em Configurações.", 'info')
        }
    }

    if (!isOpen || (!installPrompt && !isIOS)) {
        return null
    }

    return (
        <Dialog
            open={true}
            onClose={handleClose}
            PaperProps={{
                sx: {
                    borderRadius: 4,
                    bgcolor: 'white', // Cor de fundo branca
                    color: 'black',   // Texto preto
                    backdropFilter: 'blur(10px)',
                    background: '#ffffff94',
                }
            }}
        >
            <DialogTitle sx={{ textAlign: 'center', pt: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
                    <LogoMeLembra size={65} />
                    <Typography variant="h4" component="span" fontWeight="bold">Oi sou o MeLembra!</Typography>
                </Box>
            </DialogTitle>
            <DialogContent sx={{ textAlign: 'center' }}>
                <DialogContentText sx={{ color: "inherit", fontSize: 20, mb: 2 }}>
                    Tenha uma experiência completa <br/>instalando o app <b>MeLembra.</b>
                </DialogContentText>
                {isIOS && (
                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography>Instruções para iPhone/iPad</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Box component="ol" sx={{ pl: 2, textAlign: 'left' }}>
                                <li><Typography>Toque no ícone de Compartilhar <IosShareIcon sx={{ verticalAlign: 'middle' }} /></Typography></li>
                                <li><Typography>Selecione "Adicionar à Tela de Início".</Typography></li>
                                <li><Typography>Confirme em "Adicionar".</Typography></li>
                            </Box>
                        </AccordionDetails>
                    </Accordion>
                )}
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'center', pb: 3, px: 3 }}>
                <Button onClick={handleClose} variant="outlined">Agora não</Button>
                {/* O botão de instalar só aparece para Android/Desktop que têm o prompt */}
                {installPrompt && (
                    <Button onClick={handleInstall} variant="contained" autoFocus>
                        Instalar Agora
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    )
}