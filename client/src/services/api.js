/**
 * api.js
 * Frontend API client communicating with the Express backend.
 * Provides fallback implementations when the backend is offline so the
 * virtual campus remains demonstrable under all conditions.
 */

import { LOCATIONS, getLocationById, searchLocations, getCategories } from '../data/locations.js';

const BASE_URL = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });

  const contentType = res.headers.get('content-type') || '';
  const body = contentType.includes('application/json') ? await res.json() : await res.text();

  if (!res.ok) {
    const message = (body && body.error) || `Request failed: ${res.status}`;
    throw new Error(message);
  }
  return body;
}

export const api = {
  getHealth: async () => {
    try {
      return await request('/health');
    } catch {
      return { status: 'fallback', mode: 'demo', institute: 'IIIT Bhopal' };
    }
  },

  getCampusConfig: async () => {
    try {
      return await request('/config');
    } catch {
      return { campusName: 'IIIT Bhopal Metaverse', world: { width: 1600, height: 1400, tileSize: 32 } };
    }
  },

  getLocations: async (type) => {
    try {
      const q = type ? `?type=${encodeURIComponent(type)}` : '';
      return await request(`/locations${q}`);
    } catch {
      let list = LOCATIONS;
      if (type) list = list.filter((l) => l.type === type);
      return { locations: list, count: list.length };
    }
  },

  getLocation: async (id) => {
    try {
      return await request(`/locations/${id}`);
    } catch {
      return { location: getLocationById(id) };
    }
  },

  getCategories: async () => {
    try {
      return await request('/locations/categories');
    } catch {
      return { categories: getCategories() };
    }
  },

  search: async (q) => {
    try {
      return await request(`/search?q=${encodeURIComponent(q)}`);
    } catch {
      return { query: q, results: searchLocations(q) };
    }
  },

  requestNavigation: async (from, to) => {
    try {
      return await request('/navigation', {
        method: 'POST',
        body: JSON.stringify({ from, to })
      });
    } catch (err) {
      const fromLoc = getLocationById(from);
      const toLoc = getLocationById(to);
      if (!fromLoc || !toLoc) throw err;
      const distPx = Math.hypot(toLoc.x - fromLoc.x, toLoc.y - fromLoc.y);
      const distanceM = Math.round(distPx / 32);
      return {
        from: fromLoc.id,
        to: toLoc.id,
        distanceM,
        etaSeconds: Math.max(1, Math.round(distanceM / 1.3))
      };
    }
  },

  computeRouteWaypoints: async (fromX, fromY, toId) => {
    try {
      return await request('/navigation/route', {
        method: 'POST',
        body: JSON.stringify({ fromX, fromY, toId })
      });
    } catch {
      return { success: false };
    }
  },

  askAssistant: (message, context = {}) =>
    request('/assistant', {
      method: 'POST',
      body: JSON.stringify({ message, context })
    }),

  getFavorites: async () => {
    try {
      return await request('/favorites');
    } catch {
      return { favorites: [getLocationById('central-library'), getLocationById('food-court')].filter(Boolean) };
    }
  },

  addFavorite: async (locationId) => {
    try {
      return await request('/favorites', {
        method: 'POST',
        body: JSON.stringify({ locationId })
      });
    } catch {
      return { message: 'Saved to favorites (offline)', location: getLocationById(locationId) };
    }
  },

  removeFavorite: async (locationId) => {
    try {
      return await request(`/favorites/${locationId}`, { method: 'DELETE' });
    } catch {
      return { message: 'Removed from favorites (offline)', locationId };
    }
  },

  // Interactive Virtual Classrooms API
  getClassrooms: async () => {
    try {
      return await request('/classrooms');
    } catch {
      return { classrooms: [], count: 0 };
    }
  },

  getClassroom: async (id) => {
    return await request(`/classrooms/${id}`);
  },

  getClassroomToken: async (id, userData) => {
    return await request(`/classrooms/${id}/token`, {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },

  startClassroomSession: async (id, data) => {
    return await request(`/classrooms/${id}/session/start`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  endClassroomSession: async (id, data) => {
    return await request(`/classrooms/${id}/session/end`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  getClassroomAttendance: async (id, format = 'json') => {
    return await request(`/classrooms/${id}/attendance?format=${format}`);
  },

  askClassroomQuestion: async (id, data) => {
    return await request(`/classrooms/${id}/questions`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  answerClassroomQuestion: async (id, questionId, data) => {
    return await request(`/classrooms/${id}/questions/${questionId}/answer`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  raiseClassroomHand: async (id, data) => {
    return await request(`/classrooms/${id}/hands`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
};
