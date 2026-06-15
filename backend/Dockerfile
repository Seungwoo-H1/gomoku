FROM node:20-alpine AS builder

WORKDIR /app

# Copy root level files first for better layer caching
COPY package.json package-lock.json* ./
COPY backend/package.json ./backend/

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy backend source
COPY backend/ ./backend/

# Build backend
WORKDIR /app/backend
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy production dependencies
COPY backend/package.json ./backend/
RUN cd backend && npm ci --omit=dev

# Copy built backend
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/node_modules ./backend/node_modules

EXPOSE 4000

CMD ["node", "backend/dist/index.js"]
