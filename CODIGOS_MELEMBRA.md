//melembra/src/app/store/slices/reminderSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface ReminderItem {
    id: number
    text: string
}

interface ReminderState {
    reminders: ReminderItem[]
    isSaving: boolean
}

const initialState: ReminderState = {
    reminders: [{ id: 0, text: '' }],
    isSaving: false,
}

export const reminderSlice = createSlice({
    name: 'reminders',
    initialState,
    reducers: {
        addReminder: (state, action: PayloadAction<string>) => {
            const newId = state.reminders.length > 0 ? state.reminders[state.reminders.length - 1].id + 1 : 0
            state.reminders.push({ id: newId, text: action.payload })
        },
        updateReminder: (state, action: PayloadAction<{ id: number; text: string }>) => {
            const index = state.reminders.findIndex(item => item.id === action.payload.id)
            if (index !== -1) {
                state.reminders[index].text = action.payload.text
            }
        },
        resetReminders: (state) => {
            state.reminders = [{ id: 0, text: '' }]
        },
        setSavingStatus: (state, action: PayloadAction<boolean>) => {
            state.isSaving = action.payload
        },
    },
})

export const { addReminder, updateReminder, resetReminders, setSavingStatus } = reminderSlice.actions
export default reminderSlice.reducer

//melembra/src/app/actions/actions.ts
'use server'
import webpush, { PushSubscription } from 'web-push'
import { db } from '../lib/firebase'
import { getFirebaseAuth } from '../lib/firebase-admin'
import { addDoc, collection, doc, setDoc, getDoc, getDocs, orderBy, query, where, Timestamp } from 'firebase/firestore'

const adminAuth = getFirebaseAuth()

webpush.setVapidDetails(
    'mailto:contatoaledev@gmail.com',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
)

export async function subscribeUser(sub: PushSubscription, userId: string) {
    if (!userId) {
        throw new Error('É necessário o UserID do usuário para inscrição')
    }

    const docRef = doc(db, 'inscricoes', userId)
    await setDoc(docRef, {
        subscription: sub,
        userId: userId,
        createdAt: new Date(),
    })
    return { success: true }
}

export async function unsubscribeUser(userId: string) {
    if (!userId) {
        throw new Error('É necessário o UserID do usuário para remover a inscrição')
    }

    const docRef = doc(db, 'inscricoes', userId)
    await setDoc(docRef, { subscription: null, userId: userId }, { merge: true })
    return { success: true }
}

export async function sendNotification(message: string, userId: string) {
    const docRef = doc(db, 'inscricoes', userId)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists() || !docSnap.data()?.subscription) {
        throw new Error('Nenhuma inscrição encontrada para o usuário')
    }

    const subscription = docSnap.data()?.subscription

    try {
        await webpush.sendNotification(
            subscription,
            JSON.stringify({
                title: 'Lembrete do TentameLembrar',
                body: message,
                icon: '/icon-192x192.png',
            })
        )
        return { success: true }
    } catch (error) {
        console.error('Erro ao enviar notificação push:', error)
        return { success: false, error: 'Erro ao enviar notificação push' }
    }
}

export async function saveReminder(title: string, date: Date, userId: string) {
    if (!userId || !title || !date) {
        return { success: false, error: 'Dados do lembrete inválidos.' }
    }
    try {
        const docRef = await addDoc(collection(db, 'reminders'), {
            title,
            scheduledAt: Timestamp.fromDate(date),
            userId,
            createdAt: Timestamp.now(),
            sent: false,
        })
        return { success: true, reminderId: docRef.id }
    } catch (error) {
        console.error('Erro ao salvar lembrete:', error)
        return { success: false, error: 'Falha ao salvar lembrete.' }
    }
}

