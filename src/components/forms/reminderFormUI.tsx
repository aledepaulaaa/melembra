//bora-app/src/lib/forms/reminderFormUI.tsx
import React from 'react'
import { motion } from 'framer-motion'
import { HandlerProps } from '@/interfaces/IReminder'
import DiamondIcon from '@mui/icons-material/Diamond'
import * as Handlers from './reminderFormHandlers'
import { MobileDatePicker, TimeClock } from '@mui/x-date-pickers'
import { Box, Button, Stack, Tooltip, Typography } from '@mui/material'
import ReminderCustomizationForm from './ReminderCustomizationForm'
import { resizeImageToStorage } from '@/app/lib/resizeImageToStorage'
import { useSnackbar } from '@/contexts/SnackbarProvider'

// --- Funções que retornam os componentes JSX ---
export const RenderTimeClockWithConfirm = ({ handlerProps, minTime }: { handlerProps: HandlerProps, minTime?: Date }) => {
    // Estado local para guardar a hora enquanto o usuário a ajusta
    const [selectedTime, setSelectedTime] = React.useState<Date | null>(handlerProps.reminder.date || minTime || new Date())

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Stack direction="column" alignItems="center" justifyContent="center" spacing={1}>
                <TimeClock
                    ampm={false}
                    value={selectedTime}
                    onChange={(time) => setSelectedTime(time as Date)}
                    minTime={minTime}
                    sx={{
                        bgcolor: 'transparent',
                        borderRadius: 2,
                        my: 1,
                        maxHeight: 300,
                        overflow: "hidden"
                    }}
                />
            </Stack>
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
    <motion.div
        transition={{ delay: 0.5 }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
    >
        <Stack spacing={1} justifyContent="center" alignItems="center">
            <MobileDatePicker
                onAccept={(date) => Handlers.handleDateSelect(props, date)}
                sx={{
                    bgcolor: 'background.paper',
                    borderRadius: 2,
                    maxHeight: 380,
                    overflowY: 'auto'
                }}
            />
        </Stack>
    </motion.div>
)

export const renderTimeClock = (props: HandlerProps, minTime?: Date) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
    >
        <Stack spacing={1}>
            <TimeClock
                ampm={false}
                onChange={(time) => Handlers.handleTimeSelect(props, time as Date)}
                minTime={minTime}
                sx={{ bgcolor: 'background.paper', borderRadius: 2, maxHeight: 300 }}
            />
        </Stack>
    </motion.div>
)

export const renderRecurrenceButtons = (props: HandlerProps, formattedTime: string) => {
    const isFreePlan = props.subscription.plan !== 'plus' && props.subscription.plan !== 'premium'
    const recurrenceOptions = ['Diariamente', 'Semanalmente', 'Mensalmente']

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap', justifyContent: 'center', gap: 1 }}>
                {/* Botão "Não repetir" - Sempre disponível */}
                <Button size="small" variant="outlined" onClick={() => Handlers.handleRecurrenceSelect(props, 'Não repetir', formattedTime)}>
                    Não repetir
                </Button>
                {/* Mapeia as opções de recorrência premium */}
                {recurrenceOptions.map((option) => (
                    <Tooltip key={option} title={isFreePlan ? "Recorrência só para Assinantes" : ""}>
                        {/* O <span> é essencial para o Tooltip funcionar em botões desabilitados */}
                        <span>
                            <Button
                                size="small"
                                variant="outlined"
                                disabled={isFreePlan}
                                startIcon={isFreePlan ? <DiamondIcon fontSize="small" /> : null}
                                onClick={() => Handlers.handleRecurrenceSelect(props, option, formattedTime)}
                            >
                                {option}
                            </Button>
                        </span>
                    </Tooltip>
                ))}
            </Stack>
        </motion.div>
    )
}

export const renderCustomizationPrompt = (props: HandlerProps) => {

    // Esta função será chamada quando o usuário clicar em "Personalizar"
    const showCustomizationForm = () => {
        // Limpa a UI atual
        props.setChatHistory(prev => prev.filter(msg => !msg.component))
        // Adiciona a resposta do usuário
        Handlers.addMessageToChat(props, { sender: 'user', text: `Sim, quero personalizar.` })
        // Exibe o formulário completo de personalização
        Handlers.addMessageWithTyping(props, {
            sender: 'bot',
            text: 'Excelente! Configure os detalhes abaixo:',
            component: <RenderFullCustomizationForm {...props} /> // Componente abaixo
        })
    }

    // Se o usuário pular, vai direto para a confirmação
    const skipCustomization = () => {
        props.setChatHistory(prev => prev.filter(msg => !msg.component))
        Handlers.addMessageToChat(props, { sender: 'user', text: `Não, obrigado.` })
        Handlers.moveToConfirmation(props)
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                <Button size="small" variant="contained" onClick={showCustomizationForm}>
                    Personalizar
                </Button>
                <Button size="small" variant="text" onClick={skipCustomization}>
                    Pular
                </Button>
            </Stack>
        </motion.div>
    )
}

