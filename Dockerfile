ARG BUILD_FROM=ghcr.io/hassio-addons/base:14.0.3

# ==================== STAGE 1: BUILDER ====================
# We use standard node:20-slim (Debian) for compiling so glibc & native Tailwind v4 Rust bindings compile perfectly on ARM64/aarch64 (Raspberry Pi)
FROM node:20-slim AS builder

WORKDIR /build

# Copy manifest
COPY package.json ./

# Install all dependencies (development + production) for compiling the React/Vite app
RUN npm install --no-audit --no-fund

# Copy the rest of the workspace files
COPY . .

# Run the production build process (Vite + esbuild)
RUN npm run build

# ==================== STAGE 2: RUNTIME ====================
FROM $BUILD_FROM

# Install Node.js & npm for runtime execution
RUN apk add --no-cache nodejs npm

WORKDIR /app

# Copy package.json to install only production dependencies
COPY package.json ./

# Install runtime dependencies ONLY (express, etc) which have ZERO native binaries
RUN npm install --omit=dev --no-audit --no-fund

# Copy the pre-built files and run script from the builder stage
COPY --from=builder /build/dist ./dist
COPY --from=builder /build/run.sh ./run.sh

# Make the run script executable
RUN chmod a+x /app/run.sh

CMD [ "/app/run.sh" ]
