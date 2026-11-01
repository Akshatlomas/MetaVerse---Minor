/**
 * campusLayout.js
 * -----------------------------------------------------------------------
 * Geometry and spatial configuration for IIIT Bhopal Metaverse.
 * World size: 1600 x 1400 with a 32px tile grid.
 * Roads, green zones, decorative elements (streetlights, trees, benches),
 * and player spawn coordinates.
 * -----------------------------------------------------------------------
 */

export const WORLD = {
  width: 1600,
  height: 1400,
  tileSize: 32
};

export const GRID = {
  cols: Math.floor(WORLD.width / WORLD.tileSize),
  rows: Math.floor(WORLD.height / WORLD.tileSize)
};

export const PLAYER_SPAWN = { x: 640, y: 1210 };

// Primary road network (asphalt surfaces)
export const ROADS = [
  // South Boulevard (near Main Entrance Gate)
  { x: 0, y: 1140, width: WORLD.width, height: 64 },
  // Central North-South Academic Spine
  { x: 600, y: 120, width: 80, height: 1120 },
  // Academic Connector Road (between Admin and Courtyard)
  { x: 0, y: 810, width: WORLD.width, height: 56 },
  // Lab & Academic Boulevard (between CCF/ECE and Placement/Hostel)
  { x: 0, y: 560, width: WORLD.width, height: 56 },
  // Residential Road (connecting Hostels)
  { x: 0, y: 340, width: WORLD.width, height: 50 },
  // West Ring Connector
  { x: 450, y: 340, width: 40, height: 850 },
  // East Ring Connector
  { x: 820, y: 340, width: 40, height: 850 },
  // Far East Library & Incubation Spur
  { x: 1140, y: 340, width: 40, height: 520 }
];

// Landscaped gardens and open greenery
export const GREEN_ZONES = [
  // Courtyard Lawn
  { x: 540, y: 870, width: 200, height: 140 },
  // West Lawn (near Sports Complex)
  { x: 60, y: 880, width: 220, height: 240 },
  // East Academic Garden (near Library & Nescafe)
  { x: 1040, y: 860, width: 180, height: 180 },
  // North Boys Hostel Garden
  { x: 60, y: 140, width: 160, height: 180 },
  // North Girls Hostel Garden
  { x: 1300, y: 140, width: 240, height: 180 },
  // Central Administrative Lawn
  { x: 500, y: 440, width: 120, height: 100 }
];

// Decorative streetlights (emit warm light at night!)
export const STREETLIGHTS = [
  { x: 600, y: 1200 },
  { x: 680, y: 1200 },
  { x: 600, y: 1050 },
  { x: 680, y: 1050 },
  { x: 600, y: 840 },
  { x: 680, y: 840 },
  { x: 600, y: 590 },
  { x: 680, y: 590 },
  { x: 600, y: 370 },
  { x: 680, y: 370 },
  { x: 450, y: 840 },
  { x: 820, y: 840 },
  { x: 1140, y: 680 },
  { x: 1140, y: 440 },
  { x: 320, y: 840 },
  { x: 920, y: 840 }
];

// Decorative trees
export const TREES = [
  { x: 510, y: 1210 },
  { x: 770, y: 1210 },
  { x: 560, y: 1100 },
  { x: 720, y: 1100 },
  { x: 560, y: 920 },
  { x: 720, y: 920 },
  { x: 560, y: 780 },
  { x: 720, y: 780 },
  { x: 560, y: 640 },
  { x: 720, y: 640 },
  { x: 140, y: 680 },
  { x: 140, y: 800 },
  { x: 1140, y: 920 },
  { x: 1260, y: 920 },
  { x: 1380, y: 920 },
  { x: 1460, y: 680 },
  { x: 1460, y: 440 },
  { x: 140, y: 420 },
  { x: 780, y: 220 },
  { x: 860, y: 220 }
];

// Campus boundary walls
export const BOUNDARY = {
  x: 0,
  y: 0,
  width: WORLD.width,
  height: WORLD.height,
  thickness: 24
};
