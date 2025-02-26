# LMS Application Deployment Guide

## Prerequisites
- Node.js 20.x
- PostgreSQL 16+
- PM2 (install globally using `npm install -g pm2`)
- Git

## Quick Deployment Steps

1. **Clone and Setup**
```bash
# Clone the repository
git clone <your-repo-url>
cd <repo-directory>

# Make deploy script executable
chmod +x deploy.sh

# Run deployment script
./deploy.sh
```

2. **Environment Setup**
Create `.env` file with:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/lms_db
NODE_ENV=production
PORT=5000
SESSION_SECRET=your-secure-session-secret
```

3. **Database Setup**
```bash
# Create database and user
sudo -u postgres psql
CREATE DATABASE lms_db;
CREATE USER lms_user WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE lms_db TO lms_user;
\q
```

## Common Issues and Solutions

### PM2 ES Module Error
If you encounter ES Module errors with PM2, ensure:
1. The ecosystem config file is named `ecosystem.config.cjs`
2. You've built the application using `npm run build`
3. The dist directory exists before starting PM2

### Port Configuration
- The application runs on port 5000 by default
- Ensure this port is available and not blocked by firewall
- Configure Nginx to proxy requests to this port

### Database Migrations
- The application uses Drizzle ORM
- Migrations are handled automatically by `npm run db:push`
- Check database connection string in `.env` file if you encounter database errors

## Nginx Configuration

Create `/etc/nginx/sites-available/lms-app`:
```nginx
server {
    listen 80;
    server_name your_domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Then enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/lms-app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Maintenance

### Logs
- Application logs: `pm2 logs lms-app`
- Error logs: `tail -f logs/err.log`
- Output logs: `tail -f logs/out.log`

### Updates
```bash
git pull
./deploy.sh
```

For support or issues, please contact the development team.