# 🚀 Production Deployment Guide

Panduan lengkap untuk deploy WhatsApp Bot Reservasi Klinik/Puskesmas ke production.

---

## 📋 Pre-Deployment Checklist

- [ ] Database production sudah siap (PostgreSQL/MySQL recommended)
- [ ] Server/VPS sudah setup dengan Node.js >= 18.x
- [ ] Domain (optional) sudah pointing ke server
- [ ] SSL Certificate (jika menggunakan HTTPS)
- [ ] Environment variables production sudah disiapkan
- [ ] WhatsApp Business number sudah siap
- [ ] Backup strategy sudah direncanakan

---

## 🖥️ Server Requirements

### Minimum Specifications
- **RAM**: 1 GB
- **CPU**: 1 Core
- **Storage**: 10 GB
- **OS**: Ubuntu 20.04+ / Debian 11+ / CentOS 8+
- **Node.js**: 18.x atau lebih tinggi
- **Database**: PostgreSQL 13+ atau MySQL 8+

### Recommended Specifications
- **RAM**: 2 GB atau lebih
- **CPU**: 2 Cores
- **Storage**: 20 GB SSD
- **Bandwidth**: Unlimited atau minimal 1 TB/month

---

## 🏗️ Deployment Options

### Option 1: VPS (Digital Ocean, AWS EC2, Linode, dll)
### Option 2: PaaS (Heroku, Railway, Render, dll)
### Option 3: Docker Container
### Option 4: Bare Metal Server

---

## 📦 Option 1: Deploy ke VPS (Ubuntu)

### 1. Setup Server

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install build tools
sudo apt install -y build-essential git

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install PM2 (Process Manager)
sudo npm install -g pm2
```

### 2. Setup Database

```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE clinic;
CREATE USER clinic_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE clinic TO clinic_user;
\q
```

### 3. Setup Application

```bash
# Create app directory
sudo mkdir -p /var/www/klinik-reservation-bot
sudo chown $USER:$USER /var/www/klinik-reservation-bot

# Clone repository
cd /var/www/klinik-reservation-bot
git clone https://github.com/alrescha79-cmd/klinik-reservation-bot.git .

# Install dependencies
npm install --production

# Setup environment
cp .env.example .env
nano .env
```

**Production `.env`:**
```env
NODE_ENV=production
PORT=3000
DATABASE_URL="postgresql://clinic_user:your_secure_password@localhost:5432/clinic"
ADMIN_PHONE="628123456789"
SESSION_FOLDER="/var/www/wa-bot-klinik/config/baileysSession"
LOG_LEVEL=info
```

### 4. Database Migration

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed initial data (optional)
npx prisma db seed
```

### 5. Build & Start with PM2

```bash
# Build TypeScript
npm run build

# Start with PM2
pm2 start dist/server.js --name wa-bot-klinik

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup
# Follow the command output
```

### 6. Configure Nginx (Reverse Proxy)

```bash
# Install Nginx
sudo apt install -y nginx

# Create Nginx config
sudo nano /etc/nginx/sites-available/wa-bot-klinik
```

**Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/wa-bot-klinik /etc/nginx/sites-enabled/

# Test Nginx config
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### 7. Setup SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal is setup automatically
```

### 8. Setup Firewall

```bash
# Enable UFW
sudo ufw enable

# Allow SSH
sudo ufw allow ssh

# Allow HTTP & HTTPS
sudo ufw allow 'Nginx Full'

# Check status
sudo ufw status
```

---

## 🐳 Option 2: Deploy dengan Docker

### 1. Create Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY . .
RUN npx prisma generate
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

### 2. Create docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://postgres:password@db:5432/clinic
      ADMIN_PHONE: "628123456789"
    volumes:
      - ./config/baileysSession:/app/config/baileysSession
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: clinic
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
```

### 3. Deploy

```bash
# Build and start
docker-compose up -d

# Run migrations
docker-compose exec app npx prisma migrate deploy

# View logs
docker-compose logs -f app
```

---

## ☁️ Option 3: Deploy ke Railway/Render

### Railway

