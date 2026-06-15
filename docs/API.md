# API Specification

Base URL: `/api`

## Auth

### POST /auth/login
닉네임 로그인, JWT 발급

**Request Body:**
```json
{ "nickname": "철수" }
```

**Response 200:**
```json
{
  "token": "eyJhbG...",
  "user": {
    "id": "cm9xyz123",
    "nickname": "철수",
    "createdAt": "2026-06-15T06:00:00Z"
  }
}
```

**Error 400:** `{ "error": "Nickname required" }`

---

## Rooms

### POST /rooms
방 생성

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "roomName": "철수의 오목방",
  "maxPlayers": 2
}
```

**Response 201:**
```json
{
  "id": "cm9abc456",
  "roomName": "철수의 오목방",
  "status": "LOBBY",
  "maxPlayers": 2,
  "ownerId": "usr001",
  "createdAt": "2026-06-15T06:00:00Z"
}
```

**Error 401:** `{ "error": "Unauthorized" }`

### GET /rooms
전체 방 목록 조회

**Response 200:**
```json
[
  {
    "id": "cm9abc456",
    "roomName": "철수의 오목방",
    "status": "LOBBY",
    "playerCount": 1,
    "maxPlayers": 2,
    "createdAt": "2026-06-15T06:00:00Z"
  }
]
```

### GET /rooms/:id
방 상세 조회

**Response 200:**
```json
{
  "id": "cm9abc456",
  "roomName": "철수의 오목방",
  "status": "LOBBY",
  "maxPlayers": 2,
  "owner": { "id": "usr001", "nickname": "철수" },
  "players": [
    { "id": "usr001", "nickname": "철수", "role": "PLAYER_BLACK" }
  ],
  "spectators": [],
  "createdAt": "2026-06-15T06:00:00Z"
}
```

### POST /rooms/:id/join
방 참가

**Request Body:**
```json
{ "role": null } // server assigns based on room state
```

**Response 200:**
```json
{
  "room": { "id": "cm9abc456", "status": "LOBBY" },
  "player": { "id": "usr002", "nickname": "영희", "role": "PLAYER_WHITE" },
  "game": null // null if game hasn't started
}
```

**Error 409:** `{ "error": "Room is full" }`

### POST /rooms/:id/leave
방 퇴장

**Response 200:**
```json
{ "message": "Left room" }
```

---

## Games

### GET /games/:roomId
게임 상태 조회

**Response 200:**
```json
{
  "id": "g001",
  "roomId": "cm9abc456",
  "boardState": [[0,0,0,...], ...],
  "turn": 0,
  "winner": null,
  "status": "ACTIVE"
}
```

---

## Chat

### GET /chat/:roomId
채팅 히스토리 조회 (최근 50건)

**Response 200:**
```json
[
  {
    "id": "c001",
    "userId": "usr001",
    "nickname": "철수",
    "message": "잘 부탁드립니다!",
    "createdAt": "2026-06-15T06:01:00Z"
  }
]
```

### POST /chat/:roomId
채팅 메시지 전송 (REST, Socket.IO에서도 지원)

**Request Body:**
```json
{ "message": "좋은 수네요!" }
```

**Response 201:**
```json
{
  "id": "c002",
  "userId": "usr002",
  "nickname": "영희",
  "message": "좋은 수네요!",
  "createdAt": "2026-06-15T06:01:30Z"
}
```

---

## Error Response Format

```json
{
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

| Status | Meaning |
|--------|---------|
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 500 | Internal Server Error |
