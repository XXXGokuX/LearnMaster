# LMS Application Deployment Guide

## Prerequisites
- Node.js 20.x
- PostgreSQL 15+
- PM2 (install globally using `npm install -g pm2`)
- Git

## Deployment Steps on Hostinger VPS

### 1. Initial Server Setup
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 globally
npm install -g pm2

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y
```

### 2. Clone and Setup Application
```bash
# Clone the repository
git clone <your-repo-url>
cd <repo-directory>

# Install dependencies
npm install

# Build the application
npm run build
```

### 3. Database Setup
```bash
# Create database and user
sudo -u postgres psql
CREATE DATABASE lms_db;
CREATE USER lms_user WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE lms_db TO lms_user;
\q

# Set up environment variables
cp .env.example .env
# Edit .env with your production values
```

### 4. Environment Variables
Create `.env` file with the following variables:
```
DATABASE_URL=postgresql://lms_user:your_password@localhost:5432/lms_db
NODE_ENV=production
PORT=3000
SESSION_SECRET=your-secure-session-secret
FRONTEND_URL=https://yourdomain.com
```

### 5. Start Application
```bash
# Start the application using PM2
pm2 start ecosystem.config.js --env production

# Save PM2 process list and set up startup script
pm2 save
pm2 startup
```

### 6. Nginx Configuration
Install and configure Nginx as a reverse proxy:

```bash
sudo apt install nginx -y
```

Create Nginx configuration:
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 7. SSL Setup
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtain SSL certificate
sudo certbot --nginx -d yourdomain.com
```

### 8. Monitoring
Monitor your application using PM2:
```bash
pm2 monit
pm2 logs
```

## Maintenance

### Updates
```bash
# Pull latest changes
git pull

# Install dependencies
npm install

# Build the application
npm run build

# Restart the application
pm2 restart lms-app
```

### Backup
Regular database backups:
```bash
pg_dump -U lms_user lms_db > backup_$(date +%Y%m%d).sql
```

## Troubleshooting

- Check application logs: `pm2 logs lms-app`
- Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
- Check Node.js process: `pm2 list`
- Database connection: `psql -U lms_user -d lms_db -h localhost`

## Security Considerations

1. Keep all dependencies updated
2. Regularly update system packages
3. Use strong passwords
4. Configure firewall rules
5. Regular security audits
6. Monitor server resources

For support or issues, please contact the development team.
