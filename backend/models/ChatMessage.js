import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true, index: true },
    role: { type: String, enum: ['user', 'assistant'], required: true },
    text: { type: String, required: true },
    action: { type: mongoose.Schema.Types.Mixed, default: null }
  },
  { timestamps: true }
);

export default mongoose.model('ChatMessage', chatMessageSchema);
