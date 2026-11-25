import * as goalService from '../services/goalService.js';

export async function getGoals(req, res) {
  res.json(await goalService.listGoals(req.userId));
}

export async function createGoal(req, res) {
  res.status(201).json(await goalService.createGoal(req.userId, req.body));
}

export async function addMoneyToGoal(req, res) {
  res.json(await goalService.addContribution(req.userId, req.params.id, req.body.amount));
}

export async function deleteGoal(req, res) {
  await goalService.deleteGoal(req.userId, req.params.id);
  res.status(204).send();
}
