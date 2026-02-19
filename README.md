# Translateo Server

Socket.IO server for WebRTC signaling and room management.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file (optional):
```env
PORT=3001
FRONTEND_URL=http://localhost:3000
```

3. Run the server:
```bash
# Development
npm run dev

# Production
npm run build
npm start
```

## Features

- WebRTC signaling (offer/answer/ICE candidates)
- Room management
- Participant tracking
- Socket.IO real-time communication

## API

### WebSocket Events

**Client → Server:**
- `room:join` - Join a room
- `room:leave` - Leave a room
- `webrtc:offer` - Send WebRTC offer
- `webrtc:answer` - Send WebRTC answer
- `webrtc:ice-candidate` - Send ICE candidate

**Server → Client:**
- `room:joined` - Confirmation of room join
- `room:participant-joined` - New participant joined
- `room:participant-left` - Participant left
- `webrtc:offer` - Receive WebRTC offer
- `webrtc:answer` - Receive WebRTC answer
- `webrtc:ice-candidate` - Receive ICE candidate
- `error` - Error occurred
# translateo-server