1. Push code ke GitHub
2. Login ke [Railway.app](https://railway.app)
3. Click "New Project" → "Deploy from GitHub"
4. Pilih repository
5. Add PostgreSQL database
6. Set environment variables
7. Deploy

### Render

1. Push code ke GitHub
2. Login ke [Render.com](https://render.com)
3. Click "New +" → "Web Service"
4. Connect repository
5. Build Command: `npm install && npx prisma generate && npm run build`
6. Start Command: `npm start`
7. Add PostgreSQL database
8. Set environment variables
9. Deploy

---

## 🔐 Security Best Practices

### 1. Environment Variables
- Jangan commit `.env` ke repository
- Gunakan secret management service (AWS Secrets Manager, HashiCorp Vault)
- Rotate credentials secara berkala

### 2. Database Security
```sql
-- Limit user permissions
REVOKE ALL ON DATABASE clinic FROM PUBLIC;
GRANT CONNECT ON DATABASE clinic TO clinic_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO clinic_user;
```

### 3. Rate Limiting

Install express-rate-limit:
```bash
npm install express-rate-limit
```

Update `src/app.ts`:
```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});

app.use('/api/', limiter);
```

### 4. Helmet (Security Headers)

```bash
npm install helmet
```

```typescript
import helmet from 'helmet';
app.use(helmet());
```

### 5. CORS Configuration

```bash
npm install cors
```

```typescript
import cors from 'cors';

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true
}));
```

---

## 📊 Monitoring & Logging

### 1. PM2 Monitoring

```bash
# View logs
pm2 logs wa-bot-klinik

# Monitor resources
pm2 monit

# View status
pm2 status
```

### 2. Setup Log Rotation

```bash
pm2 install pm2-logrotate

# Configure
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### 3. Application Monitoring

Recommended tools:
- **PM2 Plus**: Built-in monitoring
- **New Relic**: APM solution
- **Datadog**: Full-stack monitoring
- **Sentry**: Error tracking

**Setup Sentry:**
```bash
npm install @sentry/node
```

```typescript
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});

// Add to error handling
app.use(Sentry.Handlers.errorHandler());
```

---

## 💾 Backup Strategy

### 1. Database Backup (PostgreSQL)

```bash
# Create backup script
nano /usr/local/bin/backup-db.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/clinic"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

pg_dump -U clinic_user -h localhost clinic > $BACKUP_DIR/clinic_$DATE.sql

# Keep only last 7 days
find $BACKUP_DIR -name "clinic_*.sql" -mtime +7 -delete
```

```bash
# Make executable
chmod +x /usr/local/bin/backup-db.sh

# Add to crontab (daily at 2 AM)
crontab -e
0 2 * * * /usr/local/bin/backup-db.sh
```

### 2. WhatsApp Session Backup

```bash
# Backup session folder
cp -r /var/www/wa-bot-klinik/config/baileysSession /var/backups/wa-session-$(date +%Y%m%d)
```

### 3. Automated Cloud Backup

Install rclone:
```bash
curl https://rclone.org/install.sh | sudo bash

# Configure (for AWS S3, Google Drive, etc)
rclone config
```

---

## 🔄 Update & Rollback

### Update Application

```bash
cd /var/www/wa-bot-klinik

# Pull latest code
git pull origin main

# Install dependencies
npm install --production

# Run migrations
npx prisma migrate deploy

# Rebuild
npm run build

# Restart
pm2 restart wa-bot-klinik
```

### Rollback

```bash
# Rollback to previous commit
git log --oneline  # Find commit hash
git checkout <commit-hash>

npm install --production
npx prisma migrate deploy
npm run build
pm2 restart wa-bot-klinik
```

---

## 🩺 Health Checks

Add health check endpoint in `src/app.ts`:

```typescript
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
});
```

Setup monitoring:
```bash
# Add to crontab
*/5 * * * * curl -f http://localhost:3000/health || systemctl restart wa-bot-klinik
```

---

## 📈 Performance Optimization

### 1. Database Connection Pooling

Update `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  shadowDatabaseUrl = env("SHADOW_DATABASE_URL")
  
  // Connection pooling
  connectionLimit = 10
}
```

### 2. Enable Compression

```bash
npm install compression
```

```typescript
import compression from 'compression';
app.use(compression());
```

### 3. PM2 Cluster Mode

```bash
pm2 start dist/server.js -i max --name wa-bot-klinik
```

---

## 🆘 Troubleshooting

### Bot Not Responding
```bash
# Check logs
pm2 logs wa-bot-klinik

# Restart
pm2 restart wa-bot-klinik

# Clear session and re-scan QR
rm -rf config/baileysSession/*
pm2 restart wa-bot-klinik
```

### Database Connection Issues
```bash
# Test connection
psql -U clinic_user -h localhost -d clinic

# Check connections
SELECT * FROM pg_stat_activity;
```

### Memory Issues
```bash
# Check memory usage
pm2 monit

# Restart if memory leak
pm2 restart wa-bot-klinik
```

---

## 📞 Support

- Check logs: `pm2 logs wa-bot-klinik`
- Monitor: `pm2 monit`
- Database: `npx prisma studio`
- Application health: `curl http://localhost:3000/health`

---

## 🎯 Production Checklist

- [x] Environment variables configured
- [x] Database migrated
- [x] SSL certificate installed
- [x] Firewall configured
- [x] Backup strategy implemented
- [x] Monitoring setup
- [x] Log rotation configured
- [x] Health checks enabled
- [x] Security headers added
- [x] Rate limiting enabled
- [x] PM2 startup script configured
- [x] Documentation updated
