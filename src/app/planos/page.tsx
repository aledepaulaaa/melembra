'use client'
//bora-app/src/app/planos/page.tsx
import React from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { useAppSelector } from '@/app/store/hooks'
import CardPlanos from '@/components/ui/planos/CardPlanos'
import UpgradeAccountDialog from '@/components/ui/planos/upgradeplanos/UpgradeAccountDialog'
import { Box, Container, IconButton, Typography } from '@mui/material'
import { auth } from '../lib/firebase'

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2, // Anima um card de cada vez
        },
    },
}

const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: {
            duration: 0.5,
        },
    },
}

export default function PlanosPage() {
    const router = useRouter()
    const { user } = useAppSelector((state) => state.auth)
    const userId = user?.uid
    const currentPlan = useAppSelector((state) => state.subscription)

    const [isRedirecting, setIsRedirecting] = React.useState(false)
    const [dialogOpen, setDialogOpen] = React.useState(false)

     const planPriceIds = {
        // plus: process.env.NEXT_PUBLIC_STRIPE_PLUS_PLAN_PRICE_ID, // PRODUCTION
        plus: process.env.NEXT_PUBLIC_STRIPE_PLUS_PLAN_PRICE_ID_DEV, // DEV
        premium: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PLAN_PRICE_ID_DEV, // DEV
        // premium: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PLAN_PRICE_ID, // PRODUCTION
    }

    const handleUpgradeClick = async (planId: 'plus' | 'premium') => {
        if (auth.currentUser?.isAnonymous) {
            setDialogOpen(true)
            return // Para a execução
        }

        if (!userId) {
            router.push("/")
            return
        }

        setIsRedirecting(true)

        // Pegar o priceId correto baseado no plano clicado
        const priceId = planPriceIds[planId]

        try {
            const response = await fetch('/api/pagamentos/create-checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, priceId }),
            })

            if (!response.ok) {
                throw new Error('Falha ao criar a sessão de pagamento.')
            }

            const { url } = await response.json()
            // Redireciona o usuário para a página de checkout da Stripe
            router.push(url)
        } catch (error) {
            console.error(error)
            alert('Não foi possível iniciar o processo de pagamento. Tente novamente.')
            setIsRedirecting(false)
        }
    }

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                <IconButton onClick={() => router.back()}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h4" component="h1" fontWeight={700} sx={{ ml: 2 }}>
                    Faça um upgrade no seu plano
                </Typography>
            </Box>
            <motion.div variants={containerVariants} initial="hidden" animate="visible">
                <CardPlanos
                    cardVariants={cardVariants}
                    currentPlan={currentPlan}
                    isRedirecting={isRedirecting}
                    handleUpgradeClick={handleUpgradeClick}
                />
            </motion.div>
            <UpgradeAccountDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
        </Container>
    )
}