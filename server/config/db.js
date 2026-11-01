import mongoose from 'mongoose';

/**
 * connectDB
 * Connects to MongoDB if DEMO_MODE is false and MONGODB_URI is provided.
 * If DEMO_MODE=true or connection fails, the server smoothly runs in
 * Demo Mode using bundled sample data.
 */
export async function connectDB() {
  if (process.env.DEMO_MODE === 'true') {
    console.log('[db] DEMO_MODE=true: Running with bundled in-memory campus dataset.');
    return { connected: false, mode: 'demo' };
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn('[db] MONGODB_URI not set — defaulting to Demo Mode.');
    return { connected: false, mode: 'demo' };
  }

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
    console.log('[db] Connected to MongoDB database successfully.');
    return { connected: true, mode: 'database' };
  } catch (err) {
    console.warn('[db] Could not connect to MongoDB, falling back to Demo Mode:', err.message);
    return { connected: false, mode: 'demo' };
  }
}

export function isDbConnected() {
  return mongoose.connection.readyState === 1;
}
