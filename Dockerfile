# Use Node.js LTS alpine image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies
COPY server/package*.json ./
RUN npm ci --only=production

# Copy source code
COPY server/ .

# Expose port
EXPOSE 3001

# Run the application
CMD ["node", "server.js"]