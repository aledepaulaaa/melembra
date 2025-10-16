'use client'
// melembra/src/components/ui/WelcomeInstallDialog.tsx
import React, { useState, useEffect } from 'react'
import {
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Box,
    Typography,
} from '@mui/material'
import { toast } from 'react-toastify'
import LogoMeLembra from './ui/LogoMeLembra'

export default function WelcomeInstallDialog() {
    const [isOpen, setIsOpen] = useState(false)
    const [installPromptEvent, setInstallPromptEvent] = useState<Event | null>(null)

    useEffect(() => {
        // Verifica se o app já está instalado ou se o dialog já foi visto
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches
        const hasSeenDialog = localStorage.getItem('hasSeenInstallDialog')

        if (isStandalone || hasSeenDialog) {
            return // Não faz nada se já estiver instalado ou se o usuário já viu o dialog
        }

        const handleBeforeInstallPrompt = (event: Event) => {
            event.preventDefault()
            setInstallPromptEvent(event)
        }

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

        // Atraso de 1 segundo para mostrar o dialog
        const timer = setTimeout(() => {
            setIsOpen(true)
        }, 1000)

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
            clearTimeout(timer)
        }
    }, [])

    const handleInstall = () => {
        if (!installPromptEvent) {
            // Fallback para iOS e outros navegadores
            alert('Para instalar, use a opção "Adicionar à Tela de Início" no menu do seu navegador.')
            return
        }
        (installPromptEvent as any).prompt()
        // O navegador cuidará do resto
        setIsOpen(false)
        localStorage.setItem('hasSeenInstallDialog', 'true')
    }

    const handleReject = () => {
        setIsOpen(false)
        localStorage.setItem('hasSeenInstallDialog', 'true')
        toast.info("Ok, se mudar de ideia você pode instalar o app acessando as configurações. Obrigado <3")
    }

    if (!isOpen) {
        return null
    }

    return (
        <Dialog
            open={true}
            onClose={handleReject}
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
                <DialogContentText sx={{ color: "inherit", fontSize: 20 }}>
                    Instale o <b>MeLembra</b> em sua tela de início para uma experiência mais rápida e integrada, e ative as notificações para nunca mais se esquecer de nada!
                </DialogContentText>
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'center', pb: 3, px: 3 }}>
                <Button onClick={handleReject} variant="contained" color="inherit">Agora não</Button>
                <Button onClick={handleInstall} variant="contained" autoFocus>
                    Instalar e Ativar
                </Button>
            </DialogActions>
        </Dialog>
    )
}