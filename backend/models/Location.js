import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ['academic', 'classroom', 'research', 'hostel', 'sports', 'food', 'entrance', 'admin', 'other'],
      required: true
    },
    categoryName: { type: String },
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    width: { type: Number, default: 100 },
    height: { type: Number, default: 100 },
    description: { type: String, default: '' },
    services: { type: [String], default: [] },
    hours: { type: String, default: 'Not specified' },
    searchable: { type: Boolean, default: true },
    interactive: { type: Boolean, default: true },
    verified: { type: Boolean, default: true },
    accessibility: { type: Object, default: {} },
    classrooms: { type: [Object], default: [] },
    keywords: { type: [String], default: [] }
  },
  { timestamps: true }
);

export default mongoose.model('Location', locationSchema);
