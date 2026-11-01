import mongoose from 'mongoose';

const AttendanceRecordSchema = new mongoose.Schema({
  identity: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['teacher', 'student', 'ta'], default: 'student' },
  rollNo: { type: String, default: '' },
  joinedAt: { type: Date, default: Date.now },
  leftAt: { type: Date, default: null },
  durationMinutes: { type: Number, default: 0 }
});

const ClassroomSessionSchema = new mongoose.Schema(
  {
    classroomId: { type: String, required: true, index: true },
    roomId: { type: String, required: true },
    classroomName: { type: String, required: true },
    subject: { type: String, required: true },
    topic: { type: String, default: '' },
    faculty: { type: String, required: true },
    facultyId: { type: String, required: true },
    status: { type: String, enum: ['idle', 'live', 'ended'], default: 'idle' },
    startedAt: { type: Date, default: Date.now },
    endedAt: { type: Date, default: null },
    totalAttendees: { type: Number, default: 0 },
    attendance: [AttendanceRecordSchema]
  },
  { timestamps: true }
);

export default mongoose.models.ClassroomSession ||
  mongoose.model('ClassroomSession', ClassroomSessionSchema);
