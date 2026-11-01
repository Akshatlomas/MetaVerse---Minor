import mongoose from 'mongoose';

const npcSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    role: { type: String, default: 'Student' },
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    dialogue: { type: [String], default: [] }
  },
  { timestamps: true }
);

export default mongoose.model('NPC', npcSchema);
