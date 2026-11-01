import { Router } from 'express';
import { getCampusInfo } from '../controllers/campusController.js';

const router = Router();

router.get('/', getCampusInfo);

export default router;
