# 프로젝트 구조 (Monorepo)

```
gomoku/
├── frontend/                     # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/           # React components
│   │   │   ├── board/            # Gomoku board related
│   │   │   │   ├── Board.tsx
│   │   │   │   ├── BoardLine.tsx
│   │   │   │   ├── Stone.tsx
│   │   │   │   └── StarPoint.tsx
│   │   │   ├── chat/             # Chat related
│   │   │   │   ├── ChatBox.tsx
│   │   │   │   ├── ChatInput.tsx
│   │   │   │   └── ChatMessage.tsx
│   │   │   ├── game/             # Game state UI
│   │   │   │   ├── GameStatus.tsx
│   │   │   │   ├── PlayerList.tsx
│   │   │   │   └── TurnIndicator.tsx
│   │   │   ├── room/             # Room related
│   │   │   │   ├── RoomCard.tsx
│   │   │   │   ├── RoomCreateModal.tsx
│   │   │   │   └── RoomList.tsx
│   │   │   └── layout/           # Layout components
│   │   │       ├── Header.tsx
│   │   │       ├── MainLayout.tsx
│   │   │       └── ErrorBoundary.tsx
│   │   ├── contexts/             # React contexts
│   │   │   ├── AuthContext.tsx
│   │   │   └── SocketContext.tsx
│   │   ├── hooks/                # Custom hooks
│   │   │   ├── useAuth.ts
│   │   │   ├── useSocket.ts
│   │   │   ├── useGomokuGame.ts
│   │   │   └── useApi.ts
│   │   ├── lib/                  # Shared utilities
│   │   │   ├── api.ts            # Axios instance
│   │   │   └── socket.ts         # Socket.IO client config
│   │   ├── pages/                # Page components
│   │   │   ├── HomePage.tsx      # Login + room list
│   │   │   └── GamePage.tsx      # Game board + chat
│   │   ├── types/                # TypeScript types
│   │   │   ├── api.ts
│   │   │   ├── socket.ts
│   │   │   └── game.ts
│   │   ├── utils/                # Pure utilities
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── public/
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   ├── eslint.config.js
│   ├── vitest.config.ts
│   └── package.json
├── backend/                      # Express + Socket.IO
│   ├── src/
│   │   ├── routes/               # REST API routes
│   │   │   ├── auth.routes.ts
│   │   │   ├── room.routes.ts
│   │   │   ├── game.routes.ts
│   │   │   └── chat.routes.ts
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts
│   │   │   └── error.middleware.ts
│   │   ├── services/
│   │   │   ├── auth.service.ts
│   │   │   ├── room.service.ts
│   │   │   ├── game.service.ts
│   │   │   └── chat.service.ts
│   │   ├── sockets/
│   │   │   ├── socket.handler.ts
│   │   │   └── socket.types.ts
│   │   ├── engine/               # Game engine (pure functions)
│   │   │   ├── board.ts          # Board operations
│   │   │   ├── winCheck.ts       # Win detection
│   │   │   ├── forbidden.ts      # 3-3, 4-4, overline rules
│   │   │   └── types.ts          # Game type definitions
│   │   ├── prisma/
│   │   │   └── seed.ts           # Optional seed data
│   │   ├── app.ts                # Express app setup
│   │   ├── server.ts             # HTTP + Socket.IO server
│   │   └── index.ts              # Entry point
│   ├── prisma/
│   │   └── schema.prisma         # Database schema
│   ├── tsconfig.json
│   ├── eslint.config.js
│   ├── jest.config.ts
│   ├── vitest.config.ts
│   └── package.json
├── docker/
│   ├── frontend/
│   │   └── Dockerfile
│   └── backend/
│       └── Dockerfile
├── docker-compose.yml
├── .github/
│   └── workflows/
│       └── ci.yml                # GitHub Actions
├── .env.example
├── .gitignore
├── .editorconfig
└── README.md
```

## Key Design Decisions

1. **Monorepo structure** — Single repo, simple dependency management
2. **Game engine is pure functions** — No side effects, fully testable
3. **Socket.IO + REST hybrid** — REST for CRUD, Socket.IO for real-time
4. **TypeScript strict mode everywhere** — Type safety end-to-end
5. **Prisma for type-safe DB access** — Generated types match schema
