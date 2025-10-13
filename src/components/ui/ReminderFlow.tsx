'use client'
//melembra/src/components/ui/ReminderFlow.tsx
import ReminderForm from '@/components/forms/ReminderForm'
import { Container } from '@mui/material'
import { ReminderFormProps } from '@/interfaces/IReminderForm'

export default function ReminderFlow({ onChatStart }: ReminderFormProps) {
    return (
        <Container maxWidth="md" sx={{ mb: 4 }}>
            <ReminderForm onChatStart={onChatStart} />
        </Container>
    )
}