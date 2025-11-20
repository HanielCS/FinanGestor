💰 FinanGestor

FinanGestor é uma aplicação web completa para gestão financeira pessoal e empresarial.
O sistema permite o controle de receitas e despesas, visualização de indicadores financeiros (KPIs), gerenciamento de metas globais e histórico detalhado de transações.

📸 Screenshots

(Adicione capturas de tela da aplicação aqui quando quiser.)

🚀 Funcionalidades
🔐 Autenticação Segura

Cadastro e login

Criptografia de senha

Autenticação via JWT

📊 Dashboard Interativo

Indicadores: Saldo Líquido, Margem Líquida, ROI

Gráfico de fluxo de caixa (Entradas vs Saídas)

💼 Gestão de Transações

CRUD de transações

Categorias (Salário, Aluguel, Investimentos etc.)

Filtro de histórico pessoal e global

🎯 Metas Financeiras

Sistema de metas globais

Barra de progresso visual

Adicionar fundos, editar e excluir metas

📱 Interface Responsiva

Design moderno e adaptado para todos os dispositivos

🛠️ Tecnologias Utilizadas
Frontend

React (Vite)

CSS Modules

Recharts

Lucide React

Axios

Backend

Node.js

Express

Prisma ORM

PostgreSQL (Neon.tech)

JWT & Bcrypt

📦 Pré-requisitos

Node.js v18+

Git

Conta no Neon.tech (ou outro serviço PostgreSQL)

🔧 Como Rodar o Projeto Localmente
1️⃣ Clonar o repositório

```bash
git clone https://github.com/SEU_USUARIO/finangestor.git
cd finangestor
```

2️⃣ Configurar o Backend

Entrar na pasta backend e instalar dependências:
```bash
cd backend
npm install
```
Criar o arquivo .env:

```bash
# URL de conexão com o PostgreSQL (Exemplo Neon)
DATABASE_URL="postgresql://usuario:senha@host:5432/banco?sslmode=require"

# Porta do Servidor (Opcional)
PORT=3000
```
Rodar as migrações:

```bash
npx prisma migrate dev --name init
```
Iniciar o backend:

```bash
npm run dev
```
Backend rodando em:

```bash
http://localhost:3000
```

3️⃣ Configurar o Frontend

```bash
cd ../frontend
npm install
```
(Opcional) Criar .env:

```bash
VITE_API_URL="http://localhost:3000"
```
Iniciar o projeto:

```bash
npm run dev
```
Frontend disponível em:

```bash
http://localhost:5173
```
📂 Estrutura do Projeto

```bash
finangestor/
├── backend/
│   ├── controllers/     # Regras de negócio
│   ├── middlewares/     # Autenticação JWT
│   ├── prisma/          # Schema e migrations
│   ├── routes.js        # Rotas da API
│   └── index.js         # Inicialização do servidor
│
└── frontend/
    ├── src/
    │   ├── components/  # Navbar, Cards, Modal, etc.
    │   ├── context/     # Estado global (Auth)
    │   ├── pages/       # Páginas: Dashboard, Login...
    │   └── styles/      # CSS Modules
```
🌍 Deploy (Hospedagem)

Banco de Dados: Neon.tech (PostgreSQL)

Backend: Render.com

Frontend: Vercel