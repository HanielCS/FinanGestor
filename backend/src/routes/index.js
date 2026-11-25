import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.js';
import { authRateLimiter } from '../middlewares/rateLimiter.js';
import { validate } from '../middlewares/validate.js';
import * as schemas from '../validators/schemas.js';
import * as authCtrl from '../controllers/authController.js';
import * as txCtrl from '../controllers/transactionController.js';
import * as dashCtrl from '../controllers/dashboardController.js';
import * as goalCtrl from '../controllers/goalController.js';
import * as budgetCtrl from '../controllers/budgetController.js';
import * as metaCtrl from '../controllers/financeMetaController.js';

const router = Router();

// Rotas Públicas de Autenticação
router.post('/auth/register', authRateLimiter, validate(schemas.registerSchema), authCtrl.register);
router.post('/auth/login', authRateLimiter, validate(schemas.loginSchema), authCtrl.login);
router.post('/auth/refresh', authCtrl.refresh);
router.post('/auth/logout', authCtrl.logout);

// Barreira de Autenticação
router.use(authMiddleware);

router.put('/auth/password', validate(schemas.updatePasswordSchema), authCtrl.changePassword);

// Dashboard
router.get('/dashboard', dashCtrl.getDashboardData);

// Transações
router.get('/transactions', txCtrl.getTransactions);
router.get('/transactions/export/csv', txCtrl.exportCSV);
router.post('/transactions/import/preview', txCtrl.previewStatement);
router.post('/transactions/import/confirm', validate(schemas.importTransactionsSchema), txCtrl.confirmImport);
router.post('/transactions', validate(schemas.transactionSchema), txCtrl.createTransaction);
router.put('/transactions/:id', validate(schemas.transactionSchema), txCtrl.updateTransaction);
router.patch('/transactions/:id/restore', txCtrl.restoreTransaction);
router.delete('/transactions/:id', txCtrl.deleteTransaction);

// Metas Financeiras
router.get('/goals', goalCtrl.getGoals);
router.post('/goals', validate(schemas.goalSchema), goalCtrl.createGoal);
router.put('/goals/:id/add', validate(schemas.addGoalAmountSchema), goalCtrl.addMoneyToGoal);
router.delete('/goals/:id', goalCtrl.deleteGoal);

// Orçamentos Mensais
router.get('/budgets', budgetCtrl.getBudgets);
router.post('/budgets', validate(schemas.budgetSchema), budgetCtrl.upsertBudget);
router.delete('/budgets/:id', budgetCtrl.deleteBudget);

// Contas e Categorias
router.get('/meta', metaCtrl.getMeta);
router.post('/meta/accounts', validate(schemas.accountSchema), metaCtrl.createAccount);
router.delete('/meta/accounts/:id', metaCtrl.deleteAccount);
router.post('/meta/categories', validate(schemas.categorySchema), metaCtrl.createCategory);
router.delete('/meta/categories/:id', metaCtrl.deleteCategory);

export default router;
