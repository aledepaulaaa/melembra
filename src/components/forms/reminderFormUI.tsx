'use client'
// appbora/src/lib/forms/reminderFormUI.tsx
import React from 'react'
import { motion } from 'framer-motion'
import { defaultCategories, HandlerProps } from '@/interfaces/IReminder'
import DiamondIcon from '@mui/icons-material/Diamond'
import * as Handlers from './reminderFormHandlers'
import { MobileDatePicker, TimeClock } from '@mui/x-date-pickers'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import AddIcon from '@mui/icons-material/Add'
import { Box, Button, Chip, IconButton, Stack, Tooltip, Typography } from '@mui/material'
import ReminderCustomizationForm from './ReminderCustomizationForm'
import { resizeImageToStorage } from '@/app/lib/resizeImageToStorage'
import { useSnackbar } from '@/contexts/SnackbarProvider'
import { fileToBase64 } from '@/app/utils/base64'

// --- COMPONENTE DE CATEGORIAS ---
export const RenderCategorySelector = (props: HandlerProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Selecione uma categoria para começar:
            </Typography>
            <Stack direction="row" flexWrap="wrap" gap={1}>
                {defaultCategories.map((cat, index) => (
                    <Chip
                        key={cat}
                        label={cat}
                        onClick={() => Handlers.handleCategorySelect(props, cat)}
                        sx={{
                            cursor: 'pointer',
                            bgcolor: 'background.paper',
                            border: '1px solid',
                            borderColor: 'divider',
                            '&:hover': { bgcolor: 'primary.main', color: 'white', borderColor: 'primary.main' }
                        }}
                        component={motion.div}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    />
                ))}
                {/* Opção de Nova Categoria */}
                <Chip
                    icon={<AddIcon />}
                    label="Outra"
                    variant="outlined"
                    onClick={() => {
                        Handlers.addMessageToChat(props, { sender: 'user', text: 'Outra categoria' })
                        Handlers.addMessageWithTyping(props, { sender: 'bot', text: 'Qual nome você quer dar para essa categoria?' })
                        props.setShowTextInput(true)
                        // Pequeno hack: o próximo texto digitado será tratado como categoria no handleUserInput
                    }}
                    sx={{ cursor: 'pointer' }}
                />
            </Stack>
        </motion.div>
    )
}

// --- Componentes de UI  ---
export const RenderDatePicker = (props: HandlerProps) => {
    // Estado para controlar a abertura do calendário manualmente
    const [isOpen, setIsOpen] = React.useState(false)

    return (
        <motion.div transition={{ delay: 0.5 }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Stack spacing={2} justifyContent="center" alignItems="center" sx={{ py: 2 }}>
                {/* Botão Gatilho - Substitui o Input de texto */}
                <IconButton
                    onClick={() => setIsOpen(true)}
                    sx={{
                        width: 80,
                        height: 80,
                        bgcolor: 'rgba(187, 134, 252, 0.08)', // Roxo bem sutil no fundo
                        border: '1px solid rgba(187, 134, 252, 0.3)',
                        borderRadius: '50%',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            bgcolor: 'rgba(187, 134, 252, 0.2)',
                            transform: 'scale(1.05)'
                        }
                    }}
                >
                    <CalendarMonthIcon sx={{ fontSize: 40, color: '#BB86FC' }} />
                </IconButton>
                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                    Toque no ícone para selecionar a data
                </Typography>
                <MobileDatePicker
                    open={isOpen}
                    onClose={() => setIsOpen(false)}
                    onAccept={(date) => {
                        setIsOpen(false)
                        Handlers.handleDateSelect(props, date)
                    }}
                    defaultValue={props.reminder.date || new Date()}
                    slotProps={{
                        textField: {
                            sx: { display: 'none' }
                        }
                    }}
                />
            </Stack>
        </motion.div>
    )
}

export const RenderTimeClockWithConfirm = (props: HandlerProps & { minTime?: Date }) => {
    const [selectedTime, setSelectedTime] = React.useState<Date | null>(props.reminder.date || props.minTime || new Date())
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Stack direction="column" alignItems="center" justifyContent="center" spacing={1}>
                <TimeClock
                    ampm={false}
                    value={selectedTime}
                    onChange={(time) => setSelectedTime(time as Date)}
                    minTime={props.minTime}
                    sx={{ bgcolor: 'transparent', borderRadius: 2, my: 1, maxHeight: 300, overflow: "hidden" }}
                />
            </Stack>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                <Button variant="contained" onClick={() => Handlers.handleTimeSelect(props, selectedTime)}>
                    Confirmar Horário
                </Button>
            </Box>
        </motion.div>
    )
}

