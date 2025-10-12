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
