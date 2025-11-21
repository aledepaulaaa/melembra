'use client'
//appbora/src/components/ui/profile/ImagemPerfilConta.tsx
import React from 'react'
import { Box, Avatar, IconButton, LinearProgress } from '@mui/material'
import { motion } from 'framer-motion'
import CameraAltIcon from '@mui/icons-material/CameraAlt'
import { resizeImageToStorage } from '@/app/lib/resizeImageToStorage' // Reaproveitando seu utilitário
import { useSnackbar } from '@/contexts/SnackbarProvider'

interface ImagemPerfilContaProps {
    currentImage: string | null
    onImageSelected: (file: File, preview: string) => void
    isUploading: boolean
}

export default function ImagemPerfilConta({ currentImage, onImageSelected, isUploading }: ImagemPerfilContaProps) {
    const { openSnackbar } = useSnackbar()
    const fileInputRef = React.useRef<HTMLInputElement>(null)
    const [isProcessing, setIsProcessing] = React.useState(false)

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validação simples
        if (!file.type.startsWith('image/')) {
            openSnackbar('Por favor, selecione uma imagem válida.', 'error')
            return
        }

        setIsProcessing(true)
        try {
            // Redimensiona para economizar storage (opcional, mas recomendado)
            const compressedFile = await resizeImageToStorage(file)
            const previewUrl = URL.createObjectURL(compressedFile)
            onImageSelected(compressedFile, previewUrl)
        } catch (error) {
            console.error(error)
            openSnackbar('Erro ao processar imagem.', 'error')
        } finally {
            setIsProcessing(false)
        }
    }

    const isLoading = isProcessing || isUploading

    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4, position: 'relative' }}>
            <input
                type="file"
                hidden
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileChange}
                disabled={isLoading}
            />

            {/* Animação de Borda Colorida e Vidro */}
            <motion.div
                animate={{
                    boxShadow: [
                        "0px 0px 0px 0px rgba(187, 134, 252, 0.15)",
                        "0px 0px 20px 2px rgba(187, 134, 252, 0.63)",
                        "0px 0px 0px 0px rgba(151, 78, 241, 0)"
                    ]
                }}
                transition={{ duration: 3, repeat: Infinity }}
                style={{
                    borderRadius: '50%',
                    padding: '6px',
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0))',
                    backdropFilter: 'blur(10px)',
                    border: '2px solid rgba(255, 255, 255, 0.18)',
                    position: 'relative',
                    // overflow: 'hidden'
                }}
            >
                <Avatar
                    src={currentImage || undefined}
                    sx={{
                        width: 120,
                        height: 120,
                        border: '2px solid rgba(255,255,255,0.1)',
                        // Se estiver carregando, deixa a imagem um pouco mais escura
                        filter: isLoading ? 'brightness(0.5)' : 'none',
                        transition: 'filter 0.3s ease'
                    }}
                />
                {isLoading && (
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 0, left: 0, right: 0, bottom: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: 'rgba(0,0,0,0.3)', // Fundo semi-transparente
                            borderRadius: '50%',
                            zIndex: 10
                        }}
                    >
                        <LinearProgress color="secondary" sx={{ width: 40, height: 4, borderRadius: 2 }} />
                    </Box>
                )}
                {/* Botão Flutuante de Câmera (some durante o loading) */}
                {!isLoading && (
                    <IconButton
                        size="small"
                        onClick={() => fileInputRef.current?.click()}
                        sx={{
                            position: 'absolute',
                            bottom: 0,
                            right: 0,
                            bgcolor: 'primary.main',
                            border: '2px solid background.paper',
                            '&:hover': { bgcolor: 'primary.dark' },
                            boxShadow: 3,
                            zIndex: 20
                        }}
                    >
                        <CameraAltIcon fontSize="small" sx={{ color: '#fff' }} />
                    </IconButton>
                )}
            </motion.div>
        </Box>
    )
}