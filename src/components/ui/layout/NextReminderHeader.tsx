'use client'
//appbora/src/components/ui/layout/NextReminderHeader.tsx
import React from 'react'
import { Chip, Fade, useTheme } from '@mui/material'
import AccessAlarmIcon from '@mui/icons-material/AccessAlarm'
import { useAppSelector } from '@/app/store/hooks'
import { getNextUpcomingReminder } from '@/app/actions/actions'
import { Reminder } from '@/interfaces/IReminder'
import NextReminderDialog from '../dialogs/NextReminderDialog'

export default function NextReminderHeader() {
    const theme = useTheme()
    const { user } = useAppSelector((state) => state.auth)
    const [nextReminder, setNextReminder] = React.useState<Reminder | null>(null)
    const [openDialog, setOpenDialog] = React.useState(false)

    // Busca o próximo lembrete ao montar
    React.useEffect(() => {
        const fetchNext = async () => {
            if (user?.uid) {
                const res = await getNextUpcomingReminder(user.uid)
                if (res.success && res.reminder) {
                    setNextReminder(res.reminder as Reminder)
                }
            }
        }
        fetchNext()

        // Opcional: Atualizar a cada X tempo ou criar um listener (mas fetch on mount é mais leve)
    }, [user])

    if (!nextReminder) return null

    const reminderColor = nextReminder.cor || '#6714ccff'

    return (
        <>
            <Fade in={!!nextReminder}>
                <Chip
                    icon={<AccessAlarmIcon sx={{ fontSize: '1rem !important' }} />}
                    label="Próximo lembrete"
                    size="small"
                    onClick={() => setOpenDialog(true)}
                    sx={{
                        bgcolor: 'rgba(255, 255, 255, 0.1)', // Transparente para se adaptar ao header
                        backdropFilter: 'blur(4px)',
                        border: `1px solid ${reminderColor}`,
                        color: theme.palette.text.primary,
                        maxWidth: 150, // Limita largura em telas pequenas
                        cursor: 'pointer',
                        position: 'relative',
                        overflow: 'visible',
                        '@keyframes ripple': {
                            '0%': {
                                transform: 'scale(1)',
                                opacity: 0.8,
                                boxShadow: `0 0 0 0 ${reminderColor}40` // Sombra sutil inicial
                            },
                            '100%': {
                                transform: 'scale(1.5)', // Expansão maior para visibilidade
                                opacity: 0, // Desaparece
                                boxShadow: `0 0 0 10px ${reminderColor}00` // Sombra se dissipa
                            },
                        },
                        // O pseudo-elemento que cria o anel animado
                        '&::after': {
                            content: '""',
                            position: 'absolute',
                            top: -1, // Ajuste fino para alinhar com a borda (compensar border width)
                            left: -1,
                            right: -1,
                            bottom: -1,
                            borderRadius: 'inherit', // Copia o formato arredondado (pill) do Chip
                            border: `1px solid ${reminderColor}`,
                            animation: 'ripple 2s infinite cubic-bezier(0, 0, 0.2, 1)', // Animação suave
                            zIndex: -1, // Garante que fique atrás do texto
                        },
                        '&:hover': {
                            bgcolor: 'rgba(255, 255, 255, 0.2)',
                            // Pausar animação no hover para dar feedback de "focado"
                            '&::after': {
                                animationPlayState: 'paused'
                            }
                        }
                    }}
                />
            </Fade>
            <NextReminderDialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                reminder={nextReminder}
            />
        </>
    )
}