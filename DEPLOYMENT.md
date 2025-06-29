# 🚀 Deployment Guide - Walmart Supply Chain Platform

This guide will help you deploy your Walmart Supply Chain Platform to production using Railway (backend) and Vercel (frontend).

## 📋 Prerequisites

Before deploying, ensure you have:

1. **Node.js** (v16 or higher)
2. **Git** installed and configured
3. **Railway CLI**: `npm install -g @railway/cli`
4. **Vercel CLI**: `npm install -g vercel`
5. Accounts created on:
   - [Railway](https://railway.app) (for backend + database)
   - [Vercel](https://vercel.com) (for frontend)

## 🎯 Quick Deployment (Automated)

The easiest way to deploy is using our automated script:

```bash
./deploy.sh
```

This script will:
- ✅ Check all requirements
- 🚀 Deploy backend to Railway with PostgreSQL
- 🌐 Deploy frontend to Vercel
- 🔧 Configure CORS and environment variables automatically

## 📖 Manual Deployment Steps

If you prefer manual deployment or the script encounters issues:

### Step 1: Deploy Backend to Railway

1. **Login to Railway**
   ```bash
   railway login
   ```

2. **Create a new project**
   ```bash
   railway project new walmart-supply-chain
   ```

3. **Add PostgreSQL database**
   ```bash
   railway add postgresql
   ```

4. **Set environment variables**
   ```bash
   railway variables set SECRET_KEY="your-super-secret-production-key"
   railway variables set ENVIRONMENT="production"
   railway variables set ALLOWED_ORIGINS="http://localhost:3000"
   ```

5. **Deploy the backend**
   ```bash
   railway up
   ```

6. **Get your backend URL**
   ```bash
   railway status
   ```

### Step 2: Deploy Frontend to Vercel

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create production environment file**
   ```bash
   # Create .env.production
   echo "REACT_APP_API_URL=YOUR_RAILWAY_BACKEND_URL" > .env.production
   echo "REACT_APP_WS_URL=YOUR_RAILWAY_WEBSOCKET_URL" >> .env.production
   echo "REACT_APP_ENVIRONMENT=production" >> .env.production
   ```

4. **Deploy to Vercel**
   ```bash
   vercel --prod
   ```

### Step 3: Update CORS Configuration

Update Railway environment variables to include your Vercel frontend URL:

```bash
railway variables set ALLOWED_ORIGINS="http://localhost:3000,https://your-frontend-url.vercel.app"
```

## 🔧 Environment Variables Reference

### Backend (Railway)
```env
# Database (automatically set by Railway PostgreSQL)
DATABASE_URL=postgresql://...

# JWT Configuration
SECRET_KEY=your-super-secret-production-key-minimum-32-characters
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS Origins
ALLOWED_ORIGINS=http://localhost:3000,https://your-frontend-url.vercel.app

# Environment
ENVIRONMENT=production

# API Configuration
API_V1_STR=/api/v1
```

### Frontend (Vercel)
```env
# API Configuration
REACT_APP_API_URL=https://your-backend-url.railway.app
REACT_APP_WS_URL=wss://your-backend-url.railway.app
REACT_APP_ENVIRONMENT=production
```

## 🗄️ Database Migration

The application automatically creates tables on startup. For production, you might want to use Alembic for migrations:

```bash
# Generate migration
alembic revision --autogenerate -m "Initial migration"

# Apply migration
alembic upgrade head
```

## 📊 Monitoring and Logs

### Railway (Backend)
- Check logs: `railway logs`
- Monitor deployment: Railway dashboard
- Database metrics: PostgreSQL plugin dashboard

### Vercel (Frontend)
- Check deployment: Vercel dashboard
- View logs: Vercel Functions tab
- Analytics: Vercel Analytics (if enabled)

## 🔍 Testing Your Deployment

1. **Health Check**
   ```bash
   curl https://your-backend-url.railway.app/health
   ```

2. **API Test**
   ```bash
   curl https://your-backend-url.railway.app/api/inventory
   ```

3. **Frontend Test**
   - Visit your Vercel URL
   - Try logging in with demo credentials
   - Check that real-time updates work

## 🚨 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure frontend URL is in `ALLOWED_ORIGINS`
   - Check that URLs don't have trailing slashes

2. **Database Connection Issues**
   - Verify `DATABASE_URL` is set correctly
   - Check Railway PostgreSQL service status

3. **WebSocket Connection Fails**
   - Ensure WebSocket URL uses `wss://` for HTTPS sites
   - Check Railway WebSocket support

4. **Build Failures**
   - Check that all dependencies are in requirements.txt/package.json
   - Verify Python/Node.js versions

### Debug Commands

```bash
# Check Railway status
railway status

# View Railway logs
railway logs --follow

# Check Vercel deployments
vercel ls

# View Vercel logs
vercel logs [deployment-url]
```

## 📈 Performance Optimization

### Backend Optimizations
- Enable connection pooling (already configured)
- Use Redis for caching (optional upgrade)
- Implement database indexing for large datasets

### Frontend Optimizations  
- Enable Vercel Analytics
- Configure CDN for static assets
- Implement code splitting for larger components

## 💰 Cost Estimation

### Free Tier Limits
- **Railway**: $5 credit monthly, then usage-based
- **Vercel**: 100GB bandwidth, unlimited static sites
- **PostgreSQL**: Included with Railway backend

### Scaling Considerations
- Railway auto-scales based on usage
- Vercel handles traffic spikes automatically
- Database may need upgrading for high-volume usage

## 🔐 Security Checklist

- [ ] Changed default JWT secret key
- [ ] Enabled HTTPS (automatic with Railway/Vercel)
- [ ] Configured proper CORS origins
- [ ] Database credentials secured
- [ ] API rate limiting (implement if needed)
- [ ] Regular security updates

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review Railway/Vercel documentation
3. Check application logs for specific errors
4. Verify all environment variables are set correctly

---

**Happy Deploying! 🎉**

Your Walmart Supply Chain Platform will be live and ready to impress the hackathon judges! 