import { test, describe } from 'node:test';
import assert from 'node:assert';
import { EventEmitter } from 'node:events';
import { app } from '../server.js';
import * as locationService from '../services/locationService.js';
import { calculateRoute } from '../services/pathfindingService.js';
import { generateAssistantReply } from '../services/aiProvider.js';

// In-memory request dispatcher for Express with async stream emission
function request(app, { method = 'GET', url = '/', body = null, headers = {} }) {
  return new Promise((resolve) => {
    const req = new EventEmitter();
    req.method = method;
    req.url = url;
    req.body = body || {};
    req.headers = {
      'content-type': 'application/json',
      ...headers
    };

    const res = new EventEmitter();
    res.statusCode = 200;
    const responseHeaders = {};
    let responseBody = '';

    res.status = function (code) {
      this.statusCode = code;
      return this;
    };

    res.setHeader = function (k, v) {
      responseHeaders[k.toLowerCase()] = v;
      return this;
    };

    res.getHeader = function (k) {
      return responseHeaders[k.toLowerCase()];
    };

    res.json = function (obj) {
      responseHeaders['content-type'] = 'application/json';
      responseBody = JSON.stringify(obj);
      this.emit('finish');
      resolve({
        status: this.statusCode,
        headers: responseHeaders,
        body: obj
      });
      return this;
    };

    res.send = function (data) {
      responseBody = typeof data === 'object' ? JSON.stringify(data) : String(data);
      this.emit('finish');
      let parsed = responseBody;
      try {
        parsed = JSON.parse(responseBody);
      } catch {}
      resolve({
        status: this.statusCode,
        headers: responseHeaders,
        body: parsed
      });
      return this;
    };

    res.end = function (chunk) {
      if (chunk) responseBody += chunk;
      this.emit('finish');
      let parsed = responseBody;
      try {
        parsed = JSON.parse(responseBody);
      } catch {}
      resolve({
        status: this.statusCode,
        headers: responseHeaders,
        body: parsed
      });
      return this;
    };

    // Run express application
    app(req, res);

    // Give express middleware time to register 'data' & 'end' listeners
    setImmediate(() => {
      if (body) {
        req.emit('data', Buffer.from(JSON.stringify(body)));
      }
      req.emit('end');
    });
  });
}

