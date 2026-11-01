import 'dotenv/config';
import http from 'node:http';
import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'node:url';
import { connectDB, isDbConnected } from './config/db.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';

import locationsRouter from './routes/locations.js';
import searchRouter from './routes/search.js';
import navigationRouter from './routes/navigation.js';
import assistantRouter from './routes/assistant.js';
import campusRouter from './routes/campus.js';
import favoritesRouter from './routes/favorites.js';
import classroomsRouter from './routes/classrooms.js';
import { classroomWsServer } from './services/websocketService.js';

export const app = express();
const PORT = process.env.PORT || 5001;

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || '*'
  })
);
app.use(express.json());

// Health & System Info
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    mode: isDbConnected() ? 'database' : 'demo',
    database: isDbConnected() ? 'connected' : 'in-memory-fallback',
    aiProvider: (process.env.AI_PROVIDER || 'mock').toLowerCase(),
    institute: 'IIIT Bhopal',
    timestamp: new Date().toISOString()
  });
});

// Campus Configuration & Metadata
app.get('/api/config', (req, res) => {
  res.json({
    campusName: 'IIIT Bhopal Metaverse',
    world: { width: 1600, height: 1400, tileSize: 32 },
    demoMode: !isDbConnected(),
    aiProvider: (process.env.AI_PROVIDER || 'mock').toLowerCase()
  });
});

app.use('/api/locations', locationsRouter);
app.use('/api/search', searchRouter);
app.use('/api/navigation', navigationRouter);
app.use('/api/assistant', assistantRouter);
app.use('/api/campus', campusRouter);
app.use('/api/favorites', favoritesRouter);
app.use('/api/classrooms', classroomsRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export const httpServer = http.createServer(app);
classroomWsServer.attach(httpServer);

export async function startServer(port = PORT) {
  await connectDB();
  return httpServer.listen(port, () => {
    console.log(`[server] IIIT Bhopal Campus Metaverse API running on http://localhost:${port}`);
    console.log(`[server] Real-Time WebSocket Endpoint: ws://localhost:${port}/ws/classroom`);
    console.log(`[server] Operational Mode: ${isDbConnected() ? 'DATABASE (MongoDB)' : 'DEMO (In-Memory Dataset)'}`);
    console.log(`[server] AI Provider: ${(process.env.AI_PROVIDER || 'mock').toUpperCase()}`);
    console.log(`[server] LiveKit Room Audio Isolation: ACTIVE`);
  });
}

// Check if this module is being run directly from the command line
const currentFilePath = fileURLToPath(import.meta.url);
if (process.argv[1] && currentFilePath === process.argv[1]) {
  startServer();
}
