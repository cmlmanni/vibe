#!/bin/bash

# Startup script for Azure App Service
echo "Starting Vibe App deployment..."

# Ensure we're in the right directory
cd /home/site/wwwroot

# Install backend dependencies if they don't exist
if [ ! -d "vibe-backend/node_modules" ]; then
    echo "Installing backend dependencies..."
    cd vibe-backend
    npm install --production
    cd ..
fi

# Set environment variables for Node.js
export NODE_ENV=production
export PORT=80

# Start the Node.js server
echo "Starting Node.js server..."
cd vibe-backend
node server.js
