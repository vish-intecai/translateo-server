import type { Server, Socket } from 'socket.io';
import type { Logger } from 'pino';
import type { ClientToServerEvents, ServerToClientEvents, ParticipantConfig } from '../types.js';
import { roomManager } from '../rooms/roomManager.js';

export function setupSocketHandlers(
  io: Server<ClientToServerEvents, ServerToClientEvents>,
  logger: Logger
): void {
  io.on('connection', (socket: Socket<ClientToServerEvents, ServerToClientEvents>) => {
    logger.info(`Client connected: ${socket.id}`);

    socket.on('room:join', async (data) => {
      try {
        const { roomId, config } = data;
        logger.info(`User ${config.userId} joining room ${roomId}`);

        const participant = roomManager.addParticipant(roomId, config);
        await socket.join(roomId);
        await socket.join(config.userId);
        socket.data.roomId = roomId;
        socket.data.userId = config.userId;

        const participants = roomManager.getParticipants(roomId);
        socket.emit('room:joined', {
          roomId,
          userId: config.userId,
          participants,
        });
        socket.to(roomId).emit('room:participant-joined', { roomId, participant });
      } catch (err) {
        logger.error(err);
        socket.emit('error', { message: 'Failed to join room', code: 'JOIN_ERROR' });
      }
    });

    socket.on('room:leave', (data) => {
      const { roomId, userId } = data;
      const participant = roomManager.getParticipant(roomId, userId);
      const username = participant?.username ?? 'Someone';
      logger.info(`User ${userId} (${username}) leaving room ${roomId}`);
      roomManager.removeParticipant(roomId, userId);
      socket.leave(roomId);
      socket.leave(userId);
      delete socket.data.roomId;
      delete socket.data.userId;
      socket.to(roomId).emit('room:participant-left', { roomId, userId, username });
    });

    // WebRTC signaling - just relay messages between peers
    socket.on('webrtc:offer', (data) => socket.to(data.to).emit('webrtc:offer', data));
    socket.on('webrtc:answer', (data) => socket.to(data.to).emit('webrtc:answer', data));
    socket.on('webrtc:ice-candidate', (data) => socket.to(data.to).emit('webrtc:ice-candidate', data));
    
    // Media toggle - broadcast to all participants in the room
    socket.on('media:toggle', (data) => {
      const { roomId } = data;
      if (roomId && socket.data.roomId === roomId) {
        socket.to(roomId).emit('media:toggle', data);
      }
    });

    // Config update - update participant config and broadcast to all participants
    socket.on('config:update', (data) => {
      const { roomId, userId, config } = data;
      if (roomId && socket.data.roomId === roomId && socket.data.userId === userId) {
        const updatedParticipant = roomManager.updateParticipant(roomId, userId, config);
        if (updatedParticipant) {
          logger.info({ config, userId, roomId }, `User ${userId} updated config in room ${roomId}`);
          // Broadcast to all participants in the room
          io.to(roomId).emit('config:update', { roomId, userId, config });
        } else {
          socket.emit('error', { message: 'Failed to update config', code: 'CONFIG_UPDATE_ERROR' });
        }
      }
    });

    // Transcript final - broadcast transcription to all participants in the room
    socket.on('transcript:final', (data) => {
      const { roomId, userId, text, spokenLanguage } = data;
      if (roomId && socket.data.roomId === roomId && socket.data.userId === userId) {
        logger.info({ userId, roomId, text, spokenLanguage }, `User ${userId} sent transcript in room ${roomId}`);
        // Broadcast to all participants in the room (including sender)
        io.to(roomId).emit('transcript:received', {
          roomId,
          userId,
          text,
          spokenLanguage,
          timestamp: Date.now(),
        });
      }
    });

    socket.on('disconnect', () => {
      const roomId = socket.data.roomId as string | undefined;
      const userId = socket.data.userId as string | undefined;
      if (roomId && userId) {
        const participant = roomManager.getParticipant(roomId, userId);
        const username = participant?.username ?? 'Someone';
        logger.info(`Client disconnected: ${socket.id} (${username}) – treating as leave for room ${roomId}`);
        roomManager.removeParticipant(roomId, userId);
        io.to(roomId).emit('room:participant-left', { roomId, userId, username });
      } else {
        logger.info(`Client disconnected: ${socket.id}`);
      }
    });
  });
}
