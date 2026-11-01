import * as locationService from '../services/locationService.js';
import { calculateRoute } from '../services/pathfindingService.js';

/**
 * requestNavigation
 * Validates start and destination, returning distance and estimated walking time.
 */
export async function requestNavigation(req, res, next) {
  try {
    const { from, to } = req.body;

    if (!from || !to) {
      return res.status(400).json({ error: 'Both "from" and "to" location IDs are required' });
    }

    const [fromLoc, toLoc] = await Promise.all([
      locationService.getLocationById(from),
      locationService.getLocationById(to)
    ]);

    if (!fromLoc) return res.status(404).json({ error: `Unknown start location "${from}"` });
    if (!toLoc) return res.status(404).json({ error: `Unknown destination "${to}"` });

    const route = calculateRoute(fromLoc.x, fromLoc.y, toLoc.x, toLoc.y);

    res.json({
      from: fromLoc.id,
      fromName: fromLoc.name,
      to: toLoc.id,
      toName: toLoc.name,
      found: route.found,
      distanceM: route.distanceM,
      etaSeconds: route.etaSeconds,
      path: route.path,
      note: 'A* computed route avoiding solid obstacles on campus grid.'
    });
  } catch (err) {
    next(err);
  }
}

/**
 * computeRouteWaypoints
 * Computes direct A* path from arbitrary coordinates (e.g., current player pos)
 * to a target building or coordinate.
 */
export async function computeRouteWaypoints(req, res, next) {
  try {
    const { fromX, fromY, toId, toX, toY } = req.body;

    let targetX = toX;
    let targetY = toY;
    let targetName = 'Target Coordinate';

    if (toId) {
      const loc = await locationService.getLocationById(toId);
      if (!loc) return res.status(404).json({ error: `Destination location "${toId}" not found` });
      targetX = loc.x;
      targetY = loc.y;
      targetName = loc.name;
    }

    if (targetX === undefined || targetY === undefined || fromX === undefined || fromY === undefined) {
      return res.status(400).json({ error: 'Coordinates (fromX, fromY, and toId or toX, toY) are required' });
    }

    const route = calculateRoute(Number(fromX), Number(fromY), Number(targetX), Number(targetY));

    res.json({
      success: route.found,
      destinationName: targetName,
      destinationId: toId || null,
      path: route.path,
      distanceM: route.distanceM,
      etaSeconds: route.etaSeconds,
      waypointsCount: route.waypointsCount
    });
  } catch (err) {
    next(err);
  }
}
