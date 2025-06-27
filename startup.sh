#!/bin/bash

# This script runs when the Azure App Service container starts
echo "Starting Azure App Service deployment..."

# Navigate to the backend directory
cd /home/site/wwwroot/vibe-backend

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing Node.js dependencies..."
    npm install --production
fi

# Start the Node.js application
echo "Starting Node.js server..."
node server.js
