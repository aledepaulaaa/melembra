// melemebra/src/contexts/SnackbarContext.tsx
'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'
import { Snackbar, Alert, AlertColor } from '@mui/material'

interface SnackbarContextApi {
    openSnackbar: (message: string, severity?: AlertColor) => void;
}

// Inicialize o contexto com um valor padrão para evitar erros
const SnackbarContext = createContext<SnackbarContextApi>({
    openSnackbar: () => {},
});

export const useSnackbar = () => {
    return useContext(SnackbarContext);
};

export function SnackbarProvider({ children }: { children: ReactNode }) {
    const [open, setOpen] = useState(false)
    const [message, setMessage] = useState('')
    const [severity, setSeverity] = useState<AlertColor>('info')

    const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return
        }
        setOpen(false)
    }

    const openSnackbar = (newMessage: string, newSeverity: AlertColor = 'info') => {
        setMessage(newMessage)
        setSeverity(newSeverity)
        setOpen(true)
    }

    const value = { openSnackbar }

    return (
        <SnackbarContext.Provider value={value}>
            {children}
            <Snackbar
                open={open}
                autoHideDuration={6000}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={handleClose} severity={severity} variant="filled" sx={{ width: '100%' }}>
                    {message}
                </Alert>
            </Snackbar>
        </SnackbarContext.Provider>
    )
}