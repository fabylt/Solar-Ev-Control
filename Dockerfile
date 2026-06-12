ARG BUILD_FROM=ghcr.io/hassio-addons/base:14.0.3
FROM $BUILD_FROM

# Install Node.js and basic building tools with musl-compatibility for native bindings
RUN apk add --no-cache nodejs npm libc6-compat gcompat python3 build-base

# Setup working directory
WORKDIR /app

# Copy package list
COPY package.json ./

# Force NPM to install correct platform-specific dependencies and rebuild the native Tailwind compiler
# This prevents NPM caching issues across architectures (e.g. x64 to ARM64 / Raspberry Pi)
RUN rm -rf node_modules package-lock.json && \
    npm install --no-audit --no-fund --include=optional && \
    npm rebuild @tailwindcss/oxide

# Now copy the remaining application files
COPY . .

# Run production build
RUN npm run build

# Make the run script executable
RUN chmod a+x /app/run.sh

CMD [ "/app/run.sh" ]

