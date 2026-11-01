import { getRoomIdForClassroom } from './livekitService.js';

/**
 * Default initial catalog of classrooms available on IIIT Bhopal Metaverse.
 */
const INITIAL_CLASSROOMS = [
  {
    id: 'lh101',
    name: 'Lecture Hall 101 (LHC-101)',
    buildingId: 'lecture-hall-complex',
    buildingName: 'Lecture Hall Complex (Block A)',
    floor: 'Ground Floor, Wing A',
    capacity: 120,
    type: 'Smart Tiered Lecture Theater',
    currentClass: {
      code: 'CS-301',
      subject: 'Design & Analysis of Algorithms',
      faculty: 'Dr. R. K. Sharma',
      facultyId: 'prof_rk_sharma',
      time: '10:00 AM - 11:30 AM',
      topic: 'Dynamic Programming & Graph Traversal (A* & Dijkstra)'
    },
    equipment: ['4K Interactive Smartboard', 'Acoustic Array Mic', 'Dual 4K Projectors', 'Live Lecture Streaming Unit'],
    accessibilityFeatures: ['Tactile Floor Path', 'Step-Free Ramp Entrance', 'Row 1 Wheelchair Desks (6)', 'Assistive Listening Loop'],
    status: 'live', // 'idle' | 'live' | 'ended'
    sessionStartedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString()
  },
  {
    id: 'lh102',
    name: 'Lecture Hall 102 (LHC-102)',
    buildingId: 'lecture-hall-complex',
    buildingName: 'Lecture Hall Complex (Block A)',
    floor: '1st Floor, Wing A',
    capacity: 90,
    type: 'Multimedia Seminar Hall',
    currentClass: {
      code: 'CS-304',
      subject: 'Operating Systems & Virtualization',
      faculty: 'Dr. Anita Roy',
      facultyId: 'prof_anita_roy',
      time: '11:45 AM - 01:15 PM',
      topic: 'Process Scheduling, Semaphores & Memory Paging'
    },
    equipment: ['Multi-Touch Smartboard', 'Ceiling Microphone Array', 'Podium Document Camera'],
    accessibilityFeatures: ['Elevator Accessible', 'Front-Row Accessible Workstations', 'Screen-Reader Friendly LAN Pods'],
    status: 'idle',
    sessionStartedAt: null
  },
  {
    id: 'ac201',
    name: 'Aryabhata Classroom 201 (AC-201)',
    buildingId: 'aryabhata-classroom-complex',
    buildingName: 'Aryabhata Classroom Complex (Block B)',
    floor: '2nd Floor, Block B',
    capacity: 80,
    type: 'Advanced AI & ML Interactive Studio',
    currentClass: {
      code: 'AI-401',
      subject: 'Machine Learning & Neural Architectures',
      faculty: 'Prof. V. K. Gupta',
      facultyId: 'prof_vk_gupta',
      time: '02:00 PM - 03:30 PM',
      topic: 'Convolutional Networks & Vision Transformers'
    },
    equipment: ['Dual Interactive OLED Displays', 'GPU Terminal Hubs', 'Surround Beamforming Microphones'],
    accessibilityFeatures: ['Wide Double Doors (120cm)', 'Braille Room Signage', 'Height-Adjustable Desks'],
    status: 'live',
    sessionStartedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString()
  },
  {
    id: 'ac202',
    name: 'Aryabhata Classroom 202 (AC-202)',
    buildingId: 'aryabhata-classroom-complex',
    buildingName: 'Aryabhata Classroom Complex (Block B)',
    floor: '2nd Floor, Block B',
    capacity: 75,
    type: 'Interactive Computing & WebRTC Studio',
    currentClass: {
      code: 'CS-307',
      subject: 'Computer Networks & WebRTC Architectures',
      faculty: 'Dr. Priya Nair',
      facultyId: 'prof_priya_nair',
      time: '03:45 PM - 05:15 PM',
      topic: 'Real-Time Protocols, ICE Candidates & Selective Forwarding'
    },
    equipment: ['Smart Whiteboard', 'Studio Monitor Speakers', 'Digital Podium'],
    accessibilityFeatures: ['Level Threshold Entrance', 'Ramped Aisles', 'Hearing Assistance System'],
    status: 'idle',
    sessionStartedAt: null
  }
];

