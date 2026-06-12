ARG BUILD_FROM=ghcr.io/hassio-addons/base:14.0.3
FROM $BUILD_FROM

# Install Node.js and basic building tools if needed, although alpine package is usually enough
RUN apk add --no-cache nodejs npm

# Setup working directory
WORKDIR /app

# Copy dependency manifest first to take advantage of Docker caching and isolate installation
COPY package.json ./

# Strictly clean and install fresh dependencies targetting the platform we are building on
RUN rm -rf node_modules package-lock.json && \
    npm install --no-audit --no-fund

# Now copy the rest of the application files
COPY . .

# Run build 
RUN npm run build

# Make the run script executable
RUN chmod a+x /app/run.sh

CMD [ "/app/run.sh" ]
