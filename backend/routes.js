import { Router } from 'express';
import * as transactionController from './controllers/transactionController.js';
import * as goalController from './controllers/goalController.js';
import * as dashboardController from './controllers/dashboardController.js';
import * as authController from './controllers/authController.js';

// Middleware de Proteção
import { authMiddleware } from './middlewares/auth.js';

const router = Router();

// ROTAS PÚBLICAS (Não exigem login)
router.post('/register', authController.register);
router.post('/login', authController.login);

// BARREIRA DE SEGURANÇA
// Todas as rotas abaixo exigem um Token JWT válido no header
router.use(authMiddleware); 

// DASHBOARD
router.get('/dashboard', dashboardController.getDashboardData);

// TRANSAÇÕES
router.get('/transactions', transactionController.getTransactions);
router.get('/transactions/global', transactionController.getGlobalTransactions);
router.post('/transactions', transactionController.createTransaction);
router.put('/transactions/:id', transactionController.updateTransaction);
router.delete('/transactions/:id', transactionController.deleteTransaction);

// METAS
router.get('/goals', goalController.getGoals);
router.post('/goals', goalController.createGoal);
router.put('/goals/:id', goalController.updateGoal);
router.put('/goals/:id/add', goalController.addMoneyToGoal);
router.delete('/goals/:id', goalController.deleteGoal);

export default router;