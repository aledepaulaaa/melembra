//bora-app/src/components/forms/ReminderCustomizationForm.tsx
import React from 'react'
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera'
import CancelIcon from '@mui/icons-material/Cancel'
import { HexColorPicker } from 'react-colorful'
import { Box, Button, TextField, IconButton, Stack, Typography, LinearProgress, Popover } from '@mui/material'
import { ReminderCustomizationFormProps } from '@/interfaces/IReminder'

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

    const [pickerColor, setPickerColor] = React.useState<string>(selectedColor)
    const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null)

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0]
            onImageSelect(file)
        }
    }

    // --- FUNÇÕES PARA CONTROLAR O POPOVER ---
    const handleColorClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget) // Abre o popover no elemento clicado
    }

    const handleColorClose = () => {
        setAnchorEl(null) // Fecha o popover
    }

    // Define se o popover está aberto
    const isColorPickerOpen = Boolean(anchorEl)

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
                    <Box
                        onClick={handleColorClick} // <-- Abre o popover
                        title="Clique para escolher uma cor"
                        sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            // O background é a cor JÁ CONFIRMADA
                            backgroundColor: selectedColor,
                            cursor: 'pointer',
                            border: '2px solid rgba(0,0,0,0.2)',
                        }}
                    />
                    {/* Exibe o código hexadecimal da cor confirmada */}
                    <Typography variant="body2" color="text.secondary">{selectedColor}</Typography>
                </Stack>
                {/* O POPOVER COM O SELETOR DE CORES */}
                <Popover
                    open={isColorPickerOpen}
                    anchorEl={anchorEl}
                    onClose={handleColorClose}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                    }}
                >
                    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <HexColorPicker color={pickerColor} onChange={setPickerColor} />
                        <Button
                            variant="contained"
                            size="small"
                            onClick={() => {
                                onColorSelect(pickerColor) // Confirma a cor
                                handleColorClose() // Fecha o popover
                            }}
                        >
                            Selecionar
                        </Button>
                    </Box>
                </Popover>
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
                    slotProps={{ htmlInput: { maxLength: charLimit } }}
                    helperText={`${charLimit - description.length} caracteres restantes`}
                />
            </Box>
            <Button variant="contained" onClick={onConfirm}>Confirmar Personalização</Button>
        </Stack>
    )
}