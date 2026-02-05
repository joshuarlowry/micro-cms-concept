FROM node:24.13.0-alpine AS builder

WORKDIR /app

# Build argument for API URL (embedded at build time by Vite)
ARG VITE_API_URL=http://localhost:8000
ENV VITE_API_URL=$VITE_API_URL

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source
COPY . .

# Build (VITE_API_URL will be embedded in the bundle)
RUN npm run build

# Production stage
FROM node:24.13.0-alpine

WORKDIR /app

# Install serve to run production build
RUN npm install -g serve

# Copy built app from builder
COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000"]
