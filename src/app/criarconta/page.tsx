'use client'
// appbora/src/app/criar-conta/page.tsx
import CriarConta from "@/components/ui/profile/CriarConta"
import NextLink from 'next/link'
import { Box, Button, Divider, Typography } from "@mui/material"

export default function CriarContaPage() {
    return (
        <Box>
            <Typography variant="h6" fontWeight={700} gutterBottom>Criar Conta</Typography>
            <CriarConta />
            <Divider sx={{ my: 2, fontWeight: 700 }}>Já tem conta?</Divider>
            <Button component={NextLink} href="/login" variant="outlined" fullWidth>
                Fazer Login
            </Button>
        </Box>
    )
}