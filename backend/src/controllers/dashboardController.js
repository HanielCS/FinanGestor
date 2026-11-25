import * as dashboardService from '../services/dashboardService.js';

export async function getDashboardData(req, res) {
  const data = await dashboardService.getDashboardSummary(req.userId, req.query);
  res.json(data);
}
