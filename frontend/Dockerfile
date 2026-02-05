FROM node:24.13.0-alpine AS builder

WORKDIR /app

# Use empty API URL so requests are relative (proxied by nginx)
ENV VITE_API_URL=""

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source
COPY . .

# Build (VITE_API_URL will be embedded in the bundle)
RUN npm run build

# Production stage with nginx
FROM nginx:alpine

# Copy built app
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
