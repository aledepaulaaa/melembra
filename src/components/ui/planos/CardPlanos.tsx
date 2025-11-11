//bora-app/src/components/ui/planos/CardPlanos.tsx
import { motion } from "framer-motion"
import CheckIcon from '@mui/icons-material/Check'
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium'
import { SubscriptionState } from "@/interfaces/IMeLembraPayment"
import { Grid, Card, CardContent, Typography, List, ListItem, ListItemIcon, ListItemText, Button, Box, Chip, CircularProgress, Stack } from "@mui/material"

interface CardPlanoProps {
    handleUpgradeClick: () => void
    currentPlan: SubscriptionState
    isRedirecting: boolean
    cardVariants: any
}

export default function CardPlanos({ handleUpgradeClick, currentPlan, isRedirecting, cardVariants }: CardPlanoProps) {

    return (
        <Stack spacing={2} justifyContent="center" direction="column">
            {/* Card Grátis */}
            <Grid size={{ xs: 12, md: 6 }}>
                <motion.div variants={cardVariants}>
                    <Card sx={{ height: '100%', borderRadius: 4 }}>
                        <CardContent sx={{ p: 4 }}>
                            <Typography variant="h5" fontWeight={500} gutterBottom>Grátis</Typography>
                            <Typography variant="h4" fontWeight={700} gutterBottom>R$0</Typography>
                            <List>
                                <ListItem>
                                    <ListItemIcon><CheckIcon color="primary" /></ListItemIcon>
                                    <ListItemText primary="1 Lembrete por dia" />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon><CheckIcon color="primary" /></ListItemIcon>
                                    <ListItemText primary="Notificações básicas (Push e WhatsApp)" />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon><CheckIcon color="primary" /></ListItemIcon>
                                    <ListItemText primary="Ideal para testar o aplicativo" />
                                </ListItem>
                            </List>
                            <Button fullWidth variant="outlined" disabled>Seu plano atual</Button>
                        </CardContent>
                    </Card>
                </motion.div>
            </Grid>
            {/* Card Plus */}
            <Grid size={{ xs: 12, md: 6 }}>
                <motion.div variants={cardVariants}>
                    <Card sx={{ height: '100%', borderRadius: 4, border: '2px solid', borderColor: 'primary.main' }}>
                        <CardContent sx={{ p: 4 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="h5" fontWeight={500} gutterBottom>Plus</Typography>
                                <Chip icon={<WorkspacePremiumIcon />} label="POPULAR" color="primary" size="small" />
                            </Box>
                            <Typography
                                variant="h4"
                                fontWeight={700}
                                gutterBottom
                            >
                                R$9,90
                                <Typography
                                    component="span"
                                    color="text.secondary"
                                >
                                    /mês
                                </Typography>
                            </Typography>
                            <List>
                                <ListItem>
                                    <ListItemIcon><CheckIcon color="primary" /></ListItemIcon><ListItemText primary="Lembretes ilimitados" />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon><CheckIcon color="primary" /></ListItemIcon><ListItemText primary="Lembretes recorrentes (diário, semanal e mensal)" />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon><CheckIcon color="primary" /></ListItemIcon><ListItemText primary="Personalização de lembretes" />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon><CheckIcon color="primary" /></ListItemIcon><ListItemText primary="Notificações via Push e WhatsApp" />
                                </ListItem>
                            </List>
                            <Button
                                fullWidth
                                variant="contained"
                                onClick={handleUpgradeClick}
                                disabled={isRedirecting || currentPlan.plan === 'plus'}
                            >
                                {isRedirecting ? <CircularProgress size={24} color="inherit" /> : (currentPlan.plan === 'plus' ? 'Gerenciar Plano' : 'Assinar')}
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>
            </Grid>
            {/* Card Plus */}
            <Grid size={{ xs: 12, md: 6 }}>
                <motion.div variants={cardVariants}>
                    <Card sx={{ height: '100%', borderRadius: 4 }}>
                        <CardContent sx={{ p: 4 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="h5" fontWeight={500} gutterBottom>Premium</Typography>
                            </Box>
                            <Typography variant="h4" fontWeight={700} gutterBottom>
                                R$19,90
                                <Typography component="span" color="text.secondary">
                                    /mês
                                </Typography>
                            </Typography>
                            <List>
                                <ListItem>
                                    <ListItemIcon><CheckIcon color="primary" />
                                    </ListItemIcon>
                                    <ListItemText primary="Todos os recursos do Plus" />
                                </ListItem>
                                <ListItem><ListItemIcon>
                                    <CheckIcon color="primary" />
                                </ListItemIcon>
                                    <ListItemText primary="Inteligência de rotina Personalizada com IA" />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon><CheckIcon color="primary" /></ListItemIcon><ListItemText primary="Prioridade no suporte" />
                                </ListItem>
                            </List>
                            <Button
                                fullWidth
                                variant="contained"
                                onClick={handleUpgradeClick}
                                disabled={isRedirecting || currentPlan.plan === 'plus'}
                            >
                                {isRedirecting ? <CircularProgress size={24} color="inherit" /> : (currentPlan.plan === 'plus' ? 'Gerenciar Plano' : 'Assinar')}
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>
            </Grid>
        </Stack>
    )
}