class ClassroomManager {
  constructor() {
    this.classrooms = new Map();
    // roomId -> Set of participant objects
    this.roomParticipants = new Map();
    // roomId -> Array of chat message objects
    this.roomMessages = new Map();
    // roomId -> Array of Q&A question objects
    this.roomQuestions = new Map();
    // roomId -> Map(participantIdentity -> raisedHandInfo)
    this.roomHands = new Map();
    // roomId -> Array of historical attendance objects
    this.attendanceHistory = new Map();
    // roomId -> Whiteboard state { strokes: [], isLocked: false }
    this.whiteboardState = new Map();

    this.initialize();
  }

  initialize() {
    INITIAL_CLASSROOMS.forEach((cr) => {
      const roomId = getRoomIdForClassroom(cr.id);
      this.classrooms.set(cr.id, {
        ...cr,
        roomId
      });
      this.roomParticipants.set(roomId, new Map());
      this.roomMessages.set(roomId, [
        {
          id: `msg_init_${cr.id}`,
          sender: 'Campus System',
          role: 'system',
          text: `Welcome to ${cr.name}. Audio isolation active. Classroom communications are strictly private to this room.`,
          timestamp: new Date().toISOString()
        }
      ]);
      this.roomQuestions.set(roomId, [
        {
          id: `q_init_${cr.id}`,
          studentName: 'Rohan Mehra',
          rollNo: '2023CSE018',
          question: `Could you please clarify the practical complexity of the search heuristic discussed in slide 3?`,
          answered: true,
          answer: `Yes Rohan, A* maintains O(b^d) worst-case time depending on heuristic admissibility, as we will demonstrate on the smartboard.`,
          answeredBy: cr.currentClass?.faculty || 'Instructor',
          createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString()
        }
      ]);
      this.roomHands.set(roomId, new Map());
      this.attendanceHistory.set(roomId, []);
      this.whiteboardState.set(roomId, {
        strokes: [],
        isLocked: false
      });
    });
  }

  getAllClassrooms() {
    return Array.from(this.classrooms.values()).map((cr) => {
      const participants = this.roomParticipants.get(cr.roomId) || new Map();
      return {
        ...cr,
        activeParticipantsCount: participants.size
      };
    });
  }

  getClassroom(id) {
    const cr = this.classrooms.get(id);
    if (!cr) return null;
    const participants = this.roomParticipants.get(cr.roomId) || new Map();
    return {
      ...cr,
      activeParticipantsCount: participants.size,
      participants: Array.from(participants.values())
    };
  }

  joinRoom(classroomId, user) {
    const cr = this.classrooms.get(classroomId);
    if (!cr) throw new Error(`Classroom ${classroomId} not found`);

    const roomId = cr.roomId;
    const participants = this.roomParticipants.get(roomId);

    const participantInfo = {
      identity: user.identity,
      name: user.name || user.identity,
      role: user.role || 'student', // 'teacher' | 'student' | 'ta'
      rollNo: user.rollNo || '2023CSE' + Math.floor(100 + Math.random() * 900),
      isTeacher: user.role === 'teacher',
      isMuted: true, // starts muted for safety
      isCameraOn: false,
      isScreenSharing: false,
      joinedAt: new Date().toISOString(),
      socketId: user.socketId || null
    };

    participants.set(user.identity, participantInfo);

    // Record in attendance log
    const history = this.attendanceHistory.get(roomId) || [];
    const existing = history.find((h) => h.identity === user.identity);
    if (!existing) {
      history.push({
        identity: user.identity,
        name: participantInfo.name,
        role: participantInfo.role,
        rollNo: participantInfo.rollNo,
        joinedAt: participantInfo.joinedAt,
        leftAt: null,
        durationMinutes: 0
      });
      this.attendanceHistory.set(roomId, history);
    }

    return {
      classroom: cr,
      participant: participantInfo,
      roomParticipants: Array.from(participants.values()),
      messages: this.roomMessages.get(roomId) || [],
      questions: this.roomQuestions.get(roomId) || [],
      raisedHands: Array.from(this.roomHands.get(roomId).values()),
      whiteboard: this.whiteboardState.get(roomId)
    };
  }

