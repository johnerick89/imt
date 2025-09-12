# Build stage with Node
FROM node:lts-alpine AS build

# Accept build-time argument for VITE_API_BASE_URL
ARG VITE_API_BASE_URL
# Set as environment variable for Vite to embed in bundle
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV NPM_CONFIG_UPDATE_NOTIFIER=false
ENV NPM_CONFIG_FUND=false

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . ./
RUN npm run build  # Vite embeds VITE_API_BASE_URL into bundle

# Serve stage with Caddy
FROM caddy

WORKDIR /app

COPY Caddyfile ./
RUN caddy fmt Caddyfile --overwrite

COPY --from=build /app/dist ./dist

CMD ["caddy", "run", "--config", "Caddyfile", "--adapter", "caddyfile"]