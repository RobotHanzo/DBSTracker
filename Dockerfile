# Use Node 24 slim image which balances size and compatibility
FROM node:24-slim

# Install system dependencies required for compiling native modules like better-sqlite3
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

# Set the working directory inside the container
WORKDIR /app

# Copy dependency definitions
COPY package.json yarn.lock* ./

# Install project dependencies
RUN yarn install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Build the Vite React frontend for production
RUN yarn build

# Expose the port the Express server listens on
EXPOSE 3000

# Set environment to production
ENV NODE_ENV=production
ENV PORT=3000

# Start the Node.js server
CMD ["yarn", "start"]
