import * as budgetService from '../services/budgetService.js';

export async function getBudgets(req, res) {
  res.json(await budgetService.listBudgets(req.userId, req.query));
}

export async function upsertBudget(req, res) {
  res.status(201).json(await budgetService.upsertBudget(req.userId, req.body));
}

export async function deleteBudget(req, res) {
  await budgetService.deleteBudget(req.userId, req.params.id);
  res.status(204).send();
}
