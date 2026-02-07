# ================================
# Stage 1: Dependencies
# ================================
FROM node:20-alpine AS deps

WORKDIR /app

# Install dependencies for native modules
RUN apk add --no-cache libc6-compat

# Copy only package files for better caching
COPY package*.json ./

# Install dependencies
RUN npm ci || npm install

# ================================
# Stage 2: Builder
# ================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Accept VITE_API_URL at build time so production builds can be configured
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

# Build application
# Vite will tree-shake and minify automatically
RUN npm run build

# ================================
# Stage 3: Production with Nginx
# ================================
FROM nginx:1.25-alpine AS runner

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Remove default nginx config and static files
RUN rm -rf /etc/nginx/conf.d/default.conf /usr/share/nginx/html/*

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Create non-root user and set permissions
RUN addgroup -g 101 -S nginx && \
    adduser -S -D -H -u 101 -h /var/cache/nginx -s /sbin/nologin -G nginx -g nginx nginx 2>/dev/null || true && \
    chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid && \
    chmod -R 755 /usr/share/nginx/html

# Switch to non-root user
USER nginx

# Expose port nginx listens on (80)
EXPOSE 80

# Health check (check nginx on port 80)
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

# Use dumb-init and start nginx
ENTRYPOINT ["dumb-init", "--"]
CMD ["nginx", "-g", "daemon off;"]