export async function getReminders(userId: string) {
    if (!userId) {
        return { success: false, error: 'UserID obrigatório para buscar lembretes' }
    }
    try {
        const q = query(
            collection(db, 'reminders'),
            where('userId', '==', userId),
            orderBy('scheduledAt', 'asc')
        )
        const querySnapshot = await getDocs(q)
        const reminders = querySnapshot.docs.map((doc) => {
            const data = doc.data()
            // Corrigindo o erro de Timestamp
            return {
                id: doc.id,
                ...data,
                scheduledAt: data.scheduledAt.toDate().toISOString(),
                createdAt: data.createdAt.toDate().toISOString(),
            }
        })
        return { success: true, reminders }
    } catch (error) {
        console.error('Erro ao buscar lembretes:', error)
        return {
            success: false,
            error: 'Falha ao buscar lembretes. Tente novamente.',
        }
    }
}

export async function linkEmailToAnonymousUser(userId: string, email: string, password: string) {
    try {
        await adminAuth.updateUser(userId, {
            email,
            password,
        })
        return { success: true }
    } catch (error) {
        console.error('Erro ao linkar e-mail à conta anônima:', error)
        return { success: false, error: 'Falha ao associar e-mail. Tente novamente.' }
    }
}

export async function resetUserPassword(email: string) {
    try {
        await adminAuth.generatePasswordResetLink(email)
        return { success: true }
    } catch (error) {
        console.error('Erro ao enviar link de redefinição:', error)
        return { success: false, error: 'Falha ao enviar link de redefinição de senha.' }
    }
}

export async function getUserPreferences(userId: string) {
    if (!userId) {
        return { success: false, error: 'UserID obrigatório' }
    }
    try {
        const docRef = doc(db, 'preferences', userId)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
            return { success: true, preferences: docSnap.data() }
        } else {
            return { success: true, preferences: { enableTips: true } }
        }
    } catch (error) {
        console.error('Erro ao buscar preferências:', error)
        return { success: false, error: 'Falha ao buscar preferências.' }
    }
}

export async function saveUserPreferences(userId: string, preferences: any) {
    if (!userId) {
        return { success: false, error: 'UserID obrigatório' }
    }
    try {
        const docRef = doc(db, 'preferences', userId)
        await setDoc(docRef, preferences, { merge: true })
        return { success: true }
    } catch (error) {
        console.error('Erro ao salvar preferências:', error)
        return { success: false, error: 'Falha ao salvar preferências.' }
    }
}

export async function saveUserPhoneNumber(userId: string, phoneNumber: string) {
    if (!userId) {
        return { success: false, error: 'UserID obrigatório para salvar o número.' }
    }
    if (!phoneNumber) {
        return { success: false, error: 'Número de telefone obrigatório.' }
    }

    try {
        const docRef = doc(db, 'users', userId)
        await setDoc(docRef, { whatsappNumber: phoneNumber }, { merge: true })
        return { success: true, message: 'Número salvo com sucesso!' }
    } catch (error) {
        console.error('Erro ao salvar o número de telefone:', error)
        return { success: false, error: 'Falha ao salvar o número.' }
    }
}

// melembra/src/app/api/gemini/route.ts
import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string)
const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

export async function POST(request: Request) {
    try {
        const { prompt } = await request.json()

        if (!prompt) {
            return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
        }

        const result = await model.generateContent(`
            Crie uma lista de sugestões de itens ou próximos passos de forma curta e direta, baseada na seguinte frase. 
            Responda apenas com a lista em formato de texto separado por vírgulas. Não inclua numeração ou frases adicionais. Frase: "${prompt}"`
        )
        const response = await result.response
        const text = response.text()
        const suggestions = text.split(',').map(s => s.trim())

        return NextResponse.json({ suggestions })
    } catch (error) {
        console.error('Error with Gemini API:', error)
        return NextResponse.json({ error: 'Failed to generate content' }, { status: 500 })
    }
}

'use client'
//melembra/src/app/configuracoes/page.tsx
import React from 'react'
import { Box, Typography, Paper } from '@mui/material'
import InstallPrompt from "@/components/InstallPrompt"
import PushNotificationManager from '@/components/PushNotificationManager'
import UserProfile from '@/components/ui/UserProfile'
import TipNotificationToggle from '@/components/ui/TipNotificationToggle'

