# 🚀 Deployment Guide - NestJS to Vercel

## 📋 **Overview**

This guide explains how to deploy the NestJS application to Vercel with proper environment separation.

---

## 🎯 **Environment Strategy**

### Development Environment
- **Ngrok**: ✅ Enabled for remote testing
- **MongoDB**: Local instance or Atlas
- **Logging**: Detailed debug logs
- **CORS**: Allow localhost and ngrok domains

### Production Environment (Vercel)
- **Ngrok**: ❌ Disabled (not needed)
- **MongoDB**: Atlas or remote instance
- **Logging**: Production-level logs
- **CORS**: Allow production domains only

---

## 🔧 **Configuration Files**

### `main.ts` Structure
```typescript
// Production: Vercel serverless handler
export default async function handler(req, res) {
  // Optimized for serverless
}

// Development: Traditional NestJS bootstrap
async function bootstrap() {
  // Local development with ngrok
}

// Smart environment detection
if (process.env.VERCEL !== '1' && require.main === module) {
  bootstrap();
}
```

### `vercel.json` Configuration
```json
{
  "version": 2,
  "functions": {
    "dist/main.js": {
      "runtime": "nodejs18.x",
      "memory": 1024,
      "maxDuration": 30
    }
  },
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/node",
      "config": {
        "includeFiles": ["dist/**"]
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "dist/main.js"
    }
  ]
}
```

---

## 🚀 **Deployment Steps**

### 1. **Prepare Environment Variables**

Create `.env.production` or set in Vercel dashboard:
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
JWT_SECRET=your-production-jwt-secret
SMTP_HOST=your-smtp-host
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password
```

### 2. **Build Application**
```bash
npm run build
```

### 3. **Test Locally**
```bash
# Development mode (with ngrok)
npm run start:dev

# Production mode (without ngrok)
NODE_ENV=production npm run start:prod
```

### 4. **Deploy to Vercel**

#### First-time Setup:
```bash
npm install -g vercel
vercel login
```

#### Deploy:
```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

---

## 🔍 **Environment Detection Logic**

### Development Detection
- `NODE_ENV !== 'production'`
- `process.env.VERCEL !== '1'`
- `require.main === module`

### Production Detection  
- `process.env.VERCEL === '1'` (Vercel environment)
- `NODE_ENV === 'production'`

### Feature Flags
```typescript
// Ngrok only in development
if (process.env.NODE_ENV === 'development') {
  // Start ngrok tunnel
}

// Swagger in development and staging
if (process.env.NODE_ENV !== 'production') {
  setupSwagger(app);
}
```

---

## 📊 **Performance Optimizations**

### Serverless Optimizations
- **Global app instance**: Reuse across invocations
- **Dynamic imports**: Load ngrok only when needed
- **Memory settings**: 1024MB for complex operations
- **Timeout**: 30s for file operations

### CORS Configuration
```typescript
// Development
origin: [
  'http://localhost:3000',
  /^https:\/\/.*\.ngrok\.io$/,
]

// Production
origin: [
  'https://your-frontend.vercel.app',
  /^https:\/\/.*\.vercel\.app$/,
]
```

---

## 🛠️ **Troubleshooting**

### Common Issues

#### 1. "No exports found in module"
**Solution**: Ensure `export default` handler in main.ts

#### 2. "Module not found: ngrok"
**Solution**: Use dynamic import for development-only dependencies

#### 3. "Function timeout"
**Solution**: Increase `maxDuration` in vercel.json

#### 4. "CORS errors"
**Solution**: Update CORS origins for production domains

### Debug Commands
```bash
# Check build output
ls -la dist/

# Test production build locally
NODE_ENV=production node dist/main.js

# Check environment variables
vercel env ls
```

---

## 📈 **Monitoring & Logs**

### Vercel Dashboard
- Function logs and metrics
- Performance monitoring
- Error tracking

### Application Logs
```typescript
Logger.log(`🚀 Server running in ${process.env.NODE_ENV} mode`);
Logger.log(`📊 Memory usage: ${process.memoryUsage().heapUsed / 1024 / 1024} MB`);
```

---

## 🔐 **Security Considerations**

### Environment Variables
- ✅ Use Vercel environment variables
- ❌ Never commit `.env` files
- ✅ Different secrets for each environment

### CORS Policy
- ✅ Restrict origins in production
- ✅ Use HTTPS only in production
- ❌ Don't use wildcards in production

### MongoDB Security
- ✅ Use MongoDB Atlas with IP whitelist
- ✅ Strong connection strings with auth
- ✅ Database-level user permissions

---

## 📚 **Additional Resources**

- [Vercel Node.js Runtime](https://vercel.com/docs/runtimes/node-js)
- [NestJS Deployment](https://docs.nestjs.com/deployment)
- [MongoDB Atlas Setup](https://www.mongodb.com/cloud/atlas)

---

**🎉 Happy Deploying!**
