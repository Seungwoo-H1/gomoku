# 🎯 오목 (Gomoku) — Real-Time Online Multiplayer

인터넷만 연결되면 어디서든 친구와 실시간으로 오목 플레이!

## Live Demo

- Frontend: https://gomoku.vercel.app
- Backend: https://gomoku-api.railway.app
- Database: Neon PostgreSQL

## Quick Start

### Local Development

```bash
docker compose up -d
# http://localhost:5173
```

### Production Deployment

1. Vercel → Frontend 연결
2. Railway → Backend 연결
3. Neon → PostgreSQL provision
4. Environment variables 설정

## Features

- 🎮 15×15 Gomoku with 5-in-a-row win
- 🏠 Room-based multiplayer (create, join, spectate)
- 💬 Real-time chat per room
- 🔐 Nickname login with JWT
- 📱 Responsive (PC/Mobile)
- 🔄 Full state restore on refresh
- 🚫 Forbidden moves (3-3, 4-4, overline) — toggleable

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React + TypeScript + Vite + Tailwind CSS |
| Backend | Node.js + Express + TypeScript |
| Realtime | Socket.IO |
| Database | PostgreSQL + Prisma ORM |
| Auth | JWT |
| Container | Docker + docker-compose |
| CI/CD | GitHub Actions |
| Deploy | Vercel (FE) + Railway (BE) + Neon (DB) |

## Docs

- [System Architecture](docs/ARCHITECTURE.md)
- [API Specification](docs/API.md)
- [Socket Events](docs/SOCKET_EVENTS.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Local Setup Guide](docs/LOCAL_SETUP.md)

## Commit Convention

`feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`