export default function SettingsPage() {
    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                p: 4,
            }}
        >
            <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 600, borderRadius: 4, textAlign: 'center' }}>
                <Typography variant="h4" component="h2" gutterBottom>Configurações</Typography>
                <InstallPrompt />
                <PushNotificationManager />
                <UserProfile />
                <TipNotificationToggle />
            </Paper>
        </Box>
    )
}

'use client'
// melembra/src/components/ui/ReminderList.tsx
import React, { useEffect, useState } from 'react'
import { Box, Typography, Paper, Skeleton } from '@mui/material'
import { useAuth } from '@/components/AuthManager'
import { getReminders } from '@/app/actions/actions'

// 1. Interface atualizada para refletir a estrutura do documento no Firestore
interface Reminder {
    id: string
    title: string
}

export default function ReminderList() {
    const { userId, loading: authLoading } = useAuth()
    // 2. O estado agora armazena um array de `Reminder`
    const [reminders, setReminders] = useState<Reminder[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchReminders = async () => {
            if (!userId) return

            setLoading(true)
            const result = await getReminders(userId)
            if (result.success && result.reminders) {
                // 3. Fazendo a conversão de tipo para a nova interface
                setReminders(result.reminders as any)
            } else {
                console.error(result.error)
            }
            setLoading(false)
        }

        if (!authLoading) {
            fetchReminders()
        }
    }, [userId, authLoading])

    if (loading || authLoading) {
        return (
            <Box sx={{ p: 4, width: '100%', maxWidth: 600 }}>
                <Typography variant="h4" component="h2" gutterBottom>
                    Seus Lembretes
                </Typography>
                <Skeleton variant="rectangular" height={50} sx={{ borderRadius: 2, mb: 2 }} />
                <Skeleton variant="rectangular" height={50} sx={{ borderRadius: 2, mb: 2 }} />
                <Skeleton variant="rectangular" height={50} sx={{ borderRadius: 2, mb: 2 }} />
            </Box>
        )
    }

    return (
        <Box sx={{ p: 4, width: '100%', maxWidth: 600 }}>
            <Typography variant="h4" component="h2" gutterBottom>
                Seus Lembretes
            </Typography>
            {reminders.length > 0 ? (
                // 4. Lógica de renderização simplificada com um único .map()
                reminders.map((reminder) => (
                    <Paper key={reminder.id} elevation={3} sx={{ p: 2, mb: 2, borderRadius: 2 }}>
                        <Typography variant="body1">
                            {reminder.title}
                        </Typography>
                    </Paper>
                ))
            ) : (
                <Typography variant="body1" color="text.secondary">
                    Você ainda não tem lembretes salvos.
                </Typography>
            )}
        </Box>
    )
}

'use client'
//melembra/src/components/ui/ThemeSwitcher.tsx
import React, { useContext } from 'react'
import { useTheme } from '@mui/material/styles'
import { IconButton } from '@mui/material'
import Brightness4Icon from '@mui/icons-material/Brightness4' // Ícone para modo escuro
import Brightness7Icon from '@mui/icons-material/Brightness7' // Ícone para modo claro
import { motion } from 'framer-motion'
import { ThemeContext } from '../providers/ThemeProvider'

const iconVariants: any = {
    jump: {
        y: [0, -10, 0],
        rotate: [0, 10, -10, 0],
        transition: {
            duration: 0.4,
            ease: 'easeInOut',
        },
    },
}

export default function ThemeSwitcher() {
    const theme = useTheme()
    const colorMode = useContext(ThemeContext)

    return (
        <IconButton
            sx={{ ml: 1, position: 'absolute', top: 16, right: 16 }}
            onClick={colorMode.toggleColorMode}
            color="inherit"
        >
            <motion.div
                key={theme.palette.mode}
                variants={iconVariants}
                animate="jump"
            >
                {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </motion.div>
        </IconButton>
    )
}

'use client'
//melembra/src/components/ui/SideNav.tsx
import React from 'react'
import { useRouter, usePathname } from 'next/navigation'
import HomeRoundedIcon from '@mui/icons-material/HomeRounded'
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded'
import PhonelinkSetupRoundedIcon from '@mui/icons-material/PhonelinkSetupRounded'
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar } from '@mui/material'

