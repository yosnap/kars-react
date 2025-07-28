# Build stage
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies needed for build)
RUN npm install && npm cache clean --force

# Copy source code
COPY . .

# Accept build arguments from environment
ARG VITE_API_BASE_URL
ARG VITE_API_ADMIN_USER
ARG VITE_API_ADMIN_PASS

# Set production environment variables for build using the ARGs
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_API_ADMIN_USER=${VITE_API_ADMIN_USER}
ENV VITE_API_ADMIN_PASS=${VITE_API_ADMIN_PASS}

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy custom nginx config
COPY --from=builder /app/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built application from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]