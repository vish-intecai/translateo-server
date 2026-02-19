import type { Room, Participant, ParticipantConfig } from '../types.js';

export class RoomManager {
  private rooms = new Map<string, Room>();

  getOrCreateRoom(roomId: string): Room {
    let room = this.rooms.get(roomId);
    if (!room) {
      room = {
        roomId,
        participants: new Map(),
        createdAt: Date.now(),
      };
      this.rooms.set(roomId, room);
    }
    return room;
  }

  addParticipant(roomId: string, config: ParticipantConfig): Participant {
    const room = this.getOrCreateRoom(roomId);
    const participant: Participant = {
      userId: config.userId,
      username: config.username,
      spokenLanguage: config.spokenLanguage,
      hearingLanguage: config.hearingLanguage,
      videoDelayEnabled: config.videoDelayEnabled,
      joinedAt: Date.now(),
    };
    room.participants.set(config.userId, participant);
    return participant;
  }

  removeParticipant(roomId: string, userId: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;
    const removed = room.participants.delete(userId);
    if (room.participants.size === 0) this.rooms.delete(roomId);
    return removed;
  }

  getParticipant(roomId: string, userId: string): Participant | null {
    return this.rooms.get(roomId)?.participants.get(userId) ?? null;
  }

  getParticipants(roomId: string): Participant[] {
    return Array.from(this.rooms.get(roomId)?.participants.values() ?? []);
  }

  updateParticipant(roomId: string, userId: string, updates: Partial<ParticipantConfig>): Participant | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;
    const participant = room.participants.get(userId);
    if (!participant) return null;
    
    // Update participant fields
    if (updates.spokenLanguage !== undefined) {
      participant.spokenLanguage = updates.spokenLanguage;
    }
    if (updates.hearingLanguage !== undefined) {
      participant.hearingLanguage = updates.hearingLanguage;
    }
    if (updates.username !== undefined) {
      participant.username = updates.username;
    }
    if (updates.videoDelayEnabled !== undefined) {
      participant.videoDelayEnabled = updates.videoDelayEnabled;
    }
    
    return participant;
  }
}

export const roomManager = new RoomManager();