const drawerWidth = 240

interface SideNavProps {
    mobileOpen: boolean
    handleDrawerToggle: () => void
}

export default function SideNav({ mobileOpen, handleDrawerToggle }: SideNavProps) {
    const router = useRouter()
    const pathname = usePathname()

    const menuItems = [
        { text: 'Início', path: '/', icon: <HomeRoundedIcon /> },
        { text: 'Lembretes', path: '/lembretes', icon: <CalendarMonthRoundedIcon /> },
        { text: 'Configurações', path: '/configuracoes', icon: <PhonelinkSetupRoundedIcon /> },
    ]

    const drawerContent = (
        <div>
            <Toolbar />
            <List>
                {menuItems.map((item) => (
                    <ListItem key={item.text} disablePadding>
                        <ListItemButton
                            selected={pathname === item.path}
                            onClick={() => {
                                router.push(item.path)
                                // Fecha o drawer após o clique em telas móveis
                                if (mobileOpen) handleDrawerToggle()
                            }}
                        >
                            <ListItemIcon>{item.icon}</ListItemIcon>
                            <ListItemText primary={item.text} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </div>
    )

    return (
        <Box
            component="nav"
            sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
            aria-label="mailbox folders"
        >
            {/* Drawer para telas pequenas e médias (temporário) */}
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{
                    keepMounted: true, // Melhora o desempenho de abertura em dispositivos móveis.
                }}
                sx={{
                    display: { xs: 'block', md: 'none' },
                    '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                }}
            >
                {drawerContent}
            </Drawer>
            {/* Drawer para telas grandes (permanente) */}
            <Drawer
                open
                variant="permanent"
                sx={{
                    display: { xs: 'none', md: 'block' },
                    '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                }}
            >
                {drawerContent}
            </Drawer>
        </Box>
    )
}

'use client'
//melembra/src/app/page.tsx
import { Box, Skeleton } from '@mui/material'
import { useAuth } from '@/components/AuthManager'
import ReminderFlow from '@/components/ui/ReminderFlow'

export default function Home() {
    const { loading } = useAuth()

    if (loading) {
        return (
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 4,
                }}
            >
                <Skeleton animation="wave" width="100%" />
                <Skeleton animation="wave" width="85%" />
                <Skeleton animation="wave" width="75%" />
            </Box>
        )
    }

    return (
        <Box
            sx={{
                // Ocupa 100% da altura do container pai (que é a 'main' do layout)
                height: '100%',
                width: '100%', // Corrigido o erro de digitação 'wdith'
                display: 'flex',
                flexDirection: 'column',
                // Alinha o conteúdo na parte de baixo
                justifyContent: 'flex-end',
            }}
        >
            <ReminderFlow />
        </Box>
    )
}

'use client'
// src/app/layout.tsx
import React from 'react'
import { AuthProvider } from '@/components/AuthManager'
import { Provider } from 'react-redux'
import { store } from '@/app/store/store'
import ThemeProvider from '@/components/providers/ThemeProvider'
import SideNav from '@/components/ui/SideNav'
import PageTransition from '@/components/providers/PageTransition'
import { Box, Toolbar, AppBar, IconButton, Typography } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'

const drawerWidth = 240

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const [mobileOpen, setMobileOpen] = React.useState(false)

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen)
    }

    return (
        <html lang="pt-br">
            <body>
                <Provider store={store}>
                    <ThemeProvider>
                        <AuthProvider>
                            <Box sx={{ display: 'flex' }}>
                                <AppBar
                                    position="fixed"
                                    sx={{
                                        backgroundColor: "transparent",
                                        width: { md: `calc(100% - ${drawerWidth}px)` },
                                        ml: { md: `${drawerWidth}px` },
                                        display: { md: 'none' } // A AppBar só aparecerá em telas menores
                                    }}
                                >
                                    <Toolbar>
                                        <IconButton
                                            color="inherit"
                                            aria-label="open drawer"
                                            edge="start"
                                            onClick={handleDrawerToggle}
                                            sx={{ 
                                                mr: 2, 
                                                display: { md: 'none' },
                                            }}
                                        >
                                            <MenuIcon />
                                        </IconButton>
                                        <Typography variant="h6" noWrap component="div">
                                            MeLembra
                                        </Typography>
                                    </Toolbar>
                                </AppBar>
                                <SideNav mobileOpen={mobileOpen} handleDrawerToggle={handleDrawerToggle} />
                                <Box
                                    component="main"
                                    sx={{
                                        flexGrow: 1,
                                        p: 3,
                                        width: { md: `calc(100% - ${drawerWidth}px)` },
                                        minHeight: '100vh',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    {/* Toolbar fantasma para empurrar o conteúdo para baixo da AppBar em telas móveis */}
                                    <Toolbar sx={{ display: { md: 'none' }}} />
                                    <PageTransition>
                                        {children}
                                    </PageTransition>
                                </Box>
                            </Box>
                        </AuthProvider>
                    </ThemeProvider>
                </Provider>
            </body>
        </html>
    )
}

'use client'
//melembra/src/components/ui/ReminderFlow.tsx
import React from 'react'
import ReminderForm from '@/components/forms/ReminderForm'
import { Container } from '@mui/material'

export default function ReminderFlow() {
    return (
        <Container
            maxWidth="md"
            sx={{ position: "absolute", bottom: 50, overflowX: "hidden" }}>
            <ReminderForm />
        </Container>
    )
}

'use client'
//melembra/src/components/ui/TipNotificationToggle.tsx
import React, { useState, useEffect } from 'react'
import {
    FormControlLabel,
    Switch,
    Typography,
    Box,
    Paper,
    Skeleton,
} from '@mui/material'
import { useAuth } from '@/components/AuthManager'
import { getUserPreferences, saveUserPreferences } from '@/app/actions/actions'

export default function TipNotificationToggle() {
    const { userId } = useAuth()
    const [enabled, setEnabled] = useState(true)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchPreferences = async () => {
            if (!userId) return
            const prefs = await getUserPreferences(userId)
            if (prefs.success && prefs.preferences) {
                setEnabled(prefs.preferences.enableTips)
            }
            setLoading(false)
        }

        fetchPreferences()
    }, [userId])

    const handleToggle = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const newState = event.target.checked
        setEnabled(newState)
        if (userId) {
            await saveUserPreferences(userId, { enableTips: newState })
        }
    }

    if (loading) {
        return <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 2, mb: 2 }} />
    }

    return (
        <Paper elevation={3} sx={{ mt: 2, p: 2, mb: 2, borderRadius: 2 }}>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}
            >
                <Typography variant="body1">Ativar Dicas do App</Typography>
                <FormControlLabel
                    control={<Switch checked={enabled} onChange={handleToggle} />}
                    label={enabled ? 'Ativado' : 'Desativado'}
                    labelPlacement="start"
                />
            </Box>
        </Paper>
    )
}