// --- NOVO COMPONENTE 2: O Formulário de Personalização ---
// Este é o componente "wrapper" que renderiza nosso PremiumCustomizationForm
const RenderFullCustomizationForm = (props: HandlerProps) => {
    const { reminder, setReminder } = props
    const { openSnackbar } = useSnackbar()
    const [isUploading, setIsUploading] = React.useState(false) // Controle de upload local

    const handleImageSelect = async (file: File | null) => {
        // Limpa a preview antiga se existir
        if (reminder.imagePreview) {
            URL.revokeObjectURL(reminder.imagePreview)
        }

        // Se o arquivo for nulo (removido pelo usuário), limpa o estado
        if (!file) {
            setReminder(prev => ({ ...prev, imageFile: null, imagePreview: null }))
            return
        }

        setIsUploading(true) // <<--- 1. INICIA O FEEDBACK VISUAL

        try {
            // 2. Comprime a imagem imediatamente após a seleção
            const compressedFile = await resizeImageToStorage(file)

            const previewUrl = URL.createObjectURL(compressedFile)

            // 3. Atualiza o estado com o ARQUIVO COMPRIMIDO e o preview
            setReminder(prev => ({ ...prev, imageFile: compressedFile, imagePreview: previewUrl }))

        } catch (error) {
            // 4. Trata possíveis erros de compressão
            console.error("Erro ao processar imagem:", error)
            openSnackbar("Não foi possível processar essa imagem. Tente outra.", "error")
            // Limpa o estado em caso de erro
            setReminder(prev => ({ ...prev, imageFile: null, imagePreview: null }))
        } finally {
            setIsUploading(false) // <<--- 5. PARA O FEEDBACK VISUAL (no sucesso ou falha)
        }
    }

    // O que acontece quando o usuário confirma a personalização
    const handleConfirm = () => {
        // Apenas esconde o formulário e avança
        props.setChatHistory(prev => prev.filter(msg => !msg.component))
        Handlers.addMessageToChat(props, { sender: 'user', text: `Personalização definida.` })
        Handlers.moveToConfirmation(props)
    }

    return (
        <ReminderCustomizationForm
            description={reminder.sobre || ''}
            selectedColor={reminder.cor || '#BB86FC'}
            imageFile={reminder.imageFile}
            imagePreview={reminder.imagePreview}
            isUploading={isUploading}
            onDescriptionChange={(text) => setReminder(prev => ({ ...prev, sobre: text }))}
            onColorSelect={(color) => setReminder(prev => ({ ...prev, cor: color }))}
            onImageSelect={handleImageSelect}
            onConfirm={handleConfirm}
        />
    )
}

export const renderConfirmation = (props: HandlerProps) => {
    const { reminder } = props

    // Adiciona os detalhes de personalização se existirem
    let customizationDetails = ''
    if (reminder.sobre) {
        customizationDetails += `\nDescrição: "${reminder.sobre}"`
    }
    if (reminder.imageFile) {
        customizationDetails += `\nImagem: Anexada`
    }

    const summaryText = `Lembrete: "${reminder.title}"\nQuando: ${reminder.date?.toLocaleDateString('pt-BR')} às ${reminder.time}\nRepetir: ${reminder.recurrence}${customizationDetails}`

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'flex-start' }}>
                {reminder.imagePreview && (
                    <img src={reminder.imagePreview} alt="Preview" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px' }} />
                )}
                <Typography sx={{ whiteSpace: 'pre-wrap', mt: 1, mb: 2 }}>{summaryText}</Typography>
                <Stack direction="row" spacing={1}>
                    <Button size="small" variant="contained" color="primary" onClick={() => Handlers.handleConfirmSave(props)}>Confirmar e Salvar</Button>
                    <Button size="small" variant="text" onClick={() => Handlers.handleCancel(props)}>Cancelar</Button>
                </Stack>
            </Box>
        </motion.div>
    )
}