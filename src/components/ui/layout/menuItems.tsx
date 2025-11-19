//appbora/src/components/ui/layout/menuItems.tsx
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded'
import TuneRoundedIcon from '@mui/icons-material/TuneRounded'
import RoofingRoundedIcon from '@mui/icons-material/RoofingRounded'
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined'
import LogoutIcon from '@mui/icons-material/Logout'
import HttpsOutlinedIcon from '@mui/icons-material/HttpsOutlined'
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined'

export const menuItems = [
    { text: 'Início', path: '/', icon: <RoofingRoundedIcon /> },
    { text: 'Lembretes', path: '/lembretes', icon: <ScheduleRoundedIcon /> },
    { text: 'Meus Dados', path: '/meusdados', icon: <AccountCircleOutlinedIcon /> },
    { text: 'Preferências', path: '/preferencias', icon: <TuneRoundedIcon /> },
    { text: 'Notificações', path: '/notificacoes', icon: <NotificationsNoneOutlinedIcon /> },
    // { text: 'Privacidade', path: '/privacidade', icon: <HttpsOutlinedIcon /> },
    { text: 'Sair', action: 'logout', icon: <LogoutIcon /> },
]