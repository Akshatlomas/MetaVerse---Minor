import { Router } from 'express';
import { requestNavigation, computeRouteWaypoints } from '../controllers/navigationController.js';

const router = Router();

router.post('/', requestNavigation);
router.post('/route', computeRouteWaypoints);

export default router;
