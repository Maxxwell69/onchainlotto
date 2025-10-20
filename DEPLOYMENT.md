# 🚀 LOTTO AF Drawing Deployment Guide

## Quick Start: GitHub + Railway Deployment

### ✅ Current Status
Your project is fully committed to Git with 2 commits:
1. Initial LOTTO AF system with all features
2. Railway deployment configuration

---

## 📋 Step-by-Step Deployment

### **STEP 1: Create GitHub Repository**

1. Go to [GitHub.com](https://github.com) and login
2. Click the **"+"** in top right → **"New repository"**
3. Repository settings:
   - **Name**: `lotto-af-drawing` (or your preferred name)
   - **Description**: "On-chain drawing system for LOTTA AF token on Solana"
   - **Visibility**: Public or Private (your choice)
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
4. Click **"Create repository"**

### **STEP 2: Push to GitHub**

GitHub will show you commands. Run these in your terminal:

```bash
# Add your GitHub repository URL (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/lotto-af-drawing.git

# Push your code
git branch -M main
git push -u origin main
```

Or if you want to keep the master branch:
```bash
git remote add origin https://github.com/YOUR_USERNAME/lotto-af-drawing.git
git push -u origin master
```

### **STEP 3: Deploy to Railway**

1. **Go to Railway**: [https://railway.app](https://railway.app)

2. **Sign Up/Login**: 
   - Click "Login with GitHub" (recommended)
   - Authorize Railway to access your repositories

3. **Create New Project**:
   - Click **"New Project"**
   - Select **"Deploy from GitHub repo"**
   - Find and select `lotto-af-drawing`

4. **Railway Auto-Detection**:
   - Railway will detect Node.js
   - It will see `package.json` and `railway.json`
   - Build will start automatically

5. **Add Environment Variables**:
   - In Railway dashboard, click on your service
   - Go to **"Variables"** tab
   - Add these variables:
     ```
     HELIUS_API_KEY = f749d6d6-c885-4a88-97a0-6ec0649500ea
     NODE_ENV = production
     ```
   - Railway automatically sets `PORT` - don't override it

6. **Deploy**:
   - Click **"Deploy"** (if not auto-deployed)
   - Wait 2-3 minutes for build to complete
   - Check the **"Deployments"** tab for status

7. **Get Your URL**:
   - Go to **"Settings"** tab
   - Under **"Domains"**, click **"Generate Domain"**
   - Your app will be live at something like:
     `https://lotto-af-drawing-production.up.railway.app`

---

## 🎯 What Gets Deployed

### Files Included:
- ✅ `server.js` - Backend API
- ✅ `public/` - All frontend files (index.html, admin.html, scan.html, etc.)
- ✅ `blocklist.json` - Initial blocklist with liquidity pool
- ✅ `package.json` - Dependencies
- ✅ `railway.json` - Railway configuration
- ✅ `Procfile` - Process configuration

### Files Excluded (.gitignore):
- ❌ `node_modules/` - Railway installs these fresh
- ❌ `.env` - Use Railway environment variables instead

---

## 🔧 Railway Configuration Details

### `railway.json` settings:
```json
{
  "build": {
    "builder": "NIXPACKS"  // Auto-detects Node.js
  },
  "deploy": {
    "startCommand": "node server.js",  // How to start your app
    "restartPolicyType": "ON_FAILURE",  // Auto-restart on crashes
    "restartPolicyMaxRetries": 10  // Max restart attempts
  }
}
```

### Railway will:
1. Clone your GitHub repo
2. Run `npm install` to install dependencies
3. Execute `node server.js` to start the server
4. Expose your app on a public URL with HTTPS
5. Auto-redeploy when you push to GitHub

---

## 🎨 Post-Deployment Checklist

After deployment, test these features:

### Main Drawing Page (`/`)
- [ ] Create drawing draw with date/time range
- [ ] Draw drawing balls and see results
- [ ] Save drawing results to localStorage
- [ ] Load saved drawing results
- [ ] Export results to CSV
- [ ] Open results in new window
- [ ] Stop button works during analysis

### Admin Panel (`/admin.html`)
- [ ] View current blocklist
- [ ] Add new wallets to blocklist
- [ ] Remove wallets from blocklist
- [ ] Blocklist persists on server

### Diagnostic Scan (`/scan.html`)
- [ ] Scan all buys without filters
- [ ] View detailed transaction data
- [ ] Compare with main drawing results

---

## 🔄 Updating Your Deployed App

After making changes locally:

```bash
# Commit your changes
git add .
git commit -m "Description of your changes"

# Push to GitHub
git push

# Railway will automatically detect the push and redeploy! 🎉
```

---

## 💡 Tips for Railway

### Monitoring:
- **Logs**: Check Railway logs for debugging
- **Metrics**: View CPU, memory, network usage
- **Deployments**: See deployment history

### Free Tier Limits:
- 500 execution hours/month (enough for small-medium traffic)
- $5 free credit to start
- Upgrade to Pro ($5/month) for unlimited usage

### Performance:
- Railway servers are fast and globally distributed
- Your drawing analysis will be as fast as Helius/CoinGecko APIs allow
- Consider caching strategies for heavy usage

---

## 🐛 Troubleshooting

### If deployment fails:
1. Check Railway logs for errors
2. Verify all dependencies are in `package.json`
3. Ensure `HELIUS_API_KEY` environment variable is set
4. Check that `server.js` uses `process.env.PORT`

### If drawing doesn't find buyers:
1. Check Helius API key is valid
2. Verify date ranges in your timezone
3. Lower the minimum USD amount filter
4. Check the diagnostic scan page

### If blocklist doesn't work:
1. Ensure `blocklist.json` exists in root
2. Check file permissions on Railway
3. Verify admin API endpoints are accessible

---

## 🎯 Next Steps After Deployment

1. **Test thoroughly** on Railway URL
2. **Share the URL** with LOTTA AF community
3. **Monitor usage** in Railway dashboard
4. **Consider custom domain** for professional appearance
5. **Add more features** as needed (database, user accounts, etc.)

---

## 📊 Future Enhancements (Optional)

### Database Integration:
If you want persistent storage beyond localStorage:
- Add PostgreSQL to Railway project
- Store drawing results in database
- Track user participation history

### Advanced Features:
- Email notifications for drawing winners
- Discord/Telegram bot integration
- Automatic scheduled drawing draws
- Winner verification system
- Prize distribution tracking

---

## ✨ Your App is Production-Ready!

Everything is configured and ready to deploy. Just:
1. Create GitHub repo
2. Push code
3. Deploy on Railway
4. Share your drawing URL!

**Good luck with your LOTTO AF drawing! 🎱🚀**

