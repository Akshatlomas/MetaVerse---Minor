import * as locationService from '../services/locationService.js';

export async function search(req, res, next) {
  try {
    const q = req.query.q || '';
    if (!q.trim()) {
      return res.json({ results: [], query: q });
    }
    const results = await locationService.searchLocations(q);
    res.json({ results, query: q, count: results.length });
  } catch (err) {
    next(err);
  }
}
