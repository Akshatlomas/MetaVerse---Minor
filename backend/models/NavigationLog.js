import mongoose from 'mongoose';

const navigationLogSchema = new mongoose.Schema(
  {
    from: { type: String, required: true },
    to: { type: String, required: true },
    distanceM: { type: Number },
    etaSeconds: { type: Number }
  },
  { timestamps: true }
);

export default mongoose.model('NavigationLog', navigationLogSchema);