  leaveRoom(classroomId, identity) {
    const cr = this.classrooms.get(classroomId);
    if (!cr) return null;

    const roomId = cr.roomId;
    const participants = this.roomParticipants.get(roomId);
    if (participants && participants.has(identity)) {
      const p = participants.get(identity);
      participants.delete(identity);

      // Lower hand if was raised
      const hands = this.roomHands.get(roomId);
      if (hands) hands.delete(identity);

      // Update attendance log
      const history = this.attendanceHistory.get(roomId) || [];
      const entry = history.find((h) => h.identity === identity && !h.leftAt);
      if (entry) {
        entry.leftAt = new Date().toISOString();
        const durationMs = new Date(entry.leftAt) - new Date(entry.joinedAt);
        entry.durationMinutes = Math.max(1, Math.round(durationMs / 60000));
      }

      return {
        identity,
        name: p.name,
        role: p.role,
        remainingParticipantsCount: participants.size
      };
    }
    return null;
  }

  updateMediaState(classroomId, identity, updates) {
    const cr = this.classrooms.get(classroomId);
    if (!cr) return null;

    const participants = this.roomParticipants.get(cr.roomId);
    if (participants && participants.has(identity)) {
      const p = participants.get(identity);
      if (typeof updates.isMuted === 'boolean') p.isMuted = updates.isMuted;
      if (typeof updates.isCameraOn === 'boolean') p.isCameraOn = updates.isCameraOn;
      if (typeof updates.isScreenSharing === 'boolean') p.isScreenSharing = updates.isScreenSharing;
      return p;
    }
    return null;
  }

  startSession(classroomId, teacherIdentity, subject, topic) {
    const cr = this.classrooms.get(classroomId);
    if (!cr) throw new Error('Classroom not found');

    cr.status = 'live';
    cr.sessionStartedAt = new Date().toISOString();
    if (subject) cr.currentClass.subject = subject;
    if (topic) cr.currentClass.topic = topic;

    // Reset whiteboard and active hands
    this.whiteboardState.set(cr.roomId, { strokes: [], isLocked: false });
    this.roomHands.get(cr.roomId)?.clear();

    return cr;
  }

  endSession(classroomId, teacherIdentity) {
    const cr = this.classrooms.get(classroomId);
    if (!cr) throw new Error('Classroom not found');

    cr.status = 'ended';
    const endedAt = new Date().toISOString();

    // Mark all active attendance logs as left
    const history = this.attendanceHistory.get(cr.roomId) || [];
    history.forEach((h) => {
      if (!h.leftAt) {
        h.leftAt = endedAt;
        const durationMs = new Date(endedAt) - new Date(h.joinedAt);
        h.durationMinutes = Math.max(1, Math.round(durationMs / 60000));
      }
    });

    return {
      classroom: cr,
      endedAt,
      totalAttendees: history.length
    };
  }

  addMessage(classroomId, message) {
    const cr = this.classrooms.get(classroomId);
    if (!cr) throw new Error('Classroom not found');

    const messages = this.roomMessages.get(cr.roomId) || [];
    const newMsg = {
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      sender: message.sender,
      role: message.role || 'student',
      text: String(message.text || '').trim(),
      timestamp: new Date().toISOString()
    };
    messages.push(newMsg);
    // Keep max 200 messages per room
    if (messages.length > 200) messages.shift();
    return newMsg;
  }

