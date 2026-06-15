# Socket Events Specification

## Connection

```
Socket.IO connect → JWT in query/auth → auth middleware validates
```

## Client → Server Events

### `join-room`
방 입장

```typescript
// Event
{ event: 'join-room', data: { roomId: string } }

// Response (server)
{ event: 'room-joined', data: { room, player, game? } }

// Error responses
{ event: 'room-error', data: { error: 'Room not found' } }
{ event: 'room-error', data: { error: 'Room is full' } }
{ event: 'room-error', data: { error: 'Already in this room' } }
```

### `leave-room`
방 퇴장

```typescript
// Event
{ event: 'leave-room', data: { roomId: string } }

// Broadcast to others in room
{ event: 'player-left', data: { userId, nickname, role } }
```

### `game-move`
돌 놓기

```typescript
// Event
{ event: 'game-move', data: { row: number, col: number } }

// Response (server)
{ event: 'move-accepted', data: { row, col, stone, turn } }

// Error responses
{ event: 'move-rejected', data: { error: 'Not your turn' } }
{ event: 'move-rejected', data: { error: 'Invalid position' } }
{ event: 'move-rejected', data: { error: 'Position already occupied' } }
{ event: 'move-rejected', data: { error: 'Game already finished' } }
```

### `game-restart`
재시작 요청 (owner만 가능)

```typescript
// Event
{ event: 'game-restart', data: {} }

// Response (server)
{ event: 'game-restarted', data: { boardState, turn: 0 } }

// Error
{ event: 'restart-rejected', data: { error: 'Only owner can restart' } }
```

### `chat-send`
채팅 메시지

```typescript
// Event
{ event: 'chat-send', data: { message: string } }

// Broadcast to all in room
{ event: 'chat-receive', data: { userId, nickname, message, createdAt } }
```

## Server → Client Events

### `room-joined`
방 입장 성공

```typescript
{
  event: 'room-joined',
  data: {
    room: { id, roomName, status, maxPlayers, playerCount },
    player: { userId, nickname, role },
    game: { boardState, turn, winner, status } | null,
    players: Array<{ userId, nickname, role }>,
    spectators: Array<{ userId, nickname }>
  }
}
```

### `room-state`
방 상태 전체 동기화 (새로고침 후 복원용)

```typescript
{
  event: 'room-state',
  data: {
    room: { id, roomName, status, maxPlayers },
    players: Array<{ userId, nickname, role }>,
    spectators: Array<{ userId, nickname }>,
    game: { boardState, turn, winner, status } | null,
    recentChats: Array<{ userId, nickname, message, createdAt }>
  }
}
```

### `move-accepted`
돌 놓기 성공

```typescript
{
  event: 'move-accepted',
  data: { row: number, col: number, stone: 1 | 2, turn: number }
}
```

### `move-rejected`
돌 놓기 실패

```typescript
{ event: 'move-rejected', data: { error: string } }
```

### `game-restarted`
게임 재시작

```typescript
{
  event: 'game-restarted',
  data: { boardState: BoardState, turn: 0 }
}
```

### `game-ended`
게임 종료

```typescript
{
  event: 'game-ended',
  data: {
    winnerId: string,
    winnerNickname: string,
    reason: 'five-in-a-row' | 'timeout'
  }
}
```

### `player-joined`
새 플레이어 입장

```typescript
{
  event: 'player-joined',
  data: {
    userId: string,
    nickname: string,
    role: string,
    isPlayer: boolean // true if became PLAYER_BLACK or PLAYER_WHITE
  }
}
```

### `player-left`
플레이어 퇴장

```typescript
{ event: 'player-left', data: { userId, nickname, role } }
```

### `turn-update`
턴 변경

```typescript
{
  event: 'turn-update',
  data: { turn: number, player: 'BLACK' | 'WHITE' }
}
```

### `chat-receive`
채팅 수신

```typescript
{
  event: 'chat-receive',
  data: { userId, nickname, message, createdAt }
}
```

### `player-update`
플레이어 상태 변경 (role 변경 등)

```typescript
{
  event: 'player-update',
  data: { userId, nickname, role }
}
```

## Event Flow Diagram

```
Client                          Server
  │                               │
  ├──join-room───────────────────►│
  │                               ├──validate + DB save
  │◄──room-joined────────────────┤
  │                               │
  ├──game-move───────────────────►│
  │                               ├──validate (turn, board, win)
  │◄──move-accepted──────────────┤──► broadcast to room
  │                               │
  │                               │
  │◄──move-rejected──────────────┤ (if invalid)
  │                               │
  ├──chat-send───────────────────►│
  │                               ├──persist + broadcast
  │◄──chat-receive───────────────┤ (echo to sender)
  │                               │
  ├──game-restart────────────────►│
  │                               ├──check owner
  │◄──game-restarted─────────────┤──► broadcast to room
  │                               │
  │◄──game-ended─────────────────┤ (after 5-in-a-row)
```

## Error Codes

| Code | Meaning |
|------|---------|
| `ROOM_NOT_FOUND` | 방이 없음 |
| `ROOM_FULL` | 방 정원 초과 |
| `ALREADY_IN_ROOM` | 이미 방에 있음 |
| `NOT_YOUR_TURN` | 내 턴이 아님 |
| `INVALID_POSITION` | 잘못된 위치 |
| `POSITION_OCCUPIED` | 이미 돌 있음 |
| `GAME_FINISHED` | 게임 종료됨 |
| `NOT_OWNER` | 소유자가 아님 |
| `UNAUTHORIZED` | 인증 실패 |
