# Stage 1: Build
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy source code
COPY . .

# Set environment variables
ENV NODE_ENV=production

# Build the frontend
RUN npm run build

# Stage 2: Serve with Nginx
# Unprivileged variant listens on 8080 and runs as a non-root user (uid 101) out of the box,
# so we don't need root in the container just to bind to port 80.
FROM nginxinc/nginx-unprivileged:stable-alpine

# Remove default Nginx static assets
USER root
RUN rm -rf /usr/share/nginx/html/*
USER nginx

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 8080
EXPOSE 8080

# Health check
#HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
#  CMD curl -f http://localhost/ || exit 1

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
