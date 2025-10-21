# 🗄️ Database Setup Guide for LOTTO AF

This guide will help you connect your PostgreSQL database from Railway to your LOTTO AF application.

## 📋 What the Database Stores

1. **Blocklist Table** - Wallet addresses excluded from drawings
2. **Drawing Results Table** - Historical drawing data with winners
3. **Automatic Fallback** - Works without database (uses JSON files)

---

## 🚀 Quick Setup (Railway PostgreSQL)

### Step 1: Add PostgreSQL to Railway

1. Go to your Railway project
2. Click **"+ New"** → **"Database"** → **"Add PostgreSQL"**
3. Railway will create a new PostgreSQL database
4. Wait for it to deploy (usually takes 30 seconds)

### Step 2: Get Database URL

1. Click on the PostgreSQL service
2. Go to **"Variables"** tab
3. Copy the **`DATABASE_URL`** value
   - It looks like: `postgresql://user:password@host:port/database`

### Step 3: Connect to Your App

1. Go back to your main app service (not the database)
2. Click **"Variables"** tab
3. Add a new variable:
   - **Key**: `DATABASE_URL`
   - **Value**: Paste the DATABASE_URL you copied
4. Click **"Add"**

### Step 4: Verify Environment Variables

Make sure you have BOTH variables set in your app:
- ✅ `HELIUS_API_KEY` = `f749d6d6-c885-4a88-97a0-6ec0649500ea`
- ✅ `DATABASE_URL` = `postgresql://user:password@host:port/database`

### Step 5: Redeploy

1. Railway will automatically redeploy after adding variables
2. OR manually: Go to "Deployments" → "Redeploy"
3. Watch the logs for:
   ```
   🔌 Connecting to database...
   ✅ Database initialized successfully
   Server running on http://localhost:XXXX
   Mode: Database (PostgreSQL)
   ```

---

## ✅ Verification

### Check if Database is Working:

1. **In Railway Logs**, you should see:
   ```
   🔌 Connecting to database...
   ✅ Database connected and initialized
   Mode: Database (PostgreSQL)
   ```

2. **Go to Admin Panel** on your app:
   - Add a test wallet to blocklist
   - Check if it persists after page refresh
   - If yes, database is working! 🎉

3. **Test Drawing Save**:
   - Run a drawing
   - Click "💾 Save Drawing Result"
   - Check if it says "Drawing saved to database!"

---

## 🔧 Database Schema

### Blocklist Table
```sql
CREATE TABLE blocklist (
  id SERIAL PRIMARY KEY,
  wallet_address VARCHAR(44) UNIQUE NOT NULL,
  reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Drawing Results Table
```sql
CREATE TABLE drawing_results (
  id SERIAL PRIMARY KEY,
  drawing_id BIGINT NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  settings JSONB NOT NULL,
  results JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🎯 Features with Database

### ✅ With Database (Production):
- **Persistent blocklist** across all users
- **Shared drawing history** viewable by anyone
- **No data loss** on server restart
- **Centralized management** via admin panel
- **Scalable** for multiple users

### 📁 Without Database (Local Development):
- **File-based storage** (blocklist.json)
- **localStorage** for drawing results
- **Works locally** without any setup
- **Automatic fallback** if database is unavailable

---

## 🔍 Troubleshooting

### Database Connection Fails

**Error**: `❌ Failed to start server`

**Solutions**:
1. Check `DATABASE_URL` is correctly set in Railway variables
2. Ensure PostgreSQL service is running in Railway
3. Verify the database URL format is correct
4. Check Railway logs for specific error messages

### App Still Using File-based Storage

**Check**:
1. Railway logs should show: `Mode: Database (PostgreSQL)`
2. If it says `Mode: File-based (JSON)`, the DATABASE_URL is not set

**Fix**:
1. Add `DATABASE_URL` environment variable
2. Redeploy the app
3. Check logs again

### Database Tables Not Created

The app automatically creates tables on startup. If they're missing:
1. Check Railway logs for initialization errors
2. Manually connect to PostgreSQL and run the schema from above
3. Restart the app

---

## 🛠️ Manual Database Access (Advanced)

### Connect to Railway PostgreSQL:

1. In Railway, click on PostgreSQL service
2. Go to **"Data"** tab to view tables
3. OR use the **"Connect"** tab for connection details
4. Use a PostgreSQL client like:
   - **pgAdmin** (GUI)
   - **psql** (command line)
   - **DBeaver** (GUI, free)

### View Blocklist:
```sql
SELECT * FROM blocklist ORDER BY created_at DESC;
```

### View Drawing Results:
```sql
SELECT 
  drawing_id, 
  timestamp, 
  settings->>'minPurchaseUSD' as min_purchase,
  jsonb_array_length(results->'numberedBuys') as winner_count
FROM drawing_results 
ORDER BY timestamp DESC 
LIMIT 10;
```

### Clear Old Drawings (keep last 100):
```sql
DELETE FROM drawing_results 
WHERE id NOT IN (
  SELECT id FROM drawing_results 
  ORDER BY timestamp DESC 
  LIMIT 100
);
```

---

## 💡 Tips

1. **Always check Railway logs** after deployment
2. **Test locally first** without database to ensure app works
3. **Database automatically initializes** tables on first run
4. **Default blocklist wallet** is automatically added
5. **Drawings are saved** to both database AND localStorage for redundancy

---

## 🆘 Need Help?

If deployment fails:
1. Check Railway logs: Service → Deployments → View Logs
2. Verify both `HELIUS_API_KEY` and `DATABASE_URL` are set
3. Ensure PostgreSQL service is running
4. Try redeploying the app service

The app is designed to work **with or without** a database, so if database setup fails, it will fall back to file-based storage automatically.

