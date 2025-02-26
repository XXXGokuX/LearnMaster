#!/bin/bash

echo "1. Checking Nginx status..."
systemctl status nginx

echo "2. Testing Nginx configuration..."
nginx -t

echo "3. Checking if port 5000 is being used..."
netstat -tlpn | grep :5000

echo "4. Checking if port 80 is being used by Nginx..."
netstat -tlpn | grep :80

echo "5. Testing local connection to the application..."
curl -I http://localhost:5000

echo "6. Checking Nginx error logs..."
tail -n 50 /var/log/nginx/error.log

echo "7. Checking application accessibility through Nginx..."
curl -I http://localhost
