import { classroomManager } from '../services/classroomManager.js';
import { generateLiveKitToken, getRoomIdForClassroom } from '../services/livekitService.js';

/**
 * Controller for Interactive Virtual Classrooms at IIIT Bhopal Metaverse.
 */

// GET /api/classrooms
export function getAllClassrooms(req, res) {
  try {
    const list = classroomManager.getAllClassrooms();
    res.json({
      classrooms: list,
      count: list.length,
      audioIsolation: 'room-enforced',
      institute: 'IIIT Bhopal'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// GET /api/classrooms/:id
export function getClassroomById(req, res) {
  try {
    const { id } = req.params;
    const cr = classroomManager.getClassroom(id);
    if (!cr) {
      return res.status(404).json({ error: `Classroom '${id}' not found` });
    }
    res.json(cr);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// POST /api/classrooms/:id/token
export function generateToken(req, res) {
  try {
    const { id } = req.params;
    const { identity, name, role = 'student', metadata = {} } = req.body || {};

    if (!identity) {
      return res.status(400).json({ error: 'identity is required' });
    }

    const cr = classroomManager.getClassroom(id);
    if (!cr) {
      return res.status(404).json({ error: `Classroom '${id}' not found` });
    }

    // Role verification: check if teacher authorization matches or validate teacher credentials
    const isTeacher = role === 'teacher' || role === 'ta';

    const tokenData = generateLiveKitToken({
      identity,
      name: name || identity,
      classroomId: id,
      role: isTeacher ? 'teacher' : 'student',
      metadata: {
        ...metadata,
        classroomName: cr.name,
        buildingId: cr.buildingId
      }
    });

    res.json(tokenData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// POST /api/classrooms/:id/session/start
export function startSession(req, res) {
  try {
    const { id } = req.params;
    const { teacherIdentity, role, subject, topic } = req.body || {};

    if (!teacherIdentity) {
      return res.status(400).json({ error: 'teacherIdentity is required' });
    }

    if (role !== 'teacher') {
      return res.status(403).json({
        error: 'Forbidden: Only verified faculty instructors can start a live class session'
      });
    }

    const cr = classroomManager.startSession(id, teacherIdentity, subject, topic);
    res.json({
      message: 'Class session started successfully',
      classroom: cr
    });
  } catch (err) {
    res.status(err.message === 'Classroom not found' ? 404 : 500).json({ error: err.message });
  }
}

// POST /api/classrooms/:id/session/end
export function endSession(req, res) {
  try {
    const { id } = req.params;
    const { teacherIdentity, role } = req.body || {};

    if (!teacherIdentity) {
      return res.status(400).json({ error: 'teacherIdentity is required' });
    }

    if (role !== 'teacher') {
      return res.status(403).json({
        error: 'Forbidden: Only verified faculty instructors can end a live class session'
      });
    }

    const result = classroomManager.endSession(id, teacherIdentity);
    res.json({
      message: 'Class session ended. Attendance records archived.',
      ...result
    });
  } catch (err) {
    res.status(err.message === 'Classroom not found' ? 404 : 500).json({ error: err.message });
  }
}

// GET /api/classrooms/:id/attendance
export function getAttendance(req, res) {
  try {
    const { id } = req.params;
    const { format } = req.query;

    const data = classroomManager.getAttendance(id);

    if (format === 'csv') {
      const records = data.attendanceRecords || [];
      const header = 'Identity,Name,Role,RollNumber,JoinedAt,LeftAt,DurationMinutes\n';
      const rows = records
        .map(
          (r) =>
            `"${r.identity}","${r.name}","${r.role}","${r.rollNo}","${r.joinedAt}","${r.leftAt || 'Active'}","${r.durationMinutes || 0}"`
        )
        .join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="attendance-${id}-${Date.now()}.csv"`);
      return res.send(header + rows);
    }

    res.json(data);
  } catch (err) {
    res.status(err.message === 'Classroom not found' ? 404 : 500).json({ error: err.message });
  }
}

// POST /api/classrooms/:id/questions
export function askQuestion(req, res) {
  try {
    const { id } = req.params;
    const { studentName, studentIdentity, rollNo, question } = req.body || {};

    if (!question || !studentIdentity) {
      return res.status(400).json({ error: 'studentIdentity and question text are required' });
    }

    const newQ = classroomManager.addQuestion(id, {
      studentName,
      studentIdentity,
      rollNo,
      question
    });

    res.status(201).json(newQ);
  } catch (err) {
    res.status(err.message === 'Classroom not found' ? 404 : 500).json({ error: err.message });
  }
}

// POST /api/classrooms/:id/questions/:questionId/answer
export function answerQuestion(req, res) {
  try {
    const { id, questionId } = req.params;
    const { answer, answeredBy, role } = req.body || {};

    if (role !== 'teacher') {
      return res.status(403).json({ error: 'Forbidden: Only teachers can answer questions in the official queue' });
    }

    if (!answer) {
      return res.status(400).json({ error: 'answer is required' });
    }

    const answered = classroomManager.answerQuestion(id, questionId, answer, answeredBy);
    res.json(answered);
  } catch (err) {
    res.status(err.message === 'Question not found' ? 404 : 500).json({ error: err.message });
  }
}

// POST /api/classrooms/:id/hands
export function handleHandRaise(req, res) {
  try {
    const { id } = req.params;
    const { action = 'raise', studentIdentity, name, rollNo } = req.body || {};

    if (!studentIdentity) {
      return res.status(400).json({ error: 'studentIdentity is required' });
    }

    if (action === 'raise') {
      const hand = classroomManager.raiseHand(id, { identity: studentIdentity, name, rollNo });
      return res.json({ action: 'raised', hand });
    } else if (action === 'lower') {
      const lowered = classroomManager.lowerHand(id, studentIdentity);
      return res.json({ action: 'lowered', success: lowered });
    } else {
      return res.status(400).json({ error: "Invalid action. Use 'raise' or 'lower'" });
    }
  } catch (err) {
    res.status(err.message === 'Classroom not found' ? 404 : 500).json({ error: err.message });
  }
}
