# ERD (Entity-Relationship Diagram)

```
┌──────────┐       1..*       ┌───────────┐       *..1       ┌──────┐
│  User    │◄────────────────►│ RoomUser  │◄────────────────►│ Room │
├──────────┤                  ├───────────┤                  ├──────┤
│ id       │ PK               │ id        │ PK               │ id   │ PK
│ nickname │ UNIQUE           │ roomId    │ FK → Room.id     │ roomName    │
│ createdAt│                  │ userId    │ FK → User.id     │ status │ ENUM
└──────────┘                  │ role      │ ENUM             │ owner  │ FK → User.id
         │                    │ createdAt │                  │ maxPlayers│ INT
         │                    └───────────┘                  │ createdAt│
         │                         │                        └──────┘
         │                         │ 1..*
         │                         ▼
         │                 ┌───────────┐
         │                 │   Game    │
         │                 ├───────────┤
┌────────▼─────────┐     │ id        │ PK
│     Chat         │     │ roomId    │ FK → Room.id
├──────────────────┤     │ boardState│ JSON
│ id       │ PK     │     │ turn      │ INT (0 = black's turn)
│ roomId   │ FK     │     │ winner    │ FK → User.id (nullable)
│ userId   │ FK     │     │ status    │ ENUM
│ message  │ TEXT   │     │ createdAt│
│ createdAt│         │     └───────────┘
└──────────┘
```

## Relationships

- **User 1 ── * RoomUser**: A user can join multiple rooms
- **User 1 ── * Chat**: A user can send multiple messages
- **Room 1 ── * RoomUser**: A room can have multiple users
- **Room 1 ── 0..1 Game**: A room has at most one active game
- **Room 1 ── * Chat**: A room has multiple chat messages
- **Game 1 ── 0..1 Winner (User)**: A game has one winner (nullable)

## Status Enums

### Room.status
- `LOBBY` — Waiting for players
- `PLAYING` — Game in progress
- `FINISHED` — Game ended

### Game.status
- `ACTIVE` — Game in progress
- `FINISHED` — Game ended

### RoomUser.role
- `OWNER` — Room creator
- `PLAYER_BLACK` — Black player (first to join)
- `PLAYER_WHITE` — White player (second to join)
- `SPECTATOR` — Observer (3rd+)
