import { Router } from 'express';
import {
  getAllClassrooms,
  getClassroomById,
  generateToken,
  startSession,
  endSession,
  getAttendance,
  askQuestion,
  answerQuestion,
  handleHandRaise
} from '../controllers/classroomController.js';

const router = Router();

router.get('/', getAllClassrooms);
router.get('/:id', getClassroomById);
router.post('/:id/token', generateToken);
router.post('/:id/session/start', startSession);
router.post('/:id/session/end', endSession);
router.get('/:id/attendance', getAttendance);
router.post('/:id/questions', askQuestion);
router.post('/:id/questions/:questionId/answer', answerQuestion);
router.post('/:id/hands', handleHandRaise);

export default router;
