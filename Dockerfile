# Multi-stage Dockerfile for PlanTogather application
# This Dockerfile uses multi-stage builds to optimize the final image size
# and separate build environment from runtime environment

# ========================================
# STAGE 1: Build the React frontend
# ========================================
FROM node:18-alpine AS client-builder

# Set working directory for client build
WORKDIR /app/client

# Copy package files for client
COPY client/package*.json ./

    # Install client dependencies
    RUN npm install --only=production

# Copy client source code
COPY client/ ./

# Build the React application for production
# This creates optimized static files in the build directory
RUN npm run build

# ========================================
# STAGE 2: Build the Node.js backend
# ========================================
FROM node:18-alpine AS server-builder

# Set working directory for server build
WORKDIR /app/server

# Copy package files for server
COPY server/package*.json ./

    # Install server dependencies
    RUN npm install --only=production

# Copy server source code
COPY server/ ./

# ========================================
# STAGE 3: Production runtime
# ========================================
FROM node:18-alpine AS production

# Install dumb-init for proper signal handling
# This ensures that Node.js processes can be properly terminated
RUN apk add --no-cache dumb-init

# Create a non-root user for security
# Running as root in containers is a security risk
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Set working directory
WORKDIR /app

# Copy built client files from stage 1
# We only copy the build directory, not the entire client folder
COPY --from=client-builder /app/client/build ./client/build

# Copy server files from stage 2
COPY --from=server-builder /app/server ./server

# Copy package.json for server dependencies
COPY server/package*.json ./server/

# Install only production dependencies in the final image
WORKDIR /app/server
    RUN npm install --only=production

# Switch back to app directory
WORKDIR /app

# Create a script to serve static files and start the server
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'cd /app/server' >> /app/start.sh && \
    echo 'node app.js' >> /app/start.sh && \
    chmod +x /app/start.sh

# Change ownership of the app directory to the nodejs user
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose the port the app runs on
EXPOSE 5000

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["/app/start.sh"]
