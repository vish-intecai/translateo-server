import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import pino from 'pino';
import { setupSocketHandlers } from './websocket/socketHandlers.js';

dotenv.config();

const logger = pino({
  transport: { target: 'pino-pretty', options: { colorize: true } },
});

const app = express();
app.use(express.json());
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

const PORT = process.env.PORT ?? 3001;

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

setupSocketHandlers(io, logger);

httpServer.listen(PORT, () => {
  logger.info(`Backend listening on port ${PORT}`);
});

process.on('SIGTERM', () => {
  httpServer.close(() => process.exit(0));
});
