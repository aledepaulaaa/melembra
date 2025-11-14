'use client'
//bora-app/src/components/ui/ReminderFlow.tsx
import ReminderForm from '@/components/forms/ReminderForm'
import { Container, Box } from '@mui/material'
import { ReminderFormProps } from '@/interfaces/IReminder'

export default function ReminderFlow({ onChatStart }: ReminderFormProps) {
    return (
       <Container 
            maxWidth="md" 
            sx={{ 
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                width: '100%',
                height: 'auto',
                maxHeight: '25vh',
                display: 'flex',
                justifyContent: 'center', // Centraliza horizontalmente
                alignItems: 'flex-end', // Alinha na parte inferior
                p: { xs: 0, md: 2 },
                mx: 'auto',
                zIndex: 1200, // Garante que fique acima de outros elementos
            }}
        >
            <Box 
                sx={{
                    height: 'calc(100vh - 64px)',
                    width: '100%',
                    maxWidth: { xs: '100%', md: '800px' }, // Limita a largura em telas maiores
                    mx: 'auto', // Margem automática horizontal
                }}
            >
                <ReminderForm onChatStart={onChatStart} />
            </Box>
        </Container>
    )
}