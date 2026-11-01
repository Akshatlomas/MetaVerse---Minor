import { Router } from 'express';
import { listLocations, getLocation, getCategories } from '../controllers/locationController.js';

const router = Router();

router.get('/', listLocations);
router.get('/categories', getCategories);
router.get('/:id', getLocation);

export default router;
