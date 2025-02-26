#!/bin/bash

echo "Testing PM2 application status..."
pm2 list | grep lms-app

echo "Testing direct application access..."
curl -v http://localhost:5000

echo "Testing Nginx proxy..."
curl -v http://localhost
