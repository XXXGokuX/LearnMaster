#!/bin/bash

# Exit on error
set -e

echo "Starting deployment process..."

# Install dependencies
echo "Installing dependencies..."
npm install

# Build the application
echo "Building the application..."
npm run build

# Create logs directory for PM2
mkdir -p logs

# Run database migrations
echo "Setting up database..."
npm run db:push

# Start the application with PM2
echo "Starting the application..."
pm2 start ecosystem.config.cjs --env production

# Save PM2 process list
pm2 save

echo "Deployment completed!"
