# System Architecture

## Overview

```
┌─────────────────────┐     HTTPS/WSS     ┌──────────────────────┐
│   Browser (FE)      │ ◄──────────────► │   Express Server     │
│   React + TS + Vite │                   │   Node.js + TS       │
│   Socket.IO Client  │                   │   Socket.IO Server   │
│   Tailwind CSS      │                   │   JWT Auth           │
└─────────────────────┘                   └──────────┬───────────┘
                                                     │
                                               ┌─────▼──────┐
                                               │ PostgreSQL │
                                               │ (Neon)     │
                                               │ + Prisma   │
                                               └────────────┘
```

## Components

### Frontend (`/frontend`)
- Vite dev server, React SPA
- Socket.IO client for real-time communication
- Tailwind CSS for styling
- Pages: Home (login/rooms), Game (board/chat)
- State management: React Context + Hooks

### Backend (`/backend`)
- Express.js REST API
- Socket.IO server for real-time game sync
- JWT authentication
- Prisma ORM for PostgreSQL
- Game engine (pure functions, testable)

### Database
- PostgreSQL (hosted on Neon)
- Tables: User, Room, RoomUser, Game, Chat
- Prisma handles migrations and types

## Game Flow

```
User → Nickname Login → JWT
        ↓
   Browse Rooms / Create Room
        ↓
   Join Room (as Black or White)
        ↓
   Game Start → Real-time play via Socket.IO
        ↓
   Win/Loss → Results → New Game / Leave
```

## Authentication Flow

```
POST /auth/login { nickname } → JWT returned
       ↓
   Store in localStorage
   Attach to Socket.IO connection
   Attach to every API request via Authorization header
```

## Socket.IO Flow

```
Socket connect → JWT auth middleware
       ↓
   room:join → Backend creates/joins room in DB
       ↓
   room:state → Server sends full state to client
       ↓
   game:move → Server validates, updates DB, broadcasts
       ↓
   chat:send → Server persists + broadcasts
       ↓
   game:end → Server records winner in DB
```

## Deployment Architecture

```
Vercel (Static FE) ──HTTPS──► Railway (Express + Socket.IO) ──► Neon PostgreSQL
        │                                               │
        └────────── GitHub (repo + Actions) ────────────┘
```

## Security

- JWT for auth (HTTP-only consideration)
- Socket.IO auth middleware
- Input validation on all endpoints
- Rate limiting on API
- CORS restricted to frontend domain
