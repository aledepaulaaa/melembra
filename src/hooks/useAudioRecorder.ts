//appbora/src/hooks/useAudioRecorder.ts
import React from 'react'

interface UseAudioRecorderReturn {
    isRecording: boolean
    timeLeft: number
    audioBlob: Blob | null
    hasPermissionError: boolean
    startRecording: () => Promise<void>
    stopRecording: () => void
    resetAudio: () => void
}

const MAX_DURATION = 20 // Tempo limite de gravação em segundos

export default function useAudioRecorder(): UseAudioRecorderReturn {
    const [isRecording, setIsRecording] = React.useState(false)
    const [timeLeft, setTimeLeft] = React.useState(MAX_DURATION)
    const [audioBlob, setAudioBlob] = React.useState<Blob | null>(null)
    const [hasPermissionError, setHasPermissionError] = React.useState(false)

    const mediaRecorderRef = React.useRef<MediaRecorder | null>(null)
    const streamRef = React.useRef<MediaStream | null>(null)
    const chunksRef = React.useRef<Blob[]>([])
    const timerIntervalRef = React.useRef<NodeJS.Timeout | null>(null)

    const stopRecording = React.useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop()
        }

        // Para o stream do microfone (remove a bolinha vermelha da aba do navegador)
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop())
            streamRef.current = null
        }

        if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current)
            timerIntervalRef.current = null
        }

        setIsRecording(false)
        setTimeLeft(MAX_DURATION)
    }, [])

    const startRecording = React.useCallback(async () => {
        setHasPermissionError(false)
        setAudioBlob(null)
        chunksRef.current = []

        try {
            // Configuração otimizada para IA (evita cortes de voz)
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: false, // Desliga cancelamento de eco (ajuda a não cortar a voz)
                    noiseSuppression: false, // Desliga supressão de ruído (pega mais som ambiente, mas garante a voz)
                    autoGainControl: true,   // Tenta aumentar o volume automaticamente
                    channelCount: 1          // Mono é suficiente e mais leve
                }
            })
            streamRef.current = stream


            // Tenta usar codecs modernos e robustos
            // Prioridade: WebM Opus (padrão Android/PC) -> MP4 (Safari novo) -> Padrão do navegador
            let options: MediaRecorderOptions = {}
            if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
                options = { mimeType: 'audio/webm;codecs=opus' }
            } else if (MediaRecorder.isTypeSupported('audio/webm')) {
                options = { mimeType: 'audio/webm' }
            } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
                // Fallback para iOS/Safari (atenção: backend precisaria suportar MP4, mas o Google prefere WebM/Linear16)
                // Por enquanto, a maioria dos Androids cairá no primeiro if.
                options = { mimeType: 'audio/mp4' }
            }
            const mediaRecorder = new MediaRecorder(stream, options)

            mediaRecorderRef.current = mediaRecorder

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunksRef.current.push(event.data)
                }
            }

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: mediaRecorder.mimeType || 'audio/webm' })
                setAudioBlob(blob)
            }

            mediaRecorder.start()
            setIsRecording(true)

            // Inicia contagem regressiva
            let currentTime = MAX_DURATION
            setTimeLeft(currentTime)

            timerIntervalRef.current = setInterval(() => {
                currentTime -= 1
                setTimeLeft(currentTime)

                if (currentTime <= 0) {
                    stopRecording()
                }
            }, 1000)

        } catch (error) {
            console.error('Erro ao acessar microfone:', error)
            setHasPermissionError(true)
        }
    }, [stopRecording])

    const resetAudio = React.useCallback(() => {
        setAudioBlob(null)
        setHasPermissionError(false)
        setTimeLeft(MAX_DURATION)
    }, [])

    // Cleanup ao desmontar componente
    React.useEffect(() => {
        return () => {
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
            if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop())
        }
    }, [])

    return {
        isRecording,
        timeLeft,
        audioBlob,
        hasPermissionError,
        startRecording,
        stopRecording,
        resetAudio
    }
}