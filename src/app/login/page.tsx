'use client'
//appbora/src/app/login/page.tsx
import UserLoginProfile from "@/components/ui/profile/LogarNaConta"
import { Box, Button, Divider } from "@mui/material"
import NextLink from 'next/link'

export default function LoginPage() {
    return (
        <Box>
            <UserLoginProfile />
            <Divider sx={{ my: 2 }}>Não tem conta?</Divider>
            <Button component={NextLink} href="/criarconta" variant="outlined" fullWidth>
                Criar uma Conta
            </Button>
        </Box>
    )
}