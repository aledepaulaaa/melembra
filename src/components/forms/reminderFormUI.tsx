// melembra/src/lib/forms/reminderFormUI.tsx
import { motion } from 'framer-motion'
import { Box, Button, Stack, Typography } from '@mui/material'
import { StaticDatePicker, TimeClock } from '@mui/x-date-pickers'
import { HandlerProps } from '@/interfaces/IReminderForm'
import * as Handlers from './reminderFormHandlers'
import React from 'react'

// --- Funções que retornam os componentes JSX ---
export const RenderTimeClockWithConfirm = ({ handlerProps, minTime }: { handlerProps: HandlerProps, minTime?: Date }) => {
    // Estado local para guardar a hora enquanto o usuário a ajusta
    const [selectedTime, setSelectedTime] = React.useState<Date | null>(handlerProps.reminder.date || minTime || new Date())

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <TimeClock
                ampm={false}
                value={selectedTime}
                onChange={(time) => setSelectedTime(time as Date)}
                minTime={minTime}
                sx={{ bgcolor: 'background.paper', borderRadius: 2, my: 1, maxHeight: 300 }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                <Button
                    variant="contained"
                    onClick={() => Handlers.handleTimeSelect(handlerProps, selectedTime)}
                >
                    Confirmar Horário
                </Button>
            </Box>
        </motion.div>
    )
}

export const renderDatePicker = (props: HandlerProps) => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <StaticDatePicker
            disablePast
            onAccept={(date) => Handlers.handleDateSelect(props, date)}
            sx={{ bgcolor: 'background.paper', borderRadius: 2, my: 1 }}
        />
    </motion.div>
)

export const renderTimeClock = (props: HandlerProps, minTime?: Date) => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <TimeClock
            ampm={false}
            onChange={(time) => Handlers.handleTimeSelect(props, time as Date)}
            minTime={minTime}
            sx={{ bgcolor: 'background.paper', borderRadius: 2, my: 1, maxHeight: 300 }}
        />
    </motion.div>
)

export const renderRecurrenceButtons = (props: HandlerProps, formattedTime: string) => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
            {/* A CORREÇÃO ESTÁ AQUI: Passamos o `formattedTime` para o handler */}
            <Button size="small" variant="outlined" onClick={() => Handlers.handleRecurrenceSelect(props, 'Não repetir', formattedTime)}>Não repetir</Button>
            <Button size="small" variant="outlined" onClick={() => Handlers.handleRecurrenceSelect(props, 'Diariamente', formattedTime)}>Diariamente</Button>
            <Button size="small" variant="outlined" onClick={() => Handlers.handleRecurrenceSelect(props, 'Semanalmente', formattedTime)}>Semanalmente</Button>
            <Button size="small" variant="outlined" onClick={() => Handlers.handleRecurrenceSelect(props, 'Mensalmente', formattedTime)}>Mensalmente</Button>
            <Button size="small" variant="outlined" onClick={() => Handlers.handleRecurrenceSelect(props, 'Anualmente', formattedTime)}>Anualmente</Button>
        </Stack>
    </motion.div>
)

export const renderConfirmation = (props: HandlerProps) => {
    const { reminder } = props
    const summaryText = `Lembrete: "${reminder.title}"\nQuando: ${reminder.date?.toLocaleDateString('pt-BR')} às ${reminder.time}\nRepetir: ${reminder.recurrence}`

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Typography sx={{ whiteSpace: 'pre-wrap', mt: 1, mb: 2 }}>{summaryText}</Typography>
            <Stack direction="row" spacing={1}>
                <Button size="small" variant="contained" color="primary" onClick={() => Handlers.handleConfirmSave(props)}>Confirmar e Salvar</Button>
                <Button size="small" variant="text" onClick={() => Handlers.handleCancel(props)}>Cancelar</Button>
            </Stack>
        </motion.div>
    )
}