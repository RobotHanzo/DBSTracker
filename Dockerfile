# Use Node 20 slim image which balances size and compatibility
FROM node:20-slim

# Install system dependencies required for compiling native modules like better-sqlite3
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

# Set the working directory inside the container
WORKDIR /app

# Copy dependency definitions
COPY package*.json ./
# If yarn.lock exists, copy it as well
COPY yarn.lock* ./

# Install project dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the Vite React frontend for production
RUN npm run build

# Expose the port the Express server listens on
EXPOSE 3000

# Set environment to production
ENV NODE_ENV=production
ENV PORT=3000

# Start the Node.js server
CMD ["npm", "start"]
