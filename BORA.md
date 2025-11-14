BORA — Visão geral do aplicativo (BORA.md) ✨
Pequena descrição
Um sistema clean, escalável e intuitivo para envio de lembretes inteligentes via Push (Next.js) e WhatsApp (whatsapp-web.js). Código escrito em TypeScript com atenção a princípios de arquitetura (SOLID, Clean Architecture) e práticas de produção.
Desenvolvido por Alexandre de Paula — https://github.com/aledepaulaaa
Produção: https://www.aplicativobora.com.br/ 🌐

Resumo das responsabilidades

Frontend (client): Next.js (App Router) — PWA, UI, lógica de criação/assinatura de lembretes, push notifications.
Backend (server): Node + TypeScript — integração WhatsApp, agendamento (node-cron), persistência em Firebase (Firestore), endpoints HTTP para controle/manual.
Integração: Firebase Admin para dados/autenticação/messaging; whatsapp-web.js para envio interativo; cron jobs para disparo programado.
Estrutura simplificada do monorepo

appbora/ (Next.js — frontend)
src/app/
layout.tsx, page.tsx, manifest.ts
actions/, api/, configuracoes/, lembretes/, perfil/, planos/
src/components/, contexts/, hooks/, interfaces/, theme/
bora-server/ (Node TypeScript — backend)
src/
index.ts
controllers/whatsapp.controller.ts
routes/whatsapp.routes.ts
database/firebase-admin.ts
interfaces/IReminder.ts
services/
whatsappClient.ts, whatsappBot.ts, whatsapp.service.ts
jobHandlers.ts, jobScheduler.ts, jobTestHandler.ts, jobPremiumUsers.ts
.wwebjs_auth/ (sessão WhatsApp — não versionar)
.wwebjs_cache/
Pontos-chave do server-side (Next.js App Router & bora-server)

Next.js (App Router) — rotas server-side e client-side, PWA e suporte a push. Arquitetura moderna do frontend com server components quando aplicável (pasta src/app/).
Serviço de backend dedicado (bora-server) — mantido separado para preservar sessão do WhatsApp, executar jobs e expor APIs REST necessárias ao frontend.
Persistência: Firestore (via firebase-admin) — modelo de lembretes, estados de fluxo conversacional, e dados de usuários.
Jobs: node-cron agendando leitura de lembretes e envio via whatsapp-web.js; jobs de teste e fluxo para usuários premium.
Sessão WhatsApp: armazenada localmente em .wwebjs_auth/ para persistência entre reinícios; tom cuidado ao escalar (ver recomendação abaixo).
Princípios e práticas arquiteturais aplicadas

Clean Architecture / Camadas
controllers (entrada), services (use-cases), database (infraestrutura), interfaces (entities/contracts).
SOLID
Single Responsibility: cada service/controller tem responsabilidade única.
Dependency Inversion: serviços dependem de contratos/abstrações (interfaces) e não de implementações concretas.
Open/Closed: módulos extensíveis (ex.: novos jobHandlers) sem alterar código existente.
Tipagem forte com TypeScript (interfaces/IReminder).
Responsabilidade única para integração com provedores externos (firebase-admin, whatsapp-web.js).
Tratamento de variáveis sensíveis via .env e formatação segura de private key do Firebase.
Observabilidade mínima: logs por módulo (QR, ready, errors).
Arquivos/ módulos de destaque (referências)

Frontend (appbora)
src/app/page.tsx — ponto de entrada da UI
src/hooks/usePushNotification.ts — integração Push
src/interfaces/IReminder.ts — modelo cliente
Backend (bora-server)
src/index.ts — inicialização do servidor express e serviços
src/database/firebase-admin.ts — inicialização do Firebase Admin
src/services/whatsappClient.ts — cliente e eventos do whatsapp-web.js
src/services/whatsappBot.ts — fluxo de conversação / criação de lembretes
src/services/jobScheduler.ts — agendamento cron (start/stop)
src/controllers/whatsapp.controller.ts — endpoint POST /api/send-message
src/interfaces/IReminder.ts — contrato do lembrete
Instalação local (resumo rápido)

Frontend (appbora)
Backend (bora-server)
Variáveis de ambiente importantes

FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY (formatada), PORT
Configs adicionais para WhatsApp/admin (definidas em .env local)
Observações de produção e scaling 🚦

WhatsApp session state é stateful: para escalabilidade horizontal, recomenda-se manter o componente do WhatsApp isolado em um worker/instância dedicada (ou usar soluções de filas e sessões externas).
Jobs agendados: para múltiplas instâncias, prevenir duplicidade com leader election (Redis locks) ou mover agendamento para um serviço gerenciado (Cloud Scheduler / Cloud Tasks).
Deploy frontend: Vercel / Cloud Run (Next.js App Router suportado).
Deploy backend: Cloud Run / AWS ECS / DigitalOcean App Platform. Manter secrets no Secret Manager e não commitar .wwebjs_auth/.env.
Métricas e logs: centralizar (Cloud Logging / Datadog) para rastrear entregas e erros.
Boas práticas para evolução

Manter contratos (interfaces) estáveis entre client e server.
Isolar integrações externas por adaptadores (Repository / Gateway pattern).
Escrever testes unitários para jobHandlers, parsing de datas (chrono-node) e fluxos do bot.
Documentar endpoints com OpenAPI/Swagger quando crescer API pública.
Sugestões rápidas de melhorias futuras

Migrar jobs para workers escaláveis (ex.: BullMQ + Redis).
Adicionar testes E2E para fluxo de envio de lembretes (simular Webhook/WhatsApp).
Usar uma camada de rate limiting/queue para envio em massa (evitar bloqueios do WhatsApp).
Tecnologias principais

Next.js (App Router), React, PWA — frontend
Node.js + TypeScript, Express — backend (bora-server)
whatsapp-web.js — integração WhatsApp
Firebase Admin (Firestore) — persistência e messaging
node-cron — agendamento
chrono-node — parsing de datas naturais
qrcode-terminal, dotenv, nodemon, etc.
Contato / autoria

Desenvolvido por: Alexandre de Paula
GitHub: https://github.com/aledepaulaaa
App em produção: https://www.aplicativobora.com.br/ 🚀
Licença & segurança

Nunca commitar: .env, .wwebjs_auth/, .wwebjs_cache/
Use Secret Manager / Vault em produção para FIREBASE_PRIVATE_KEY.
Versão deste documento

1.0 — visão técnica e operacional do BORA (client + server)