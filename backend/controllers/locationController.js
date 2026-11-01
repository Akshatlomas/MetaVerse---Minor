import * as locationService from '../services/locationService.js';

export async function listLocations(req, res, next) {
  try {
    const { type, category } = req.query;
    let locations = await locationService.getAllLocations();

    const filterType = type || category;
    if (filterType) {
      locations = locations.filter((loc) => loc.type.toLowerCase() === filterType.toLowerCase());
    }

    res.json({ locations, count: locations.length });
  } catch (err) {
    next(err);
  }
}

export async function getLocation(req, res, next) {
  try {
    const location = await locationService.getLocationById(req.params.id);
    if (!location) {
      return res.status(404).json({ error: `No location found with id "${req.params.id}"` });
    }
    res.json({ location });
  } catch (err) {
    next(err);
  }
}

export async function getCategories(req, res, next) {
  try {
    const locations = await locationService.getAllLocations();
    const map = new Map();

    locations.forEach((loc) => {
      if (!map.has(loc.type)) {
        map.set(loc.type, {
          type: loc.type,
          name: loc.categoryName || loc.type,
          count: 0
        });
      }
      map.get(loc.type).count++;
    });

    res.json({ categories: Array.from(map.values()) });
  } catch (err) {
    next(err);
  }
}
