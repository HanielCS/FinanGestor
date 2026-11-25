# 💰 FinanGestor v2.0

Aplicação full-stack para gestão financeira pessoal com arquitetura modular, segurança reforçada (Access + Refresh Token rotativo em cookie `HttpOnly`), suporte a múltiplas carteiras, categorias personalizadas, orçamentos mensais com alertas, lançamentos parcelados/recorrentes, importação OFX/CSV e tema Claro/Escuro.

## 🔒 Melhorias de Segurança Implementadas

- **Autenticação em Duas Camadas:** Access Token JWT de curta duração (15 min) mantido apenas em memória no frontend + Refresh Token rotativo (7 dias) armazenado em cookie `HttpOnly` com detecção de reuso de token.
- **Proteção contra Força Bruta:** `express-rate-limit` dedicado nas rotas `/api/auth/login` e `/api/auth/register`.
- **Validação Estrita com Zod:** Bloqueio de *mass assignment* e validação de tipos, valores monetários e datas antes dos controllers.
- **Hardening HTTP & Multi-Tenant:** Headers de segurança com `helmet`, política CORS restrita com credenciais e isolamento estrito por `userId` em todas as consultas (incluindo metas financeiras).
- **Auditoria & Soft Delete:** Registro de eventos críticos de autenticação em `audit_logs` e lixeira com restauração de transações (`deletedAt`).

## 🚀 Como Rodar Localmente

### 1. Configurar o Backend

```bash
cd backend
npm install
cp .env.example .env
# Preencha DATABASE_URL, JWT_ACCESS_SECRET e JWT_REFRESH_SECRET no arquivo .env
npx prisma migrate dev --name security_and_multitenant_v2
npm run dev
```

### 2. Configurar o Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Acesse `http://localhost:5173`.
