'use client'
//appbora/src/components/ui/planos/PaymentStatusHandler.tsx
import React from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import {
    Backdrop,
    CircularProgress,
    Typography,
    Paper,
    LinearProgress,
    Box
} from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { useAppSelector } from '@/app/store/hooks'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '@/app/lib/firebase'
import { ISubscription } from '@/interfaces/IBoraPayment'

export default function PaymentStatusHandler() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const pathname = usePathname()

    const paymentStatus = searchParams.get('payment')
    const { user } = useAppSelector((state) => state.auth)

    const [isValidating, setIsValidating] = React.useState(false)
    const [isSuccess, setIsSuccess] = React.useState(false)

    // Estado da barra de progresso (0 a 100)
    const [progress, setProgress] = React.useState(100)

    // Definição dos tempos
    const VALIDATION_TIMEOUT = 15000 // 15s para tentar validar
    const SUCCESS_CLOSE_DELAY = 2500 // 2.5s para fechar após sucesso

    // 1. Efeito Principal: Lógica do Firestore e Estados
    React.useEffect(() => {
        if (paymentStatus === 'success' && user?.uid) {
            setIsValidating(true)

            const unsub = onSnapshot(doc(db, 'subscriptions', user.uid), (docSnap) => {
                if (docSnap.exists()) {
                    const subData = docSnap.data() as ISubscription

                    if (subData.status === 'active' || subData.status === 'trialing') {
                        // Ao detectar sucesso, trocamos os flags.
                        // Isso vai disparar o useEffect da animação novamente.
                        setIsValidating(false)
                        setIsSuccess(true)
                    }
                }
            })

            return () => unsub()
        }
    }, [paymentStatus, user])

    // 2. Efeito da Animação (Timer Unificado)
    // Este efeito roda quando começa a validar OU quando muda para sucesso
    React.useEffect(() => {
        let duration = 0

        if (isValidating) {
            duration = VALIDATION_TIMEOUT
        } else if (isSuccess) {
            duration = SUCCESS_CLOSE_DELAY
        } else {
            return // Se não está nem validando nem com sucesso, não faz nada
        }

        // Reseta a barra para 100% sempre que o estado muda (ex: validando -> sucesso)
        setProgress(100)

        const startTime = Date.now()
        const timerInterval = setInterval(() => {
            const elapsed = Date.now() - startTime
            const remaining = 100 - (elapsed / duration) * 100

            if (remaining <= 0) {
                setProgress(0)
                clearInterval(timerInterval)

                // Ações quando o tempo acaba:
                if (isSuccess) {
                    // Se acabou o tempo de sucesso, fecha o modal
                    router.replace(pathname)
                } else if (isValidating) {
                    // Se acabou o tempo de validação (timeout), fecha também
                    setIsValidating(false)
                    router.replace(pathname)
                }
            } else {
                setProgress(remaining)
            }
        }, 50) // 50ms para ficar bem fluido

        return () => clearInterval(timerInterval)
    }, [isValidating, isSuccess, router, pathname])

    if (!isValidating && !isSuccess) return null

    return (
        <Backdrop
            sx={{ color: '#fff', zIndex: 9999 }}
            open={isValidating || isSuccess}
        >
            <Paper
                elevation={4}
                sx={{
                    p: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2,
                    borderRadius: 4,
                    minWidth: 300,
                    maxWidth: '90vw'
                }}
            >
                {isSuccess ? (
                    <>
                        <CheckCircleIcon color="success" sx={{ fontSize: 60 }} />
                        <Typography variant="h6" fontWeight="bold" color="success.main">
                            Assinatura Confirmada!
                        </Typography>
                        <Typography variant="body2" color="text.secondary" align="center">
                            Seus recursos foram liberados com sucesso.
                        </Typography>
                        {/* Barra de Progresso no Sucesso (Decaindo em 2.5s) */}
                        <Box sx={{ width: '100%', mt: 1 }}>
                            <LinearProgress
                                variant="determinate"
                                value={progress}
                                color="success" // Cor verde para sucesso
                                sx={{
                                    height: 6,
                                    borderRadius: 5,
                                    backgroundColor: (theme) => theme.palette.success.light,
                                    '& .MuiLinearProgress-bar': {
                                        borderRadius: 5,
                                        transition: 'transform 0.05s linear'
                                    }
                                }}
                            />
                            <Typography variant="caption" color="text.disabled" sx={{ display: 'block', textAlign: 'center', mt: 1 }}>
                                Fechando em {Math.ceil((progress / 100) * (SUCCESS_CLOSE_DELAY / 1000))}s...
                            </Typography>
                        </Box>
                    </>
                ) : (
                    <>
                        <CircularProgress size={40} color="primary" />
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h6" fontWeight="bold">
                                Validando Pagamento...
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                Sincronizando com a operadora...
                            </Typography>
                        </Box>
                        {/* Barra de Progresso na Validação (Decaindo em 15s) */}
                        <Box sx={{ width: '100%', mt: 1 }}>
                            <LinearProgress
                                variant="determinate"
                                value={progress}
                                sx={{
                                    height: 6,
                                    borderRadius: 5,
                                    backgroundColor: (theme) => theme.palette.grey[200],
                                    '& .MuiLinearProgress-bar': {
                                        borderRadius: 5,
                                        transition: 'transform 0.05s linear'
                                    }
                                }}
                            />
                        </Box>
                    </>
                )}
            </Paper>
        </Backdrop>
    )
}