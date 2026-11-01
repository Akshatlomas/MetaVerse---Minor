import * as locationService from '../services/locationService.js';
import { isDbConnected } from '../config/db.js';

export async function getCampusInfo(req, res, next) {
  try {
    const locations = await locationService.getAllLocations();
    const byType = locations.reduce((acc, loc) => {
      acc[loc.type] = (acc[loc.type] || 0) + 1;
      return acc;
    }, {});

    res.json({
      name: 'IIIT Bhopal Campus Metaverse',
      dataSource: isDbConnected() ? 'database' : 'mock',
      locationCount: locations.length,
      locationsByType: byType,
      disclaimer:
        'Location names and details are placeholder/fictitious data and do not represent verified official IIIT Bhopal information.'
    });
  } catch (err) {
    next(err);
  }
}
