# Monolith: Vite frontend + Express API. Build from repo root.

# --- Stage 1: build the SPA (Vite) ---
FROM node:22-bookworm-slim AS frontend-build
WORKDIR /app/frontend/vite-project
COPY frontend/vite-project/package*.json ./
RUN npm install --no-audit --no-fund --legacy-peer-deps
COPY frontend/vite-project/ ./
ARG VITE_CLERK_PUBLISHABLE_KEY
ENV VITE_CLERK_PUBLISHABLE_KEY=$VITE_CLERK_PUBLISHABLE_KEY
RUN npm run build

# --- Stage 2: build the API bundle ---
FROM node:22-bookworm-slim AS backend-build
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install --no-audit --no-fund
COPY backend/ ./
RUN npm run build

# --- Stage 3: runtime image ---
FROM node:22-bookworm-slim AS runner
# CHANGE 1: Set the working directory explicitly to the backend folder
WORKDIR /app/backend
ENV NODE_ENV=production
ENV PORT=3001

# CHANGE 2: Copy the package files straight into /app/backend
COPY backend/package*.json ./
RUN npm install --omit=dev --no-audit --no-fund && npm cache clean --force

# CHANGE 3: Copy assets into their proper, symmetrical production locations
COPY --from=backend-build /app/backend/dist ./dist
COPY --from=frontend-build /app/frontend/vite-project/dist ./public

EXPOSE 3001
USER node

# CHANGE 4: Run Node directly inside the backend directory context
CMD ["node", "dist/index.js"]