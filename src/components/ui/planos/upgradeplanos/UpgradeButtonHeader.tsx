//bora-app/src/components/ui/UpgradeButtonHeader.tsx
import { useAppSelector } from "@/app/store/hooks"
import { Button } from "@mui/material"
// CORREÇÃO: Mudar a importação do useRouter
import { useRouter } from 'next/navigation' 
import DiamondOutlinedIcon from '@mui/icons-material/DiamondOutlined'

export default function UpgradeButtonHeader() {
    const router = useRouter()
    const { plan, status } = useAppSelector((state) => state.subscription)

    // O resto do componente permanece igual...
    if (plan !== 'free' || status === 'loading') {
        return null
    }

    return (
        <Button
            variant="outlined"
            startIcon={<DiamondOutlinedIcon fontSize="large" />}
            onClick={() => router.push('/planos')}
            sx={{ borderRadius: 4, textTransform: "none", fontWeight: "bold", p: 1 }}
        >
            Assinar Plus
        </Button>
    )
}