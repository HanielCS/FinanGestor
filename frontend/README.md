💰 FinanGestor

FinanGestor é uma aplicação web completa para gestão financeira pessoal e empresarial. O sistema permite o controle de receitas e despesas, visualização de indicadores financeiros (KPIs), gerenciamento de metas globais e histórico detalhado de transações.

📸 Screenshots

(Aqui você pode colocar prints da sua aplicação depois)

🚀 Funcionalidades

Autenticação Segura: Cadastro e Login de usuários com criptografia de senha e Tokens JWT.

Dashboard Interativo:

Indicadores de Saldo Líquido, Margem Líquida e ROI.

Gráfico de Fluxo de Caixa (Entradas vs Saídas).

Gestão de Transações:

Adicionar, Editar e Excluir transações.

Categorização (Salário, Aluguel, Investimentos, etc.).

Filtro de histórico pessoal e global.

Metas Financeiras:

Sistema de Metas Globais.

Barra de progresso visual.

Adição de fundos, edição e exclusão de metas.

Interface Responsiva: Design limpo e adaptável para dispositivos móveis e desktop.

🛠️ Tecnologias Utilizadas

Frontend

React.js (Vite)

CSS Modules (Arquitetura modularizada em src/styles)

Recharts (Gráficos interativos)

Lucide React (Ícones modernos)

Axios (Comunicação com API)

Backend

Node.js

Express (Framework de servidor)

Prisma ORM (Abstração de banco de dados)

PostgreSQL (Banco de dados na nuvem via Neon.tech)

JWT & Bcrypt (Segurança e Autenticação)

📦 Pré-requisitos

Antes de começar, certifique-se de ter instalado em sua máquina:

Node.js (v18 ou superior)

Git

Uma conta no Neon.tech ou outro provedor PostgreSQL.

🔧 Como Rodar o Projeto Localmente

1. Clone o repositório

git clone [https://github.com/SEU_USUARIO/finangestor.git](https://github.com/SEU_USUARIO/finangestor.git)
cd finangestor


2. Configurando o Backend

Entre na pasta do servidor e instale as dependências:

cd backend
npm install


Crie um arquivo .env na raiz da pasta backend e configure a URL do seu banco de dados:

# URL de conexão com o PostgreSQL (Exemplo Neon)
DATABASE_URL="postgresql://usuario:senha@host:5432/banco?sslmode=require"

# Porta do Servidor (Opcional, padrão 3000)
PORT=3000


Execute as migrações para criar as tabelas no banco:

npx prisma migrate dev --name init


Inicie o servidor:

npm run dev


O backend rodará em http://localhost:3000

3. Configurando o Frontend

Abra um novo terminal, entre na pasta do frontend e instale as dependências:

cd ../frontend
npm install


(Opcional) Crie um arquivo .env na pasta frontend se precisar apontar para um backend diferente (ex: produção):

VITE_API_URL="http://localhost:3000"


Inicie a interface:

npm run dev


O frontend rodará em http://localhost:5173

📂 Estrutura do Projeto

finangestor/
├── backend/
│   ├── controllers/   # Regras de negócio (Auth, Transaction, Goal, Dashboard)
│   ├── middlewares/   # Autenticação (authMiddleware)
│   ├── prisma/        # Schema do banco de dados e Migrations
│   ├── routes.js      # Definição de rotas da API
│   └── index.js       # Ponto de entrada do servidor
│
└── frontend/
    ├── src/
    │   ├── components/ # Componentes reutilizáveis (Navbar, Modal, Cards)
    │   ├── context/    # Contexto Global de Autenticação
    │   ├── pages/      # Telas (Dashboard, Login, Minhas Transações)
    │   └── styles/     # CSS organizado por módulos (cards.css, modal.css, etc.)


🌍 Deploy (Hospedagem)

O projeto está pronto para deploy na stack gratuita:

Banco de Dados: Neon Tech (PostgreSQL).os

Backend: Render.com (Web Service).

Frontend: Vercel.