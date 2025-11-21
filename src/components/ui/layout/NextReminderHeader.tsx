'use client'
// appbora/src/components/ui/layout/NextReminderHeader.tsx
import React from 'react'
import { Chip, Fade } from '@mui/material'
import AccessAlarmIcon from '@mui/icons-material/AccessAlarm'
import { useAppSelector } from '@/app/store/hooks'
import { getNextUpcomingReminder } from '@/app/actions/actions'
import { Reminder } from '@/interfaces/IReminder'
import NextReminderDialog from '../dialogs/NextReminderDialog'

export default function NextReminderHeader() {
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

    return (
        <>
            <Fade in={!!nextReminder}>
                <Chip
                    icon={<AccessAlarmIcon sx={{ fontSize: '1rem !important' }} />}
                    label={`Próximo: ${nextReminder.title}`}
                    size="small"
                    onClick={() => setOpenDialog(true)}
                    sx={{
                        bgcolor: 'rgba(255, 255, 255, 0.1)', // Transparente para se adaptar ao header
                        backdropFilter: 'blur(4px)',
                        border: `1px solid ${nextReminder.cor || '#BB86FC'}`,
                        color: 'inherit',
                        maxWidth: 150, // Limita largura em telas pequenas
                        cursor: 'pointer',
                        '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.2)' }
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