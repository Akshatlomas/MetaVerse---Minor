import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  generateLiveKitToken,
  verifyLiveKitToken,
  getRoomIdForClassroom
} from '../services/livekitService.js';
import { classroomManager } from '../services/classroomManager.js';
import { app } from '../server.js';

// Helper to simulate Express route calls without opening network ports
async function simulateRequest(method, url, body = null, query = {}) {
  return new Promise((resolve) => {
    const req = {
      method,
      url,
      path: url.split('?')[0],
      params: {},
      query,
      body,
      headers: {}
    };

    // Extract path params if matches /api/classrooms/:id
    const match = req.path.match(/^\/api\/classrooms\/([a-zA-Z0-9_-]+)(?:\/(.*))?$/);
    if (match) {
      req.params.id = match[1];
      if (match[2]) {
        const subParts = match[2].split('/');
        if (subParts[0] === 'questions' && subParts[1]) {
          req.params.questionId = subParts[1];
        }
      }
    }

    let statusCode = 200;
    const headers = {};
    let responseBody = null;

    const res = {
      status(code) {
        statusCode = code;
        return this;
      },
      setHeader(k, v) {
        headers[k.toLowerCase()] = v;
      },
      json(data) {
        responseBody = data;
        resolve({ status: statusCode, headers, body: responseBody });
      },
      send(data) {
        responseBody = data;
        resolve({ status: statusCode, headers, body: responseBody });
      }
    };

    app.handle(req, res);
  });
}

