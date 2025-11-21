//bora-app/src/components/ui/planos/CardPlanos.tsx
import { motion } from "framer-motion"
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium'
import { SubscriptionState } from "@/interfaces/IBoraPayment"
import { Grid, Card, CardContent, Typography, List, ListItem, ListItemIcon, ListItemText, Button, Box, Chip, CircularProgress, Stack } from "@mui/material"

interface CardPlanoProps {
    handleUpgradeClick: (planId: 'plus' | 'premium') => void
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
                            <Typography variant="h5" fontWeight={500} gutterBottom>Bora Free</Typography>
                            <Typography variant="h4" fontWeight={700} gutterBottom>R$0</Typography>
                            <Typography variant="body2" gutterBottom>
                                Para quem está começando e quer experimentar.
                                Ideal para usuários que querem manter lembretes simples e criar o hábito de usar o app
                            </Typography>
                            <List>
                                <ListItem>
                                    <ListItemIcon><CheckIcon color="primary" /></ListItemIcon>
                                    <ListItemText primary="1 Lembrete por dia" />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon><CheckIcon color="primary" /></ListItemIcon>
                                    <ListItemText primary="Notificações por push" />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon><CheckIcon color="primary" /></ListItemIcon>
                                    <ListItemText primary="Multiplataforma (PC, iOS, Android)" />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon><CloseIcon color="error" /></ListItemIcon>
                                    <ListItemText primary="Sem envio de lembretes via WhatsApp" />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon><CloseIcon color="error" /></ListItemIcon>
                                    <ListItemText primary="Sem recorrência (ex: todo dia ou toda semana)" />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon><CloseIcon color="error" /></ListItemIcon>
                                    <ListItemText primary="Sem categorias e soneca" />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon><CloseIcon color="error" /></ListItemIcon>
                                    <ListItemText primary="Sem recursos de inteligência artificial ou personalização" />
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
                                <Typography variant="h5" fontWeight={500} gutterBottom>Bora Plus</Typography>
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
                            <Typography variant="body2" gutterBottom>
                                Para quem quer mais controle sobre sua rotina com praticidade.
                                Indicado para usuários que desejam configurar lembretes frequentes e receber avisos por WhatsApp
                            </Typography>
                            <List>
                                <ListItem>
                                    <ListItemIcon><CheckIcon color="primary" /></ListItemIcon><ListItemText primary="Tudo do Free +" />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon><CheckIcon color="primary" /></ListItemIcon><ListItemText primary="Lembretes ilimitados" />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon><CheckIcon color="primary" /></ListItemIcon><ListItemText primary="Recorrência personalizada (ex: toda segunda e quinta, mensal)" />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon><CheckIcon color="primary" /></ListItemIcon><ListItemText primary="Categorias/Tags ilimitadas para organização" />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon><CheckIcon color="primary" /></ListItemIcon><ListItemText primary="Função Soneca para adiar um lembrete por 5min, 1h, 1 dia" />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon><CheckIcon color="primary" /></ListItemIcon><ListItemText primary="Integração com WhatsApp (30 lembretes por mês)" />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon><CloseIcon color="error" /></ListItemIcon><ListItemText primary="Não permite comandos de voz ou texto pelo WhatsApp" />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon><CloseIcon color="error" /></ListItemIcon><ListItemText primary="Não tem IA personalizada nem anexos em tarefas" />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon><CloseIcon color="error" /></ListItemIcon><ListItemText primary="WhatsApp limitado a 30 lembretes/mês" />
                                </ListItem>
                            </List>
                            <Button
                                fullWidth
                                variant="contained"
                                onClick={() => handleUpgradeClick('plus')}
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
                                <Typography variant="h5" fontWeight={500} gutterBottom>Bora Premium</Typography>
                                <Chip icon={<WorkspacePremiumIcon />} label="COMPLETO" color="success" size="small" />
                            </Box>
                            <Typography variant="h4" fontWeight={700} gutterBottom>
                                R$19,90
                                <Typography component="span" color="text.secondary">
                                    /mês
                                </Typography>
                            </Typography>
                            <Typography variant="body2" gutterBottom>
                                WhatsApp ilimitado e bidirecional: você pode responder mensagens e criar tarefas por texto ou áudio
                            </Typography>
                            <List>
                                <ListItem>
                                    <ListItemIcon><CheckIcon color="primary" />
                                    </ListItemIcon>
                                    <ListItemText primary="Tudo do Plus +" />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon><CheckIcon color="primary" /></ListItemIcon>
                                    <ListItemText primary="WhatsApp ilimitado e bidirecional: você pode responder mensagens e criar tarefas por texto ou áudio" />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon><CheckIcon color="primary" /></ListItemIcon><ListItemText primary="IA com mensagens personalizadas" />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon><CheckIcon color="primary" /></ListItemIcon><ListItemText primary="Resumo diário automático no WhatsApp com todas as tarefas do dia" />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon><CheckIcon color="primary" /></ListItemIcon><ListItemText primary="Anexos nas tarefas: envie foto de receita médica, boleto etc" />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon><CheckIcon color="primary" /></ListItemIcon><ListItemText primary="Relatórios de progresso e gráficos sobre tarefas realizadas" />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon><CheckIcon color="primary" /></ListItemIcon><ListItemText primary="Atendimento prioritário" />
                                </ListItem>
                            </List>
                            <Button
                                fullWidth
                                variant="contained"
                                onClick={() => handleUpgradeClick('premium')}
                                disabled={isRedirecting || currentPlan.plan === 'premium'}
                            >
                                {isRedirecting ? <CircularProgress size={24} color="inherit" /> : (currentPlan.plan === 'premium' ? 'Gerenciar Plano' : 'Assinar')}
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>
            </Grid>
        </Stack>
    )
}