'use client'
//melembra/src/components/providers/ThemeProvider.tsx
import React, { useState, useMemo, createContext } from 'react'
import {
    ThemeProvider as MuiThemeProvider,
    createTheme,
    CssBaseline,
} from '@mui/material'
import { Gabarito } from 'next/font/google'

export const ThemeContext = createContext({
    toggleColorMode: () => { },
    globalStyles: '',
    colorMode: { toggleColorMode: () => { } },
})

export const gabarito = Gabarito({
    weight: ['400', '500', '700', '900'],
    subsets: ['latin'],
    display: 'swap',
})

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [mode, setMode] = useState<'light' | 'dark'>('dark')

    const colorMode = useMemo(
        () => ({
            toggleColorMode: () => {
                setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'))
            },
        }),
        [],
    )

    const globalStyles = `
        :root {
        --background: #ffffff;
        --foreground: #171717;
        }

        @media (prefers-color-scheme: dark) {
        :root {
            --background: #0a0a0a;
            --foreground: #ededed;
        }
        }

        html, body {
        max-width: 100vw;
        overflow-x: hidden;
        }

        body {
        color: var(--foreground);
        background: var(--background);
        font-family: Arial, Helvetica, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        }

        * {
        box-sizing: border-box;
        padding: 0;
        margin: 0;
        }

        a {
        color: inherit;
        text-decoration: none;
        }

        @media (prefers-color-scheme: dark) {
        html {
            color-scheme: dark;
        }
        }

        .animated-border {
        position: relative;
        overflow: hidden;
        border-radius: 20px;
        background: #121212;
        border: 1px solid rgba(255, 255, 255, 0.2);
        backdrop-filter: blur(16px);
        box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
        
        }

        .animated-border::before {
        content: '';
        position: absolute;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        background: conic-gradient(
            transparent,
            rgba(187, 134, 252, 0.7),
            rgba(3, 103, 218, 0.7),
            transparent
        );
        animation: flow 4s linear infinite;
        z-index: -1;
        }

        /* Animação para rotacionar o gradiente */
        @keyframes flow {
        from {
            transform: rotate(0deg);
        }
        to {
            transform: rotate(360deg);
        }
        }

        /* Criar a máscara para o efeito de borda */
        .animated-border::after {
        content: '';
        position: absolute;
        top: 1px;
        left: 1px;
        right: 1px;
        bottom: 1px;
        background: var(--background);
        border-radius: 19px;
        z-index: -1;
    }
`

    const theme = useMemo(
        () =>
            createTheme({
                palette: {
                    mode,
                    background: {
                        default: mode === 'dark' ? '#121212' : '#FFFFFF',
                        paper: mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                    },
                    primary: {
                        main: '#BB86FC',
                    },
                    secondary: {
                        main: '#03DAC6',
                    },
                },
                typography: {
                    fontFamily: gabarito.style.fontFamily,
                },
                components: {
                    MuiCssBaseline: {
                        styleOverrides: {
                            body: {
                                background: mode === 'dark' ? '#000000' : '#FFFFFF',
                                color: mode === 'dark' ? '#FFFFFF' : '#000000',
                                fontFamily: gabarito.style.fontFamily,
                            },
                        },
                    },
                    MuiButton: {
                        styleOverrides: {
                            root: {
                                borderRadius: 8,
                            },
                        },
                    },
                    MuiPaper: {
                        styleOverrides: {
                            root: {
                                background: 'rgba(255, 255, 255, 0.1)',
                                backdropFilter: 'blur(16px)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
                            },
                        },
                    },
                },
            }),
        [mode],
    )

    return (
        <ThemeContext.Provider value={{ colorMode, globalStyles, toggleColorMode: colorMode.toggleColorMode }}>
            <MuiThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </MuiThemeProvider>
        </ThemeContext.Provider>
    )
}

