# Railway 배포 준비 완료 ✅

## 📦 변경된 파일
- `backend/Dockerfile` — Multi-stage build (Node 20 Alpine)
- `railway.json` — Railway deploy config
- `backend/.env` — Local dev env
- `backend/.env.example` — Template
- `backend/package.json` — postinstall prisma generate
- `.gitignore` — cleanup

## 🚀 Railway 배포 단계

### 1. Railway 연결
1. https://railway.app/login → GitHub 로그인
2. `New Project` → `Deploy from GitHub repo`
3. `gomoku` 리포지토리 선택
4. `backend/` 디렉토리를 서비스로 선택

### 2. 환경변수 설정 (Railway 대시보드)
```
PORT=4000
CORS_ORIGIN=*
DATABASE_URL=postgresql://... (Supabase DB 연결)
JWT_SECRET=your-secret-key-here
```

### 3. Supabase DB 연결
Railway에서 PostgreSQL 데이터베이스 추가하거나 기존 Supabase 연결:
- `Database` → `New Postgres`
- 생성된 `DATABASE_URL` 복사 → `backend` 서비스 환경변수에 붙여넣기
- 또는 Supabase external DB 사용

### 4. 배포
- Push to main → Railway 자동 감지 → 자동 배포
- Build → Deploy → 완료

### 5. 도메인 확인
- Railway 대시보드 → Domain → `https://gomoku-backend-production.xxx.railway.app`
- CORS_ORIGIN에 이 도메인 설정

## ⚙️ 프론트엔드 수정 (railway 배포 후)

```env
# .env 또는 .env.production
VITE_API_URL=https://gomoku-backend-production.xxx.railway.app
VITE_SOCKET_URL=https://gomoku-backend-production.xxx.railway.app
```

## 💰 비용
- Railway Free: $5 크레딧/월
- PostgreSQL: 별도 $5 (Railway managed DB)
- 실제 사용량 기반 (게임 서버는 lightweight)

## 📋 체크리스트
- [ ] Railway 계정에 로그인
- [ ] `gomoku` 리포지토리 연결
- [ ] DB (PostgreSQL) 설정
- [ ] 환경변수 설정
- [ ] Deploy → Build 확인
- [ ] Health check: `https://xxx.railway.app/api/health`
- [ ] 프론트엔드 URL 업데이트
- [ ] Vercel 재배포
