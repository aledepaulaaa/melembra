'use client'
//appbora/src/components/ui/planos/PaymentStatusHandler.tsx
import React from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { Backdrop, CircularProgress, Typography, Paper } from '@mui/material'
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

    React.useEffect(() => {
        // Só roda se tiver o parametro success e o usuário logado
        if (paymentStatus === 'success' && user?.uid) {
            setIsValidating(true)

            // Cria um listener em tempo real para detectar a mudança no documento de assinatura
            const unsub = onSnapshot(doc(db, 'subscriptions', user.uid), (docSnap) => {
                if (docSnap.exists()) {
                    const subData = docSnap.data() as ISubscription
                    
                    // Se o status for ativo, atualizamos o Redux e liberamos
                    if (subData.status === 'active' || subData.status === 'trialing') {
                        // Atualiza o Redux Globalmente
                        // Você precisará garantir que seu slice aceita esse dispatch ou confiar no hook useSubscription existente
                        // Se o useSubscription já estiver rodando no layout, ele vai pegar essa atualização automaticamente pelo onSnapshot dele.
                        
                        setIsSuccess(true)
                        setIsValidating(false)
                        
                        // Remove o parametro da URL após 2 segundos e fecha
                        setTimeout(() => {
                            router.replace(pathname) // Limpa URL
                        }, 2500)
                    }
                }
            })

            // Timeout de segurança: se em 10s não ativar, libera para não travar o usuário
            const timeout = setTimeout(() => {
                if (isValidating) {
                    setIsValidating(false)
                    router.replace(pathname)
                }
            }, 15000)

            return () => {
                unsub()
                clearTimeout(timeout)
            }
        }
    }, [paymentStatus, user, router, pathname])

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
                    minWidth: 300
                }}
            >
                {isSuccess ? (
                    <>
                        <CheckCircleIcon color="success" sx={{ fontSize: 60 }} />
                        <Typography variant="h6" fontWeight="bold" color="success.main">
                            Assinatura Confirmada!
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Seus recursos foram liberados.
                        </Typography>
                    </>
                ) : (
                    <>
                        <CircularProgress color="primary" />
                        <Typography variant="h6" fontWeight="bold">
                            Validando Pagamento...
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Estamos sincronizando com a Stripe.
                        </Typography>
                    </>
                )}
            </Paper>
        </Backdrop>
    )
}