import { isDbConnected } from '../config/db.js';
import * as locationService from '../services/locationService.js';
import User from '../models/User.js';

// In-memory store for Demo Mode
let inMemoryFavorites = ['central-library', 'food-court'];

export async function getFavorites(req, res, next) {
  try {
    const userId = req.headers['x-user-id'] || 'demo-student';

    if (isDbConnected()) {
      const user = await User.findOne({ email: `${userId}@iiitbhopal.ac.in` }).lean();
      const ids = (user && user.avatarConfig && user.avatarConfig.savedLocations) || [];
      const locations = await Promise.all(ids.map((id) => locationService.getLocationById(id)));
      return res.json({ favorites: locations.filter(Boolean), mode: 'database' });
    }

    // Demo Mode: return in-memory favorites
    const locations = await Promise.all(inMemoryFavorites.map((id) => locationService.getLocationById(id)));
    res.json({ favorites: locations.filter(Boolean), mode: 'demo' });
  } catch (err) {
    next(err);
  }
}

export async function addFavorite(req, res, next) {
  try {
    const { locationId } = req.body;
    if (!locationId) {
      return res.status(400).json({ error: 'locationId is required' });
    }

    const loc = await locationService.getLocationById(locationId);
    if (!loc) {
      return res.status(404).json({ error: `Location with id "${locationId}" not found` });
    }

    const userId = req.headers['x-user-id'] || 'demo-student';

    if (isDbConnected()) {
      let user = await User.findOne({ email: `${userId}@iiitbhopal.ac.in` });
      if (!user) {
        user = new User({
          name: 'Demo Student',
          email: `${userId}@iiitbhopal.ac.in`,
          role: 'student',
          avatarConfig: { savedLocations: [] }
        });
      }
      const list = user.avatarConfig?.savedLocations || [];
      if (!list.includes(locationId)) {
        list.push(locationId);
        user.avatarConfig = { ...user.avatarConfig, savedLocations: list };
        await user.save();
      }
      return res.status(201).json({ message: 'Saved to favorites', location: loc, mode: 'database' });
    }

    // Demo Mode
    if (!inMemoryFavorites.includes(locationId)) {
      inMemoryFavorites.push(locationId);
    }
    res.status(201).json({ message: 'Saved to favorites (Demo Mode)', location: loc, mode: 'demo' });
  } catch (err) {
    next(err);
  }
}

export async function removeFavorite(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.headers['x-user-id'] || 'demo-student';

    if (isDbConnected()) {
      const user = await User.findOne({ email: `${userId}@iiitbhopal.ac.in` });
      if (user && user.avatarConfig?.savedLocations) {
        user.avatarConfig.savedLocations = user.avatarConfig.savedLocations.filter((lId) => lId !== id);
        await user.save();
      }
      return res.json({ message: 'Removed from favorites', locationId: id, mode: 'database' });
    }

    // Demo Mode
    inMemoryFavorites = inMemoryFavorites.filter((lId) => lId !== id);
    res.json({ message: 'Removed from favorites (Demo Mode)', locationId: id, mode: 'demo' });
  } catch (err) {
    next(err);
  }
}
