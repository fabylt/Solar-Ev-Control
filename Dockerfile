ARG BUILD_FROM=ghcr.io/hassio-addons/base:14.0.3
FROM $BUILD_FROM

# Install Node.js and glibc compatibility layers for native bindings (e.g., Tailwind CSS oxide compiler)
RUN apk add --no-cache nodejs npm libc6-compat gcompat

# Setup working directory
WORKDIR /app
COPY . .

# Install dependencies and build
RUN npm install
RUN npm run build

# Make the run script executable
RUN chmod a+x /app/run.sh

CMD [ "/app/run.sh" ]