'use client'
//melembra/src/components/forms/WhatsAppSettingsForm.tsx
import React, { useState, useEffect } from 'react'
import {
    Box,
    TextField,
    Button,
    Typography,
    Paper,
    LinearProgress,
} from '@mui/material'
import { useAuth } from '../AuthManager'
import { doc, getDoc } from 'firebase/firestore'
import { toast } from 'react-toastify'
import { db } from '@/app/lib/firebase'
import { saveUserPhoneNumber } from '@/app/actions/actions'

export default function WhatsAppSettingsForm() {
    const { userId } = useAuth()
    const [phoneNumber, setPhoneNumber] = useState('')
    const [loading, setLoading] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    // Busca o número salvo do usuário ao carregar o componente
    useEffect(() => {
        const fetchPhoneNumber = async () => {
            if (!userId) return
            setLoading(true)
            const docRef = doc(db, 'users', userId)
            const docSnap = await getDoc(docRef)
            if (docSnap.exists() && docSnap.data()?.whatsappNumber) {
                setPhoneNumber(docSnap.data()?.whatsappNumber)
            }
            setLoading(false)
        }
        fetchPhoneNumber()
    }, [userId])

    const handleSave = async () => {
        if (!userId || !phoneNumber) {
            toast.error('Por favor, insira um número de telefone válido.')
            return
        }

        setIsSaving(true)
        const result = await saveUserPhoneNumber(userId, phoneNumber)
        if (result.success) {
            toast.success(result.message)
        } else {
            toast.error(result.error)
        }
        setIsSaving(false)
    }

    if (loading) {
        return (
            <Paper elevation={3} sx={{ p: 2, mb: 2, borderRadius: 2 }}>
                <LinearProgress />
                <Typography variant="body2" sx={{ mt: 1 }}>
                    Carregando configurações...
                </Typography>
            </Paper>
        )
    }

    return (
        <Paper elevation={3} sx={{ p: 2, mb: 2, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
                Notificações por WhatsApp
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Adicione seu número de WhatsApp para receber lembretes e dicas.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <TextField
                    fullWidth
                    label="Seu número de WhatsApp"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Ex: 5511999999999"
                    variant="outlined"
                />
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSave}
                    disabled={isSaving}
                >
                    {isSaving ? 'Salvando...' : 'Salvar'}
                </Button>
            </Box>
        </Paper>
    )
}


'use client'
//melembra/src/components/forms/ReminderForm.tsx
import React, { useState } from 'react'
import { useAuth } from '../AuthManager'
import { saveReminder } from '../../app/actions/actions'
import { toast } from 'react-toastify'
import { useRouter } from 'next/navigation'
import { usePushNotification } from '../../hooks/usePushNotification'
import { Box, TextField, IconButton, CircularProgress, Paper } from '@mui/material'
import SendIcon from '@mui/icons-material/Send'

export default function ReminderForm() {
    const { userId } = useAuth()
    const { handleSubscribe } = usePushNotification()
    const router = useRouter()
    const [reminderText, setReminderText] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSaveReminder = async () => {
        if (!userId || !reminderText.trim()) {
            toast.error('Por favor, digite um lembrete.')
            return
        }

        setLoading(true)
        // Simplesmente salvando o texto do lembrete com a data e hora atuais.
        // Você pode adicionar uma lógica mais avançada de processamento de data/hora aqui.
        const result = await saveReminder(reminderText, new Date(), userId)

        if (result.success) {
            toast.success('Lembrete salvo com sucesso!')
            try {
                await handleSubscribe()
            } catch (error) {
                console.error("Falha ao se inscrever para notificações push:", error)
            }
            router.push('/lembretes')
        } else {
            toast.error(result.error)
        }
        setLoading(false)
        setReminderText('') // Limpa o campo após o envio
    }

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSaveReminder()
        }
    }

    return (
        <Box
            sx={{
                p: 2,
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                borderRadius: 2,
            }}
        >
            <TextField
                fullWidth
                variant="standard"
                multiline
                maxRows={4}
                value={reminderText}
                onChange={(e) => setReminderText(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="O que você precisa lembrar ?"
                InputProps={{
                    disableUnderline: true,
                    sx: {
                        fontSize: '1.1rem',
                        color: 'white',
                    },
                }}
            />
            <IconButton color="primary" onClick={handleSaveReminder} disabled={loading}>
                {loading ? <CircularProgress size={24} /> : <SendIcon />}
            </IconButton>
        </Box>
    )
}

//melembra/src/app/store/store.ts
import { configureStore } from '@reduxjs/toolkit'
import reminderReducer from './slices/reminderSlice'

export const store = configureStore({
    reducer: {
        reminders: reminderReducer,
    },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

'use client'
// melembra/src/app/lembretes/page.tsx
import { Box, Skeleton } from '@mui/material'
import { useAuth } from '../../components/AuthManager'
import ReminderList from '../../components/ui/ReminderList'

export default function RemindersPage() {
    const { loading } = useAuth()

    if (loading) {
        return (
            <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 4 }}>
                <Skeleton animation="wave" width="100%" />
                <Skeleton animation="wave" width="85%" />
                <Skeleton animation="wave" width="75%" />
            </Box>
        )
    }

    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', p: 4 }}>
            <ReminderList />
        </Box>
    )
}


