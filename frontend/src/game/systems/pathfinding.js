import { WORLD, GRID } from '../maps/campusLayout.js';
import { LOCATIONS } from '../../data/locations.js';

/**
 * Grid-based A* pathfinding.
 * Buildings are marked as blocked cells; everything else (roads, grass,
 * courtyards) is walkable. Good enough for campus-scale navigation
 * without pulling in a full navmesh library.
 */

function buildWalkableGrid() {
  const grid = Array.from({ length: GRID.rows }, () => new Array(GRID.cols).fill(1));

  const toCell = (px) => Math.floor(px / WORLD.tileSize);

  LOCATIONS.forEach((loc) => {
    // Only block cells for buildings with a real footprint (skip open areas)
    if (loc.type === 'other') return;

    const left = toCell(loc.x - loc.width / 2);
    const right = toCell(loc.x + loc.width / 2);
    const top = toCell(loc.y - loc.height / 2);
    const bottom = toCell(loc.y + loc.height / 2);

    for (let r = Math.max(0, top); r <= Math.min(GRID.rows - 1, bottom); r++) {
      for (let c = Math.max(0, left); c <= Math.min(GRID.cols - 1, right); c++) {
        grid[r][c] = 0; // blocked
      }
    }
  });

  return grid;
}

let cachedGrid = null;
function getGrid() {
  if (!cachedGrid) cachedGrid = buildWalkableGrid();
  return cachedGrid;
}

function heuristic(a, b) {
  return Math.abs(a.r - b.r) + Math.abs(a.c - b.c);
}

function worldToCell(x, y) {
  return {
    c: Phaser_clamp(Math.floor(x / WORLD.tileSize), 0, GRID.cols - 1),
    r: Phaser_clamp(Math.floor(y / WORLD.tileSize), 0, GRID.rows - 1)
  };
}

function Phaser_clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function cellToWorld(cell) {
  return {
    x: cell.c * WORLD.tileSize + WORLD.tileSize / 2,
    y: cell.r * WORLD.tileSize + WORLD.tileSize / 2
  };
}

function findNearestWalkable(grid, cell) {
  if (grid[cell.r]?.[cell.c] === 1) return cell;
  for (let radius = 1; radius < 10; radius++) {
    for (let dr = -radius; dr <= radius; dr++) {
      for (let dc = -radius; dc <= radius; dc++) {
        const r = cell.r + dr;
        const c = cell.c + dc;
        if (grid[r]?.[c] === 1) return { r, c };
      }
    }
  }
  return cell;
}

/**
 * Returns an array of {x, y} world points from start to goal, or null
 * if no path exists.
 */
export function findPath(startX, startY, goalX, goalY) {
  const grid = getGrid();
  let start = worldToCell(startX, startY);
  let goal = worldToCell(goalX, goalY);

  start = findNearestWalkable(grid, start);
  goal = findNearestWalkable(grid, goal);

  const key = (cell) => `${cell.r}_${cell.c}`;
  const open = new Map();
  const cameFrom = new Map();
  const gScore = new Map();
  const fScore = new Map();

  gScore.set(key(start), 0);
  fScore.set(key(start), heuristic(start, goal));
  open.set(key(start), start);

  const neighborsOf = (cell) => {
    const deltas = [
      { dr: -1, dc: 0 },
      { dr: 1, dc: 0 },
      { dr: 0, dc: -1 },
      { dr: 0, dc: 1 }
    ];
    return deltas
      .map(({ dr, dc }) => ({ r: cell.r + dr, c: cell.c + dc }))
      .filter(
        (n) =>
          n.r >= 0 &&
          n.r < GRID.rows &&
          n.c >= 0 &&
          n.c < GRID.cols &&
          grid[n.r][n.c] === 1
      );
  };

  let iterations = 0;
  const maxIterations = 20000;

  while (open.size > 0 && iterations < maxIterations) {
    iterations++;

    let currentKey = null;
    let current = null;
    let bestF = Infinity;
    for (const [k, cell] of open) {
      const f = fScore.get(k) ?? Infinity;
      if (f < bestF) {
        bestF = f;
        currentKey = k;
        current = cell;
      }
    }

    if (currentKey === key(goal)) {
      const path = [current];
      let ck = currentKey;
      while (cameFrom.has(ck)) {
        ck = cameFrom.get(ck);
        const [r, c] = ck.split('_').map(Number);
        path.push({ r, c });
      }
      path.reverse();
      return simplifyPath(path.map(cellToWorld));
    }

    open.delete(currentKey);

    for (const neighbor of neighborsOf(current)) {
      const nKey = key(neighbor);
      const tentativeG = (gScore.get(currentKey) ?? Infinity) + 1;
      if (tentativeG < (gScore.get(nKey) ?? Infinity)) {
        cameFrom.set(nKey, currentKey);
        gScore.set(nKey, tentativeG);
        fScore.set(nKey, tentativeG + heuristic(neighbor, goal));
        if (!open.has(nKey)) open.set(nKey, neighbor);
      }
    }
  }

  return null; // no path found
}

/** Collapses consecutive collinear points to keep the route line clean. */
function simplifyPath(points) {
  if (points.length < 3) return points;
  const result = [points[0]];
  for (let i = 1; i < points.length - 1; i++) {
    const prev = result[result.length - 1];
    const cur = points[i];
    const next = points[i + 1];
    const dx1 = cur.x - prev.x;
    const dy1 = cur.y - prev.y;
    const dx2 = next.x - cur.x;
    const dy2 = next.y - cur.y;
    const collinear = dx1 * dy2 - dy1 * dx2 === 0;
    if (!collinear) result.push(cur);
  }
  result.push(points[points.length - 1]);
  return result;
}

/** Total path length in world px. */
export function pathLength(points) {
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    total += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
  }
  return total;
}

// Roughly calibrate: 32px tile ~= 1 meter, average walk speed 1.3 m/s
export function estimateWalkTimeSeconds(distancePx) {
  const meters = distancePx / WORLD.tileSize;
  const speedMps = 1.3;
  return Math.max(1, Math.round(meters / speedMps));
}

export function distancePxToMeters(distancePx) {
  return Math.round(distancePx / WORLD.tileSize);
}
