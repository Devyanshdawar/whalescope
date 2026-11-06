# Multi-stage production build using Node.js Alpine and NGINX Alpine
FROM node:22-alpine AS builder

WORKDIR /app

# Ingest package configurations
COPY package*.json pnpm-lock.yaml* ./

# Install project dependencies
RUN npm install

# Copy application source code
COPY . .

# Compile optimized static client bundles
RUN npm run build

# Stage 2: High-Performance NGINX Edge Container
FROM nginx:alpine

# Remove default boilerplate configuration
RUN rm -rf /etc/nginx/conf.d/default.conf

# Ingest optimized production NGINX reverse-proxy configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Ingest compiled production artifacts from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose standard HTTP web traffic port
EXPOSE 80

# Health check probe for container orchestration (AWS ECS, Kubernetes, Nomad)
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Launch NGINX in foreground mode
CMD ["nginx", "-g", "daemon off;"]

