# BORA — Visão geral do aplicativo ✨

Um sistema clean, escalável e intuitivo para envio de lembretes inteligentes via Push (Next.js PWA) e WhatsApp (whatsapp-web.js).  
Código em TypeScript com atenção a princípios de arquitetura (SOLID, Clean Architecture) e práticas de produção.

Desenvolvido por: Alexandre de Paula — https://github.com/aledepaulaaa  
Produção: https://www.aplicativobora.com.br/ 🌐

---

## Visão geral rápida 🚀
BORA permite criar, agendar e entregar lembretes inteligentes ao usuário via push notifications (PWA) e mensagens no WhatsApp. Projetado para confiabilidade em produção, com separação clara entre frontend (Next.js) e backend (bora-server) que mantém a sessão do WhatsApp.

---

## Componentes principais 🧩

- Frontend (appbora) — Next.js (App Router), PWA, interface de criação/assinatura de lembretes e integração Push.
- Backend (bora-server) — Node.js + TypeScript, integração com whatsapp-web.js, agendamento com node-cron, persistência em Firestore.
- Persistência — Firebase Firestore (via firebase-admin).
- Agendamento — node-cron para jobs programados; handlers específicos para fluxos (teste, premium, etc.).
- Sessão WhatsApp — .wwebjs_auth/ local (persistência de sessão).

---

## Estrutura simplificada do monorepo 📁

appbora/ (Next.js — frontend)
- src/app/ (App Router: layout.tsx, page.tsx, manifest.ts)
- src/actions/, api/, configuracoes/, lembretes/, perfil/, planos/
- src/components/, contexts/, hooks/, interfaces/, theme/

bora-server/ (Node TypeScript — backend)
- src/index.ts (bootstrap)
- src/controllers/whatsapp.controller.ts
- src/routes/whatsapp.routes.ts
- src/database/firebase-admin.ts
- src/interfaces/IReminder.ts
- src/services/whatsappClient.ts, whatsappBot.ts, whatsapp.service.ts
- jobHandlers.ts, jobScheduler.ts, jobTestHandler.ts, jobPremiumUsers.ts
- .wwebjs_auth/ (não versionar)

---

## Princípios arquiteturais e boas práticas 🏗️

- Clean Architecture: controllers (entrada), services (use-cases), database (infra).
- SOLID aplicado: responsabilidades únicas, injeção por abstração, módulos extensíveis.
- Tipagem forte com TypeScript (interfaces/IReminder).
- Isolamento de integrações externas (Firebase, WhatsApp) por adaptadores.
- Variáveis sensíveis em .env / Secret Manager — FIREBASE_PRIVATE_KEY devidamente formatada.

---

## Fluxos e responsabilidades ✉️

- Frontend: UI, criação/edição de lembretes, permissões de push, envio de tokens FCM para o backend.
- Backend: manutenção de sessão WhatsApp, endpoints REST (ex.: POST /api/send-message), agendamento e execução de jobs que dispararam mensagens.
- Jobs: leitura periódica de lembretes prontos, parsing de datas (chrono-node), execução e logging de envios via whatsapp-web.js.

---

## Arquivos e módulos de destaque ⭐

- Frontend
  - src/app/page.tsx — entrada da UI
  - src/hooks/usePushNotification.ts — integração com Push
  - src/interfaces/IReminder.ts — modelo cliente

- Backend
  - src/index.ts — inicialização do servidor e serviços
  - src/database/firebase-admin.ts — bootstrap do Firebase Admin
  - src/services/whatsappClient.ts — eventos e cliente whatsapp-web.js
  - src/services/whatsappBot.ts — fluxo conversacional / criação de lembretes
  - src/services/jobScheduler.ts — start/stop de cron jobs
  - src/controllers/whatsapp.controller.ts — endpoint HTTP para envio manual

---

## Variáveis de ambiente importantes 🔐

- FIREBASE_PROJECT_ID
- FIREBASE_CLIENT_EMAIL
- FIREBASE_PRIVATE_KEY (formatada — manter quebras e escape corretos)
- PORT
- Outras: configs de WhatsApp / admin (definidas localmente)

Nunca commitar: .env, .wwebjs_auth/, .wwebjs_cache/ — usar Secret Manager / Vault em produção.

---

## Instalação local (resumo) 🛠️

1. Clonar repositório.
2. Criar .env.local com variáveis necessárias.
3. Frontend:
   - cd appbora
   - npm install
   - npm run dev
4. Backend:
   - cd bora-server
   - npm install
   - npm run dev

Observação: ao iniciar o backend, o whatsapp-web.js solicitará QR na primeira execução — acompanhar logs.

---

## Observações de produção e escalabilidade 🚦

- Sessão WhatsApp é stateful: para horizontalizar, isolar em worker/instância dedicada ou adotar filas/sessões externas.
- Jobs agendados: evitar execução duplicada em múltiplas instâncias (usar leader election / Redis locks ou mover para Cloud Scheduler/Cloud Tasks).
- Deploy frontend: Vercel / Cloud Run. Backend: Cloud Run / AWS ECS / DigitalOcean App Platform.
- Segredos: usar Secret Manager; não versionar arquivos de sessão.
- Logs e métricas: centralizar (Cloud Logging / Datadog) para rastrear entregas e falhas.

---

## Sugestões de evolução ✨

- Migrar jobs para workers escaláveis (BullMQ + Redis).
- Implementar rate limiting / queues para envios em massa (prevenir bloqueio do WhatsApp).
- Testes: unitários para jobHandlers e parsing; E2E para fluxo de envio de lembretes (simulação do WhatsApp).
- Documentar API com OpenAPI/Swagger quando abrir para consumo externo.
- Adotar monitoramento de entregabilidade (retries, DLQ) para mensagens falhas.

---

## Segurança & conformidade 🔒

- Proteger private keys e credenciais.
- Evitar exposição de dados sensíveis em logs.
- Considerar consentimento e regras de opt-in para envio via WhatsApp (conformidade com políticas do provedor).

---

## Contato / autoria ✍️
Desenvolvedor: Alexandre de Paula  
GitHub: https://github.com/aledepaulaaa  
Site: https://www.aplicativobora.com.br/

---

Versão do documento: 1.1 — visão técnica e operacional do BORA (client + server)  
Licença: manter conforme repositório principal.