import * as transactionService from '../services/transactionService.js';
import { generateTransactionsCSV, parseStatementContent } from '../utils/statementParser.js';
import { AppError } from '../utils/AppError.js';

export async function getTransactions(req, res) {
  const data = await transactionService.listTransactions(req.userId, req.query);
  res.json(data);
}

export async function createTransaction(req, res) {
  const created = await transactionService.createTransaction(req.userId, req.body);
  res.status(201).json(created);
}

export async function updateTransaction(req, res) {
  const updated = await transactionService.updateTransaction(req.userId, req.params.id, req.body);
  res.json(updated);
}

export async function deleteTransaction(req, res) {
  await transactionService.softDeleteTransaction(req.userId, req.params.id);
  res.status(204).send();
}

export async function restoreTransaction(req, res) {
  await transactionService.restoreTransaction(req.userId, req.params.id);
  res.json({ message: 'Transação restaurada com sucesso.' });
}

export async function exportCSV(req, res) {
  const { items } = await transactionService.listTransactions(req.userId, {
    ...req.query,
    page: 1,
    limit: 5000,
  });
  const csv = generateTransactionsCSV(items);
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="finangestor-extrato.csv"');
  res.send(csv);
}

export async function previewStatement(req, res) {
  const { content, filename } = req.body;
  if (!content) throw new AppError('Conteúdo do arquivo não enviado.', 400);
  const parsed = parseStatementContent(content, filename);
  res.json({ items: parsed, count: parsed.length });
}

export async function confirmImport(req, res) {
  const result = await transactionService.batchImportTransactions(req.userId, req.body);
  res.status(201).json(result);
}
