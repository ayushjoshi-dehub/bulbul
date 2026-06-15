# Monolith: Vite frontend + Express API. Build from repo root.

# --- Stage 1: build the SPA (Vite) ---
# Produces static HTML/JS/CSS under frontend/dist.
# --- Stage 1: build the SPA (Vite) ---
FROM node:22-bookworm-slim AS frontend-build
WORKDIR /app/frontend

# Using a wildcard * ensures the build won't crash if package-lock.json is missing
COPY frontend/package*.json ./
RUN npm install --no-audit --no-fund --legacy-peer-deps

# Copy everything from the local frontend directory
COPY frontend/ ./

# Verify where index.html is and that it's copied correctly
RUN ls -la

# Environment variables
ENV VITE_API_URL=
ARG VITE_CLERK_PUBLISHABLE_KEY
ENV VITE_CLERK_PUBLISHABLE_KEY=$VITE_CLERK_PUBLISHABLE_KEY

RUN npm run build
# --- Stage 2: build the API bundle ---
# This backend is ESM JavaScript, so npm run build copies src/ to dist/.
FROM node:22-bookworm-slim AS backend-build
WORKDIR /app
COPY backend/package.json backend/package-lock.json ./
RUN npm install --no-audit --no-fund
COPY backend/ ./
RUN npm run build

# --- Stage 3: runtime image (only prod deps + built assets) ---
# Express serves API routes and static files from public/.
FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3001

COPY backend/package.json backend/package-lock.json ./
RUN npm install --omit=dev --no-audit --no-fund && npm cache clean --force

COPY --from=backend-build /app/dist ./dist
COPY --from=frontend-build /app/frontend/dist ./public

EXPOSE 3001
USER node

CMD ["node", "dist/index.js"]