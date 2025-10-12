'use client'
//melembra/src/components/InstallPrompt.tsx
import React from "react"
import PushNotificationManager from "./PushNotificationManager"
import { Button } from "@mui/material"

const InstallPrompt = () => {
    const [isIOS, setIsIOS] = React.useState(false)
    const [isStandalone, setIsStandalone] = React.useState(false)

    React.useEffect(() => {
        setIsIOS(
            /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
        )

        setIsStandalone(window.matchMedia('(display-mode: standalone)').matches)
    }, [])

    if (isStandalone) {
        return null // Don't show install button if already installed
    }

    return (
        <div>
            <h3>Instalar App</h3>
            <Button
                variant="outlined"
            >
                Adicione na tela de ínicio
            </Button>
            {isIOS && (
                <p>
                    Para instalar este aplicativo no seu dispositivo iOS, toque no botão de compartilhamento
                    <span role="img" aria-label="share icon">
                        {' '}
                        ⎋{' '}
                    </span>
                    e então "Adicionar à tela inicial"
                    <span role="img" aria-label="plus icon">
                        {' '}
                        ➕{' '}
                    </span>
                    .
                </p>
            )}
        </div>
    )
}

export default function Page() {
    return (
        <div>
            <PushNotificationManager />
            <InstallPrompt />
        </div>
    )
}