describe('IIIT Bhopal Metaverse - Virtual Classroom & LiveKit Audio Isolation Suite', () => {
  // Test 1: Room ID Normalization
  assert.equal(getRoomIdForClassroom('lh101'), 'iiit-classroom-lh101');
  assert.equal(getRoomIdForClassroom('iiit-classroom-ac201'), 'iiit-classroom-ac201');
  assert.equal(getRoomIdForClassroom('B201!'), 'iiit-classroom-b201');

  // Test 2: LiveKit Token Generation & Format
  const studentTokenData = generateLiveKitToken({
    identity: 'student_aditya_102',
    name: 'Aditya Sharma',
    classroomId: 'lh101',
    role: 'student'
  });

  assert.ok(studentTokenData.token, 'Token must be generated');
  assert.equal(studentTokenData.roomId, 'iiit-classroom-lh101');
  assert.equal(studentTokenData.videoGrants.roomAdmin, false);
  assert.equal(studentTokenData.videoGrants.canPublish, true);
  assert.equal(studentTokenData.audioIsolationEnforced, true);

  // Test 3: Token Verification with HS256 signature
  const verifiedPayload = verifyLiveKitToken(studentTokenData.token, 'iiit-classroom-lh101');
  assert.equal(verifiedPayload.sub, 'student_aditya_102');
  assert.equal(verifiedPayload.video.room, 'iiit-classroom-lh101');

  // Test 4: Token Verification Rejects Cross-Room Intrusion
  assert.throws(
    () => {
      // Trying to use lh101 token to enter lh102
      verifyLiveKitToken(studentTokenData.token, 'iiit-classroom-lh102');
    },
    /Token unauthorized for room/,
    'Token must reject unauthorized room access'
  );

  // Test 5: Teacher Token Grants Room Admin
  const teacherTokenData = generateLiveKitToken({
    identity: 'prof_rk_sharma',
    name: 'Dr. R. K. Sharma',
    classroomId: 'lh101',
    role: 'teacher'
  });
  assert.equal(teacherTokenData.videoGrants.roomAdmin, true);
  assert.equal(teacherTokenData.role, 'teacher');

  // Test 6: GET /api/classrooms
  const list = classroomManager.getAllClassrooms();
  assert.ok(list.length >= 4, 'Should list at least 4 campus classrooms');
  const lh101 = list.find((c) => c.id === 'lh101');
  assert.ok(lh101);
  assert.equal(lh101.buildingId, 'lecture-hall-complex');
  assert.equal(lh101.status, 'live');

  // Test 7: Participant Room Join and Isolation
  const joinResultA = classroomManager.joinRoom('lh101', {
    identity: 'student_aditya_102',
    name: 'Aditya Sharma',
    role: 'student'
  });
  assert.equal(joinResultA.participant.identity, 'student_aditya_102');
  assert.equal(joinResultA.classroom.roomId, 'iiit-classroom-lh101');

  // Student B joins Classroom LH102
  const joinResultB = classroomManager.joinRoom('lh102', {
    identity: 'student_priya_204',
    name: 'Priya Verma',
    role: 'student'
  });
  assert.equal(joinResultB.classroom.roomId, 'iiit-classroom-lh102');

  // Verify Classroom LH101 participants DO NOT include Student B
  const lh101Updated = classroomManager.getClassroom('lh101');
  const lh102Updated = classroomManager.getClassroom('lh102');
  const lh101ParticipantIds = lh101Updated.participants.map((p) => p.identity);
  const lh102ParticipantIds = lh102Updated.participants.map((p) => p.identity);

  assert.ok(lh101ParticipantIds.includes('student_aditya_102'));
  assert.ok(!lh101ParticipantIds.includes('student_priya_204'), 'LH101 must NOT have LH102 student');
  assert.ok(lh102ParticipantIds.includes('student_priya_204'));
  assert.ok(!lh102ParticipantIds.includes('student_aditya_102'), 'LH102 must NOT have LH101 student');

  // Test 8: Hand Raise & Teacher Acknowledgment
  const hand = classroomManager.raiseHand('lh101', {
    identity: 'student_aditya_102',
    name: 'Aditya Sharma',
    rollNo: '2023CSE018'
  });
  assert.equal(hand.identity, 'student_aditya_102');
  assert.equal(hand.acknowledged, false);

  const ackHand = classroomManager.acknowledgeHand('lh101', 'student_aditya_102');
  assert.equal(ackHand.acknowledged, true);

  const lowerHand = classroomManager.lowerHand('lh101', 'student_aditya_102');
  assert.equal(lowerHand, true);

  // Test 9: Q&A System
  const question = classroomManager.addQuestion('lh101', {
    studentName: 'Aditya Sharma',
    studentIdentity: 'student_aditya_102',
    rollNo: '2023CSE018',
    question: 'How does A* guarantee shortest path with an admissible heuristic?'
  });
  assert.ok(question.id);
  assert.equal(question.answered, false);

  const answered = classroomManager.answerQuestion(
    'lh101',
    question.id,
    'Because h(n) <= h*(n) never overestimates the actual cost to the destination goal.',
    'Dr. R. K. Sharma'
  );
  assert.equal(answered.answered, true);
  assert.equal(answered.answeredBy, 'Dr. R. K. Sharma');

  // Test 10: Whiteboard Sync & Teacher Lock
  classroomManager.setWhiteboardLock('lh101', true);
  assert.throws(
    () => {
      // Student attempts to draw while locked
      classroomManager.addWhiteboardStroke('lh101', {
        role: 'student',
        color: '#ff0000',
        points: [{ x: 10, y: 10 }]
      });
    },
    /locked by the instructor/,
    'Student drawing must be rejected when locked'
  );

  // Teacher can draw even when locked
  const teacherStroke = classroomManager.addWhiteboardStroke('lh101', {
    role: 'teacher',
    color: '#00ffff',
    points: [{ x: 20, y: 20 }]
  });
  assert.ok(teacherStroke);

  // Test 11: Participant Exit & Attendance Logging
  const leaveResult = classroomManager.leaveRoom('lh101', 'student_aditya_102');
  assert.equal(leaveResult.identity, 'student_aditya_102');

  const attendance = classroomManager.getAttendance('lh101');
  const attendeeRecord = attendance.attendanceRecords.find(
    (r) => r.identity === 'student_aditya_102'
  );
  assert.ok(attendeeRecord);
  assert.ok(attendeeRecord.leftAt);

  console.log('✔ All Classroom & LiveKit Audio Isolation Unit Tests Passed Successfully!');
});
