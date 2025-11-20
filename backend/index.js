import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import routes from './routes.js';

const app = express();

// --- MIDDLEWARES ---

// Habilita CORS (Permite que o Frontend acesse este Backend)
// Em produção, você poderia restringir: app.use(cors({ origin: 'https://seu-site.com' }));
app.use(cors());

// Habilita o servidor para entender JSON no corpo das requisições
app.use(express.json());

// --- ROTAS ---

// Rota Raiz (Health Check) - Útil para verificar se o servidor está vivo
app.get('/', (req, res) => {
  res.send('API FinanGestor está rodando com sucesso!');
});

// Importa todas as rotas da aplicação (Transações, Metas, Auth)
app.use(routes);

// --- TRATAMENTO DE ERROS GLOBAIS ---

// Middleware para rotas não encontradas (404)
app.use((req, res, next) => {
  res.status(404).json({ error: 'Rota não encontrada.' });
});

// Middleware para erros internos (500) - Evita que o servidor pare
app.use((error, req, res, next) => {
  console.error("Erro interno do servidor:", error);
  res.status(500).json({ error: 'Ocorreu um erro interno no servidor.' });
});

// --- INICIALIZAÇÃO ---

// Usa a porta definida na nuvem (process.env.PORT) ou 3000 se estiver local
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`pid: ${process.pid}`);
});