  addQuestion(classroomId, questionData) {
    const cr = this.classrooms.get(classroomId);
    if (!cr) throw new Error('Classroom not found');

    const questions = this.roomQuestions.get(cr.roomId) || [];
    const newQ = {
      id: `q_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      studentName: questionData.studentName || 'Student',
      studentIdentity: questionData.studentIdentity,
      rollNo: questionData.rollNo || '2023CSE---',
      question: String(questionData.question || '').trim(),
      answered: false,
      answer: null,
      answeredBy: null,
      createdAt: new Date().toISOString()
    };
    questions.push(newQ);
    return newQ;
  }

  answerQuestion(classroomId, questionId, answer, answeredBy) {
    const cr = this.classrooms.get(classroomId);
    if (!cr) throw new Error('Classroom not found');

    const questions = this.roomQuestions.get(cr.roomId) || [];
    const targetQ = questions.find((q) => q.id === questionId);
    if (!targetQ) throw new Error('Question not found');

    targetQ.answered = true;
    targetQ.answer = String(answer || '').trim();
    targetQ.answeredBy = answeredBy || 'Instructor';
    targetQ.answeredAt = new Date().toISOString();
    return targetQ;
  }

  raiseHand(classroomId, student) {
    const cr = this.classrooms.get(classroomId);
    if (!cr) throw new Error('Classroom not found');

    const hands = this.roomHands.get(cr.roomId);
    const handInfo = {
      identity: student.identity,
      name: student.name,
      rollNo: student.rollNo,
      raisedAt: new Date().toISOString(),
      acknowledged: false
    };
    hands.set(student.identity, handInfo);
    return handInfo;
  }

  lowerHand(classroomId, studentIdentity) {
    const cr = this.classrooms.get(classroomId);
    if (!cr) throw new Error('Classroom not found');

    const hands = this.roomHands.get(cr.roomId);
    if (hands && hands.has(studentIdentity)) {
      hands.delete(studentIdentity);
      return true;
    }
    return false;
  }

  acknowledgeHand(classroomId, studentIdentity) {
    const cr = this.classrooms.get(classroomId);
    if (!cr) throw new Error('Classroom not found');

    const hands = this.roomHands.get(cr.roomId);
    if (hands && hands.has(studentIdentity)) {
      const h = hands.get(studentIdentity);
      h.acknowledged = true;
      return h;
    }
    return null;
  }

  addWhiteboardStroke(classroomId, stroke) {
    const cr = this.classrooms.get(classroomId);
    if (!cr) return null;

    const wb = this.whiteboardState.get(cr.roomId);
    if (wb) {
      if (wb.isLocked && stroke.role !== 'teacher') {
        throw new Error('Whiteboard editing is locked by the instructor');
      }
      wb.strokes.push(stroke);
      // Keep max 1500 strokes
      if (wb.strokes.length > 1500) wb.strokes.shift();
      return stroke;
    }
    return null;
  }

  clearWhiteboard(classroomId) {
    const cr = this.classrooms.get(classroomId);
    if (!cr) return;
    const wb = this.whiteboardState.get(cr.roomId);
    if (wb) {
      wb.strokes = [];
    }
  }

  setWhiteboardLock(classroomId, isLocked) {
    const cr = this.classrooms.get(classroomId);
    if (!cr) return false;
    const wb = this.whiteboardState.get(cr.roomId);
    if (wb) {
      wb.isLocked = Boolean(isLocked);
      return wb.isLocked;
    }
    return false;
  }

  getAttendance(classroomId) {
    const cr = this.classrooms.get(classroomId);
    if (!cr) throw new Error('Classroom not found');

    const currentParticipants = Array.from(this.roomParticipants.get(cr.roomId)?.values() || []);
    const history = this.attendanceHistory.get(cr.roomId) || [];

    return {
      classroomId: cr.id,
      classroomName: cr.name,
      currentClass: cr.currentClass,
      sessionStatus: cr.status,
      activeAttendeesCount: currentParticipants.length,
      currentParticipants,
      attendanceRecords: history,
      generatedAt: new Date().toISOString()
    };
  }
}

export const classroomManager = new ClassroomManager();
