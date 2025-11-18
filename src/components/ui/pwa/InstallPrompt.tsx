'use client'
// bora-app/src/components/ui/pwa/InstallPrompt.tsx (caminho ajustado para refletir a importação)
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
    useTheme,
} from '@mui/material'
import AddToHomeScreenIcon from '@mui/icons-material/AddToHomeScreen'
import IosShareIcon from '@mui/icons-material/IosShare'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline' // Novo ícone de sucesso

// A tipagem global BeforeInstallPromptEvent deve ser definida em um arquivo .d.ts no seu projeto
// Para fins de demonstração, vamos usá-la como se estivesse definida:
declare global {
    interface WindowEventMap {
        beforeinstallprompt: BeforeInstallPromptEvent;
    }
    interface BeforeInstallPromptEvent extends Event {
        readonly platforms: Array<string>;
        readonly userChoice: Promise<{
            outcome: 'accepted' | 'dismissed';
            platform: string;
        }>;
        prompt(): Promise<void>;
    }
}

export default function InstallPrompt() {
    const [promptEvent, setPromptEvent] = React.useState<BeforeInstallPromptEvent | null>(null)
    const [isAppInstalled, setIsAppInstalled] = React.useState(false)
    const [isIOS, setIsIOS] = React.useState(false)
    const [iosDialogOpen, setIosDialogOpen] = React.useState(true)
    const theme = useTheme()

    React.useEffect(() => {
        // 1. Verificar se o PWA está instalado
        if (window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone) {
            setIsAppInstalled(true)
        }

        // 2. Detectar iOS (para instruir o usuário)
        const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
        setIsIOS(isIOSDevice)

        // 3. Capturar o evento beforeinstallprompt (Android/Desktop)
        const handleBeforeInstallPrompt = (event: BeforeInstallPromptEvent) => {
            event.preventDefault()
            setPromptEvent(event)
        }

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener)

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener)
        }
    }, [])

    // CORREÇÃO: Limpar o evento se o usuário recusar/aceitar (melhora a UX)
    React.useEffect(() => {
        // Esta lógica deve ser refinada dentro do handleInstallClick
    }, [promptEvent])


    const handleInstallClick = async () => {
        if (isIOS) {
            setIosDialogOpen(true)
            return
        }

        if (promptEvent) {
            // Mostra o prompt de instalação nativo
            promptEvent.prompt()

            // Espera a escolha do usuário
            const { outcome } = await promptEvent.userChoice

            if (outcome === 'accepted') {
                console.log('Usuário aceitou a instalação do PWA')
                // O estado 'isAppInstalled' será atualizado pelo listener 'appinstalled' (idealmente)
            } else {
                console.log('Usuário recusou a instalação do PWA')
            }

            // Limpa o evento, impedindo que o prompt apareça novamente até que uma nova condição seja atendida
            // setPromptEvent(null)

            return
        }

        console.log('O prompt de instalação nativo não está disponível neste momento.')
    }

    // Só mostra o botão de instalação se for iOS OU o evento prompt estiver disponível.
    // E, claro, se o app AINDA não estiver instalado.
    const shouldShowInstallPrompt = !isAppInstalled && (isIOS || !!promptEvent)

    // --- Renderização do Status ---

    // 1. Se o App já estiver instalado
    if (isAppInstalled) {
        return (
            <Paper elevation={0} sx={{ p: 3, borderRadius: 2, mt: 3, boxShadow: 0, bgcolor: 'primary.light' }}>
                <CheckCircleOutlineIcon sx={{ verticalAlign: 'middle', mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" component="span" fontWeight="bold">
                    Você já instalou o App!
                </Typography>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>
                    O Bora está pronto na sua tela de início para acesso rápido.
                </Typography>
            </Paper>
        )
    }

    // 2. Se o botão de instalação deve aparecer
    if (shouldShowInstallPrompt) {
        return (
            <>
                <Paper elevation={0} sx={{ p: 3, borderRadius: 2, mt: 3, boxShadow: 0 }}>
                    <Typography variant="h6" gutterBottom>Instalar Aplicativo</Typography>
                    <Typography
                        variant="subtitle1"
                        sx={{
                            mb: 2,
                            color: theme.palette.mode === 'dark' ? '#fff' : theme.palette.primary.main
                        }}
                    >
                        Tenha uma experiência mais rápida e integrada adicionando o Bora à sua tela de início.
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={isIOS ? <IosShareIcon /> : <AddToHomeScreenIcon />}
                        onClick={handleInstallClick}
                    >
                        {isIOS ? 'Ver Instruções de Instalação' : 'Instalar App'}
                    </Button>
                </Paper>
                {/* Dialog com instruções para iOS (mantido de forma funcional) */}
                <Dialog
                    open={iosDialogOpen}
                    onClose={() => setIosDialogOpen(false)}
                    aria-labelledby="ios-install-title"
                >
                    <DialogTitle
                        id="ios-install-title"
                        sx={{
                            textAlign: "center",
                            fontSize: 22,
                            color: "#fff"
                        }}
                    >
                        Instalar no seu iPhone ou iPad
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText component="div">
                            <Typography
                                component="h5"
                                textAlign="center"
                                fontWeight="bold"
                                mb={4}
                                sx={{
                                    color: "#fff"
                                }}
                            >
                                Para instalar o Bora <br />siga estes passos simples:
                            </Typography>
                        </DialogContentText>
                        <Box component="ol" sx={{ pl: 2, mt: 2, color: "#fff" }}>
                            <li>
                                <Typography
                                    variant="subtitle1"
                                    mb={2}
                                >
                                    Toque no botão "Compartilhar"
                                    <IosShareIcon sx={{ verticalAlign: 'middle', mx: 0.5 }} />
                                    na barra inferior do Safari.
                                </Typography>
                            </li>
                            <li>
                                <Typography variant="subtitle1" mb={2}>Role para baixo e selecione **"Adicionar à Tela de Início"**.</Typography>
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

    // 3. Fallback (Não instalado, mas indisponível/não suportado)
    return null;
}