describe('IIIT Bhopal Metaverse - Backend API & Services Test Suite', () => {
  test('GET /api/health returns valid system information in Demo Mode', async () => {
    const res = await request(app, { method: 'GET', url: '/api/health' });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.status, 'ok');
    assert.strictEqual(res.body.institute, 'IIIT Bhopal');
    assert.strictEqual(res.body.mode, 'demo');
    assert.ok(res.body.timestamp);
  });

  test('GET /api/config returns campus boundaries and tileSize', async () => {
    const res = await request(app, { method: 'GET', url: '/api/config' });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.campusName, 'IIIT Bhopal Metaverse');
    assert.strictEqual(res.body.world.width, 1600);
    assert.strictEqual(res.body.world.height, 1400);
  });

  test('GET /api/locations returns 14 campus locations with required properties', async () => {
    const res = await request(app, { method: 'GET', url: '/api/locations' });
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.body.locations));
    assert.strictEqual(res.body.locations.length, 14);
    assert.strictEqual(res.body.count, 14);

    const first = res.body.locations[0];
    assert.ok(first.id);
    assert.ok(first.name);
    assert.ok(first.type);
    assert.ok(typeof first.x === 'number');
    assert.ok(typeof first.y === 'number');
    assert.ok(Array.isArray(first.services));
  });

  test('GET /api/locations?type=academic filters correctly', async () => {
    const res = await request(app, { method: 'GET', url: '/api/locations?type=academic' });
    assert.strictEqual(res.status, 200);
    assert.ok(res.body.locations.length > 0);
    res.body.locations.forEach((loc) => {
      assert.strictEqual(loc.type, 'academic');
    });
  });

  test('GET /api/locations/categories lists all campus categories', async () => {
    const res = await request(app, { method: 'GET', url: '/api/locations/categories' });
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.body.categories));
    const types = res.body.categories.map((c) => c.type);
    assert.ok(types.includes('academic'));
    assert.ok(types.includes('hostel'));
    assert.ok(types.includes('food'));
    assert.ok(types.includes('sports'));
  });

  test('GET /api/locations/:id returns specific building or 404', async () => {
    const resFound = await request(app, { method: 'GET', url: '/api/locations/central-library' });
    assert.strictEqual(resFound.status, 200);
    assert.strictEqual(resFound.body.location.id, 'central-library');
    assert.strictEqual(resFound.body.location.name, 'Dr. APJ Abdul Kalam Central Library');

    const resNotFound = await request(app, { method: 'GET', url: '/api/locations/imaginary-hall' });
    assert.strictEqual(resNotFound.status, 404);
    assert.ok(resNotFound.body.error);
  });

  test('GET /api/search finds locations by name, keywords and description', async () => {
    const resLib = await request(app, { method: 'GET', url: '/api/search?q=library' });
    assert.strictEqual(resLib.status, 200);
    assert.ok(resLib.body.results.length >= 1);
    assert.strictEqual(resLib.body.results[0].id, 'central-library');

    const resCoding = await request(app, { method: 'GET', url: '/api/search?q=coding' });
    assert.strictEqual(resCoding.status, 200);
    assert.ok(resCoding.body.results.length >= 1);

    const resEmpty = await request(app, { method: 'GET', url: '/api/search?q=' });
    assert.strictEqual(resEmpty.status, 200);
    assert.strictEqual(resEmpty.body.results.length, 0);
  });

  test('A* pathfinding correctly computes route from Main Gate to Central Library', () => {
    const route = calculateRoute(640, 1200, 1260, 680);
    assert.strictEqual(route.found, true);
    assert.ok(route.path.length >= 2);
    assert.ok(route.distanceM > 0);
    assert.ok(route.etaSeconds > 0);
    assert.ok(route.waypointsCount >= 2);
  });

  test('POST /api/navigation returns distance and ETA between locations', async () => {
    const res = await request(app, {
      method: 'POST',
      url: '/api/navigation',
      body: { from: 'main-gate', to: 'cse-it-block' }
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.from, 'main-gate');
    assert.strictEqual(res.body.to, 'cse-it-block');
    assert.ok(res.body.distanceM > 0);
    assert.ok(res.body.etaSeconds > 0);
  });

  test('POST /api/navigation/route computes waypoints from player coords to building', async () => {
    const res = await request(app, {
      method: 'POST',
      url: '/api/navigation/route',
      body: { fromX: 640, fromY: 1210, toId: 'food-court' }
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(Array.isArray(res.body.path));
    assert.ok(res.body.distanceM > 0);
  });

  test('POST /api/assistant answers questions in mock/fallback mode', async () => {
    const locations = await locationService.getAllLocations();

    const reply1 = await generateAssistantReply('Where is the library?', { locations });
    assert.ok(reply1.reply.toLowerCase().includes('library'));
    assert.strictEqual(reply1.action?.action, 'show_location');
    assert.strictEqual(reply1.action?.location, 'central-library');

    const reply2 = await generateAssistantReply('Take me to the cafeteria', { locations });
    assert.strictEqual(reply2.action?.action, 'navigate');
    assert.strictEqual(reply2.action?.destination, 'food-court');

    const reply3 = await generateAssistantReply('Where can I study?', { locations });
    assert.ok(reply3.reply.toLowerCase().includes('library'));

    const reply4 = await generateAssistantReply('Tell me about IIIT Bhopal', { locations });
    assert.ok(reply4.reply.includes('Institute of National Importance'));
  });

  test('Favorites API handles GET, POST, DELETE in Demo Mode', async () => {
    const resGet = await request(app, { method: 'GET', url: '/api/favorites' });
    assert.strictEqual(resGet.status, 200);
    assert.ok(Array.isArray(resGet.body.favorites));

    const resPost = await request(app, {
      method: 'POST',
      url: '/api/favorites',
      body: { locationId: 'cse-it-block' }
    });
    assert.strictEqual(resPost.status, 201);
    assert.strictEqual(resPost.body.location.id, 'cse-it-block');

    const resDel = await request(app, {
      method: 'DELETE',
      url: '/api/favorites/cse-it-block'
    });
    assert.strictEqual(resDel.status, 200);
    assert.strictEqual(resDel.body.locationId, 'cse-it-block');
  });

  test('Input validation: POST /api/navigation rejects missing parameters with 400', async () => {
    const res = await request(app, {
      method: 'POST',
      url: '/api/navigation',
      body: { from: 'main-gate' } // missing 'to'
    });
    assert.strictEqual(res.status, 400);
    assert.ok(res.body.error.includes('Both "from" and "to"'));
  });

  test('Invalid destination handling: POST /api/navigation returns 404 for unknown building', async () => {
    const res = await request(app, {
      method: 'POST',
      url: '/api/navigation',
      body: { from: 'main-gate', to: 'non-existent-hall' }
    });
    assert.strictEqual(res.status, 404);
    assert.ok(res.body.error.includes('Unknown destination'));
  });

  test('Input validation: POST /api/favorites rejects empty body with 400', async () => {
    const res = await request(app, {
      method: 'POST',
      url: '/api/favorites',
      body: {}
    });
    assert.strictEqual(res.status, 400);
    assert.ok(res.body.error.includes('locationId is required'));
  });

  test('Assistant handles arbitrary unmatched queries gracefully in fallback mode', async () => {
    const locations = await locationService.getAllLocations();
    const reply = await generateAssistantReply('xyzqwerty unknown question', { locations });
    assert.ok(reply.reply);
    assert.strictEqual(reply.action, null);
  });
});
