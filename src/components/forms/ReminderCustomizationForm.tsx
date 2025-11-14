//bora-app/src/components/forms/ReminderCustomizationForm.tsx
import React from 'react'
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera'
import CancelIcon from '@mui/icons-material/Cancel'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { Box, Button, TextField, IconButton, Stack, Typography, LinearProgress } from '@mui/material'
import { colorPalette, ReminderCustomizationFormProps } from '@/interfaces/IReminder'

export default function ReminderCustomizationForm({
    description,
    selectedColor,
    imagePreview,
    isUploading,
    onDescriptionChange,
    onColorSelect,
    onImageSelect,
    onConfirm,
}: ReminderCustomizationFormProps) {
    const fileInputRef = React.useRef<HTMLInputElement>(null)
    const charLimit = 200

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0]
            onImageSelect(file)
        }
    }

    return (
        <Stack spacing={3} sx={{ mt: 2 }}>
            {/* Seletor de Imagem */}
            <Box>
                <Typography variant="subtitle2" gutterBottom>Anexar imagem (Opcional)</Typography>
                <input
                    type="file"
                    accept="image/*"
                    hidden
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                />
                {!imagePreview && (
                    <Button
                        startIcon={<PhotoCameraIcon />}
                        variant="outlined"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                    >
                        Escolher Imagem
                    </Button>
                )}
                {isUploading && <LinearProgress sx={{ my: 1 }} />}
                {imagePreview && (
                    <Box sx={{ position: 'relative', width: '120px', height: '120px' }}>
                        <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                        <IconButton
                            size="small"
                            onClick={() => onImageSelect(null)}
                            sx={{ position: 'absolute', top: 0, right: 0, bgcolor: 'rgba(0,0,0,0.6)', color: 'white' }}
                        >
                            <CancelIcon fontSize="small" />
                        </IconButton>
                    </Box>
                )}
            </Box>
            {/* Seletor de Cor */}
            <Box>
                <Typography variant="subtitle2" gutterBottom>Cor do Lembrete</Typography>
                <Stack direction="row" spacing={1}>
                    {colorPalette.map((color) => (
                        <Box
                            key={color}
                            onClick={() => onColorSelect(color)}
                            sx={{
                                position: 'relative', // Necessário para posicionar o ícone
                                width: 32,
                                height: 32,
                                borderRadius: '50%',
                                backgroundColor: color,
                                cursor: 'pointer',
                                // Borda mais sutil, o ícone será o indicador principal
                                border: `2px solid ${color === '#FFFFFF' ? '#ccc' : 'transparent'}`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'transform 0.2s',
                                '&:hover': { transform: 'scale(1.1)' }
                            }}
                        >
                            {selectedColor === color && (
                                <CheckCircleIcon
                                    color="success"
                                    sx={{
                                        color: color === '#FFFFFF' || color === '#BB86FC' ? 'black' : 'white',
                                        fontSize: 20
                                    }}
                                />
                            )}
                        </Box>
                    ))}
                </Stack>
            </Box>
            {/* Descrição */}
            <Box>
                <TextField
                    fullWidth
                    label="Descrição (Opcional)"
                    multiline
                    rows={3}
                    value={description}
                    onChange={(e) => onDescriptionChange(e.target.value)}
                    slotProps={{ htmlInput: { maxLength: charLimit }}}
                    helperText={`${charLimit - description.length} caracteres restantes`}
                />
            </Box>
            <Button variant="contained" onClick={onConfirm}>Confirmar Personalização</Button>
        </Stack>
    )
}