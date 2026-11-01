import { Router } from 'express';
import { askAssistant } from '../controllers/assistantController.js';
import { requireFields } from '../middleware/validate.js';
import { assistantRateLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/', assistantRateLimiter, requireFields(['message']), askAssistant);

export default router;
