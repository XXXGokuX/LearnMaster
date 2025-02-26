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

# Create necessary directories
echo "Setting up directories..."
mkdir -p logs
mkdir -p uploads

# Run database migrations
echo "Setting up database..."
npm run db:push

# Setup environment if not exists
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cp .env.example .env
    echo "Please update .env with your production values"
fi

# Ensure correct permissions
echo "Setting permissions..."
chmod -R 755 .
chmod -R 777 uploads logs

# Start/Restart the application with PM2
echo "Starting/Restarting the application..."
if pm2 list | grep -q "lms-app"; then
    pm2 reload lms-app
else
    pm2 start ecosystem.config.js --env production
fi

# Save PM2 process list
pm2 save

# Setup Nginx (if not already configured)
if [ ! -f /etc/nginx/sites-enabled/lms-app ]; then
    echo "Setting up Nginx configuration..."
    sudo cp nginx.conf /etc/nginx/sites-available/lms-app
    sudo ln -s /etc/nginx/sites-available/lms-app /etc/nginx/sites-enabled/
    sudo nginx -t && sudo systemctl restart nginx
fi

echo "Deployment completed!"
echo "Please ensure you have:"
echo "1. Updated the .env file with production values"
echo "2. Configured your domain in Nginx configuration"
echo "3. Setup SSL certificate using Hostinger's SSL manager"