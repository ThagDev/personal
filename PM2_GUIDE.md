# PM2 Guide for Personal API

## Cài đặt PM2 (nếu chưa có)
```bash
npm install -g pm2
```

## Development Mode

### 1. Build project trước
```bash
npm run build
```

### 2. Chạy với PM2
```bash
# Chạy development mode
npm run pm2:dev

# Hoặc trực tiếp
pm2 start ecosystem.config.js --env development
```

### 3. Monitoring & Logs
```bash
# Xem logs realtime
npm run pm2:logs

# Monitor processes
npm run pm2:monit

# Xem list processes
pm2 list
```

## Production Mode

### 1. Build và start production
```bash
npm run build
npm run pm2:prod
```

### 2. Save config và setup startup
```bash
# Lưu config hiện tại
npm run pm2:save

# Setup tự động start khi boot
npm run pm2:startup
```

## Useful Commands

### Process Management
```bash
# Stop all processes
npm run pm2:stop

# Restart all processes  
npm run pm2:restart

# Reload without downtime
npm run pm2:reload

# Delete processes
npm run pm2:delete
```

### Debugging
```bash
# Show detailed info
pm2 show personal-api

# Real-time monitoring
pm2 monit

# Flush all logs
pm2 flush

# Reload logs
pm2 reloadLogs
```

### Log Files Location
- Combined: `./logs/pm2-combined.log`
- Output: `./logs/pm2-out.log` 
- Error: `./logs/pm2-error.log`

## Environment Variables
- Development: Loads from `.env` 
- Production: Loads from `.env.production` or environment

## Tips
- Luôn `npm run build` trước khi start PM2
- Sử dụng `pm2 logs --lines 100` để xem nhiều logs hơn
- `pm2 reload` tốt hơn `pm2 restart` ở production (zero downtime)