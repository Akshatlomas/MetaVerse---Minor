import Location from '../models/Location.js';
import { isDbConnected } from '../config/db.js';
import { MOCK_LOCATIONS } from '../data/mockLocations.js';

/**
 * locationService
 * Single place that decides whether to read from MongoDB or the mock
 * dataset, so controllers never need to know which mode the app is in.
 */

export async function getAllLocations() {
  if (isDbConnected()) {
    const docs = await Location.find().lean();
    if (docs.length > 0) return docs;
  }
  return MOCK_LOCATIONS;
}

export async function getLocationById(id) {
  if (isDbConnected()) {
    const doc = await Location.findOne({ id }).lean();
    if (doc) return doc;
  }
  return MOCK_LOCATIONS.find((loc) => loc.id === id) || null;
}

export async function searchLocations(query) {
  const all = await getAllLocations();
  const q = (query || '').trim().toLowerCase();
  if (!q) return [];
  return all.filter((loc) => {
    if (!loc.searchable) return false;
    const inName = (loc.name || '').toLowerCase().includes(q);
    const inType = (loc.type || '').toLowerCase().includes(q);
    const inCategory = (loc.categoryName || '').toLowerCase().includes(q);
    const inDesc = (loc.description || '').toLowerCase().includes(q);
    const inServices = (loc.services || []).some((s) => s.toLowerCase().includes(q));
    const inKeywords = (loc.keywords || []).some((k) => k.toLowerCase().includes(q));
    return inName || inType || inCategory || inDesc || inServices || inKeywords;
  });
}
