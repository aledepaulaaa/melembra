'use client'
// melemebra/src/components/ui/profile/UserProfile.tsx (ATUALIZADO E MOVENDO PARA NOVA PASTA)
import React from 'react'
import { auth } from '@/app/lib/firebase'
import { signOut } from 'firebase/auth'
import { useAppSelector } from '@/app/store/hooks'
import UserCreateProfile from './UserCreateProfile'
import UserEditProfile from './UserEditProfile'
import UserLoginProfile from './UserLoginProfile'
import { Box, Button, Paper, Skeleton, Typography, Divider, Stack } from '@mui/material'

export default function UserProfile() {
    const { user, status } = useAppSelector((state) => state.auth)
    const [view, setView] = React.useState<'create' | 'login'>('create')

    if (status === 'loading') {
        return <Skeleton variant="rounded" width="100%" height={300} />
    }

    return (
        <Paper elevation={0} sx={{ p: 3, borderRadius: 2, mt: 2, width: '100%', boxShadow: 0 }}>
            {user ? (
                // --- VISÃO LOGADO ---
                <Stack spacing={2}>
                    <Typography variant="h6" fontWeight={700} gutterBottom>Seus Dados</Typography>
                    <UserEditProfile />
                    <Button variant="outlined" color="error" onClick={() => signOut(auth)} fullWidth>
                        Desconectar
                    </Button>
                </Stack>
            ) : (
                // --- VISÃO DESLOGADO ---
                <Box>
                    {view === 'create' ? (
                        <>
                            <Typography variant="h6" fontWeight={700} gutterBottom>Criar Conta</Typography>
                            <UserCreateProfile />
                            <Divider sx={{ my: 2 }}>Já tem conta?</Divider>
                            <Button variant="outlined" onClick={() => setView('login')} fullWidth>
                                Fazer Login
                            </Button>
                        </>
                    ) : (
                        <>
                            <Typography variant="h6" fontWeight={700} gutterBottom>Fazer Login</Typography>
                            <UserLoginProfile />
                            <Divider sx={{ my: 2 }}>Não tem conta?</Divider>
                            <Button variant="outlined" onClick={() => setView('create')} fullWidth>
                                Criar uma Conta
                            </Button>
                        </>
                    )}
                </Box>
            )}
        </Paper>
    )
}