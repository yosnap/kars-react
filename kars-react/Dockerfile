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

# Set production environment variables for build
ENV VITE_API_BASE_URL=/api
ENV VITE_API_ADMIN_USER=admin
ENV VITE_API_ADMIN_PASS=Motoraldia.2025!

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