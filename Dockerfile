# Monolith: Vite frontend + Express API. Build from repo root.

# --- Stage 1: build the SPA (Vite) ---
FROM node:22-bookworm-slim AS frontend-build
WORKDIR /app/frontend/vite-project

COPY frontend/vite-project/package*.json ./
RUN npm install --no-audit --no-fund --legacy-peer-deps

COPY frontend/vite-project/ ./

# Environment variables
ENV VITE_API_URL=
ARG VITE_CLERK_PUBLISHABLE_KEY
ENV VITE_CLERK_PUBLISHABLE_KEY=$VITE_CLERK_PUBLISHABLE_KEY

RUN npm run build

# --- Stage 2: build the API bundle ---
FROM node:22-bookworm-slim AS backend-build
#  Changed to explicit backend directory
WORKDIR /app/backend

#  Updated paths to properly install inside /app/backend
COPY backend/package*.json ./
RUN npm install --no-audit --no-fund

COPY backend/ ./
RUN npm run build

# --- Stage 3: runtime image (only prod deps + built assets) ---
FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3001

COPY backend/package*.json ./
RUN npm install --omit=dev --no-audit --no-fund && npm cache clean --force

#  Updated to copy from the correct backend-build path
COPY --from=backend-build /app/backend/dist ./dist
COPY --from=frontend-build /app/frontend/vite-project/dist ./public

EXPOSE 3001
USER node

CMD ["node", "dist/index.js"]