export const RenderRecurrenceButtons = (props: HandlerProps & { formattedTime: string }) => {
    const isFreePlan = props.subscription.plan !== 'plus' && props.subscription.plan !== 'premium'
    const recurrenceOptions = ['Diariamente', 'Semanalmente', 'Mensalmente']

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap', justifyContent: 'center', gap: 1 }}>
                <Button size="small" variant="outlined" onClick={() => Handlers.handleRecurrenceSelect(props, 'Não repetir')}>
                    Não repetir
                </Button>
                {recurrenceOptions.map((option) => (
                    <Tooltip key={option} title={isFreePlan ? "Recorrência só para Assinantes" : ""}>
                        <span>
                            <Button
                                size="small" variant="outlined" disabled={isFreePlan}
                                startIcon={isFreePlan ? <DiamondIcon fontSize="small" /> : null}
                                onClick={() => Handlers.handleRecurrenceSelect(props, option)}
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

// lógica apenas chamar os handlers corretos.
export const RenderCustomizationPrompt = (props: HandlerProps) => {
    const showCustomizationForm = () => {
        // Apenas adiciona a resposta do usuário. A renderização do formulário é controlada pelo 'step'.
        Handlers.addMessageToChat(props, { sender: 'user', text: `Sim, quero personalizar.` })
        Handlers.addMessageWithTyping(props, {
            sender: 'bot',
            text: 'Excelente! Configure os detalhes abaixo:'
        })
    }
    const skipCustomization = () => {
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

export const RenderFullCustomizationForm = (props: HandlerProps) => {
    const { reminder, setReminder } = props
    const { openSnackbar } = useSnackbar()
    const [description, setDescription] = React.useState(reminder.sobre || '')
    const [selectedColor, setSelectedColor] = React.useState(reminder.cor || '#BB86FC')
    const [imageFile, setImageFile] = React.useState<File | null>(reminder.imageFile)
    const [imagePreview, setImagePreview] = React.useState<string | null>(reminder.imagePreview)
    const [isUploading, setIsUploading] = React.useState(false)

    const handleImageSelect = async (file: File | null) => {
        if (imagePreview) URL.revokeObjectURL(imagePreview)
        if (!file) {
            setImageFile(null)
            setImagePreview(null)
            setReminder(prev => ({ ...prev, imageBase64: null }))
            return
        }
        setIsUploading(true)
        try {
            const compressedFile = await resizeImageToStorage(file)
            const previewUrl = URL.createObjectURL(compressedFile)
            const base64String = await fileToBase64(compressedFile)
            setReminder(prev => ({ ...prev, imageBase64: base64String }))
            setImageFile(compressedFile)
            setImagePreview(previewUrl)
        } catch (error) {
            console.error("Erro ao processar imagem:", error)
            openSnackbar("Não foi possível processar essa imagem.", "error")
        } finally {
            setIsUploading(false)
        }
    }

    const handleConfirm = () => {
        const updatedCustomization = { sobre: description, cor: selectedColor, imageFile: imageFile, imagePreview: imagePreview }
        setReminder(prev => ({ ...prev, ...updatedCustomization }))

        const updatedHandlerProps = { ...props, reminder: { ...props.reminder, ...updatedCustomization } }

        Handlers.addMessageToChat(props, { sender: 'user', text: `Personalização definida.` })
        Handlers.moveToConfirmation(updatedHandlerProps)
    }

    return <ReminderCustomizationForm {...{
        description,
        selectedColor,
        imageFile,
        imagePreview,
        isUploading,
        onDescriptionChange: setDescription,
        onColorSelect: setSelectedColor,
        onImageSelect: handleImageSelect,
        onConfirm: handleConfirm
    }}
    />
}

export const RenderConfirmation = (props: HandlerProps) => {
    const { reminder } = props
    let customizationDetails = ''
    if (reminder.sobre) customizationDetails += `\nDescrição: "${reminder.sobre}"`
    if (reminder.imagePreview || reminder.imageBase64) customizationDetails += `\nImagem: Anexada`

    const summaryText = `
    Lembrete: "${reminder.title}"\nQuando: ${reminder.date?.toLocaleString('pt-BR')} às 
    ${reminder.time}\nRepetir: ${reminder.recurrence}${customizationDetails}
    `

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