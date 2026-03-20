# ── Build stage ──────────────────────────────────────────────────────────────
FROM node:20-alpine AS build
WORKDIR /app

# Install dependencies first (layer caching)
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .

# VITE_API_URL is injected at build time so the bundler can inline it
ARG VITE_API_URL=http://localhost:5242
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# ── Runtime stage (Nginx) ─────────────────────────────────────────────────────
FROM nginx:1.25-alpine AS runtime

# Remove the default nginx welcome page
RUN rm -rf /usr/share/nginx/html/*

COPY --from=build /app/dist /usr/share/nginx/html

# Nginx config: serve SPA and proxy /api + WebSockets to the backend
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
