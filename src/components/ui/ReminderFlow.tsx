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