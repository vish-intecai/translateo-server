import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import pino from 'pino';
import { setupSocketHandlers } from './websocket/socketHandlers.js';

dotenv.config();

const logger = pino({
  transport: {
    target: 'pino-pretty',
    options: { colorize: true }
  }
});

const app = express();

/**
 * REQUIRED when running behind nginx https proxy
 */
app.set('trust proxy', true);

app.use(express.json());

const httpServer = createServer(app);

const io = new Server(httpServer, {
  transports: ['websocket'],
  allowUpgrades: true,
  cors: {
    origin: [
      process.env.FRONTEND_URL,
      'https://translateo-engine.web.app'
    ].filter((o): o is string => typeof o === 'string'),
    methods: ['GET', 'POST'],
    credentials: true
  }
});

const PORT = Number(process.env.PORT) || 3001;

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: Date.now(),
    secure: _req.secure
  });
});

setupSocketHandlers(io, logger);

httpServer.listen(PORT, '0.0.0.0', () => {
  logger.info(`Socket backend listening on ${PORT}`);
});

/**
 * Graceful shutdown for docker and systemd
 */
const shutdown = () => {
  logger.info('Shutting down server');
  io.close(() => {
    httpServer.close(() => {
      process.exit(0);
    });
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);