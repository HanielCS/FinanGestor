import * as metaService from '../services/financeMetaService.js';

export async function getMeta(req, res) {
  res.json(await metaService.getUserMeta(req.userId));
}

export async function createAccount(req, res) {
  res.status(201).json(await metaService.createAccount(req.userId, req.body));
}

export async function deleteAccount(req, res) {
  await metaService.deleteAccount(req.userId, req.params.id);
  res.status(204).send();
}

export async function createCategory(req, res) {
  res.status(201).json(await metaService.createCategory(req.userId, req.body));
}

export async function deleteCategory(req, res) {
  await metaService.deleteCategory(req.userId, req.params.id);
  res.status(204).send();
}
