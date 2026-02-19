/**
 * Backend type definitions and WebSocket event contracts
 */

/// <reference lib="dom" />

export type LanguageCode = string;

export interface ParticipantConfig {
  userId: string;
  roomId: string;
  username: string;
  spokenLanguage: LanguageCode;
  hearingLanguage: LanguageCode;
  videoDelayEnabled: boolean;
}

export interface Participant {
  userId: string;
  username: string;
  spokenLanguage: LanguageCode;
  hearingLanguage: LanguageCode;
  videoDelayEnabled: boolean;
  joinedAt: number;
}

export interface Room {
  roomId: string;
  participants: Map<string, Participant>;
  createdAt: number;
}

/** Client -> Server WebSocket events */
export interface ClientToServerEvents {
  'room:join': (data: { roomId: string; config: ParticipantConfig }) => void;
  'room:leave': (data: { roomId: string; userId: string }) => void;
  'webrtc:offer': (data: { roomId: string; from: string; to: string; offer: RTCSessionDescriptionInit }) => void;
  'webrtc:answer': (data: { roomId: string; from: string; to: string; answer: RTCSessionDescriptionInit }) => void;
  'webrtc:ice-candidate': (data: { roomId: string; from: string; to: string; candidate: RTCIceCandidateInit }) => void;
  'media:toggle': (data: { roomId: string; userId: string; videoEnabled: boolean; audioEnabled: boolean }) => void;
  'config:update': (data: { roomId: string; userId: string; config: Partial<ParticipantConfig> }) => void;
  'transcript:final': (data: { roomId: string; userId: string; text: string; spokenLanguage: LanguageCode }) => void;
}

/** Server -> Client WebSocket events */
export interface ServerToClientEvents {
  'room:joined': (data: { roomId: string; userId: string; participants: Participant[] }) => void;
  'room:left': (data: { roomId: string; userId: string }) => void;
  'room:participant-joined': (data: { roomId: string; participant: Participant }) => void;
  'room:participant-left': (data: { roomId: string; userId: string; username?: string }) => void;
  'webrtc:offer': (data: { roomId: string; from: string; to: string; offer: RTCSessionDescriptionInit }) => void;
  'webrtc:answer': (data: { roomId: string; from: string; to: string; answer: RTCSessionDescriptionInit }) => void;
  'webrtc:ice-candidate': (data: { roomId: string; from: string; to: string; candidate: RTCIceCandidateInit }) => void;
  'media:toggle': (data: { roomId: string; userId: string; videoEnabled: boolean; audioEnabled: boolean }) => void;
  'config:update': (data: { roomId: string; userId: string; config: Partial<ParticipantConfig> }) => void;
  'transcript:received': (data: { roomId: string; userId: string; text: string; spokenLanguage: LanguageCode; timestamp: number }) => void;
  'error': (data: { message: string; code?: string }) => void;
}
