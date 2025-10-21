# 🎰 UNIVERSAL ON-CHAIN LOTTERY DRAWING SYSTEM

Create lottery drawings from ANY Solana token! Find the first 69 buyers and assign them beautiful drawing ball numbers. Perfect for token launches, giveaways, and community events.

## Features

### 🎰 UNIVERSAL LOTTERY DRAWING SYSTEM
- **Works with ANY Solana Token**: Just paste the contract address and create a drawing
- **Check Your Drawing Number**: See if you're one of the first 69 buyers
- **Time-Based Drawing Draws**: Set date/time ranges for different drawing periods
- **Price Filtering**: Filter entries by minimum purchase amount (USD)
- **Automatic Numbering**: System assigns drawing numbers 1-69 based on buy order
- **Timezone Support**: View buy times in your preferred timezone
- **Multi-DEX Support**: Tracks buys from Raydium, Jupiter, Pump.fun, and more
- **Detailed Winner Info**: See tokens bought, SOL spent, USD spent, and exact buy time
- **Export Drawing Results**: Download winner list as CSV with token address
- **Save & Load Drawings**: Save drawing results and access them later

### 🔍 Wallet Scanner
- Scan any Solana wallet address
- View SOL transfers and transactions
- Advanced Filtering:
  - **Price**: Min/Max amount or exact SOL amount
  - **Date & Time**: Custom range with quick filters (Last Hour, 24h, 7 Days, 30 Days)
  - **Buy/Sell**: Filter by transaction direction (incoming/outgoing)
  - **Counterparty Wallet**: Filter by specific wallet addresses
  - **Status**: Success or failed transactions
- 📊 Real-time statistics dashboard
- 📥 Export to CSV functionality
- 🎨 Modern, responsive UI with Solana branding
- 🔗 Direct links to Solscan for detailed transaction views
- 🔔 Toast notifications for user feedback

## Installation

1. Install Node.js (if not already installed)

2. Install dependencies:
```bash
npm install
```

3. **Get a Helius API Key** (Required for Token Analyzer):
   - Visit [https://www.helius.dev/](https://www.helius.dev/)
   - Sign up for a free account
   - Create an API key
   - Copy your API key

4. Create a `.env` file in the root directory:
```bash
HELIUS_API_KEY=your-helius-api-key-here
PORT=3000
```

## Usage

### Starting the Server

1. Start the server:
```bash
npm start
```

Or if you have `node server.js` running already, it's good to go!

2. Open your browser and navigate to:
```
http://localhost:3000
```

### Using the Universal Lottery Drawing

1. **Go to**: `http://localhost:3000`

2. **Set Drawing Parameters**:
   - **Token Contract Address**: Paste ANY Solana token address
   - **Start Date & Time**: When the drawing period begins
   - **End Date & Time**: When the drawing period ends
   - **Min Price** (Optional): Minimum USD purchase to qualify (default: any amount)
   - **Timezone**: Choose your timezone for displaying results

3. **Click "🔮 Create a Lotto Drawing"** then **"🎱 Draw Lotto Balls"**

4. **View Drawing Results**:
   - See the first 69 buyers and their drawing ball numbers
   - Check if your wallet is among the winners
   - View tokens bought, USD spent, SOL spent, and exact buy times
   - Click "Copy" to copy winner wallet addresses
   - Click "View" to verify transactions on Solscan
   - Export all drawing results to CSV (includes token address)
   - Save drawing results to view later

### Using the Wallet Scanner

1. Enter a Solana wallet address and click "Scan Wallet"

2. Use the filter options to narrow down transactions:
   - **Wallet Address**: Filter transactions involving a specific wallet
   - **Min/Max Amount**: Filter by SOL amount range
   - **Start/End Date**: Filter by date and time range
   - **Transaction Type**: Filter by incoming or outgoing transactions

## API Endpoints

The backend provides several API endpoints:

### Token Analysis
- `POST /api/analyze-token` - Analyze token trades and assign numbers to buyers
  - Body: `{ tokenAddress, startDate, endDate, minPrice, timezone }`
  - Returns: Numbered list of buy trades (1-69)

### Wallet & Transaction Data
- `GET /api/transactions/:address` - Get all transactions for a wallet
- `GET /api/token-transfers/:address` - Get token transfers
- `GET /api/sol-transfers/:address` - Get SOL transfers
- `GET /api/transaction/:signature` - Get specific transaction details

## Technologies Used

- **Backend**: Node.js, Express
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **APIs**: 
  - Helius RPC (Enhanced transaction data & DEX parsing)
  - Solscan Public API (Transaction history)
  - CoinGecko API (Historical SOL/USD pricing)
- **Dependencies**: 
  - axios (HTTP client)
  - cors (Cross-origin resource sharing)
  - dotenv (Environment variables)

## 🚀 Deployment to Railway

### Step 1: Push to GitHub
```bash
# The repository is already initialized with all files committed

# Add your GitHub repository (replace with your actual repo URL)
git remote add origin https://github.com/yourusername/universal-lottery-drawing.git

# Push to GitHub
git push -u origin master
```

### Step 2: Deploy to Railway
1. Go to [Railway.app](https://railway.app) and sign up/login with GitHub
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your `universal-lottery-drawing` repository
4. Railway will auto-detect your Node.js app and install dependencies
5. Add environment variables in Railway dashboard:
   - `HELIUS_API_KEY` = `your-helius-api-key-here`
   - Railway auto-sets `PORT`, but you can set it to `3000` if needed
6. Click **"Deploy"**
7. Wait for deployment to complete (~2-3 minutes)
8. Railway will give you a public URL like `https://universal-lottery-drawing.up.railway.app`

### Step 3: Optional - Add Custom Domain
1. In Railway dashboard, go to your project Settings
2. Under **"Domains"**, click "Generate Domain" for a Railway subdomain
3. Or add your own custom domain and update DNS records

### Environment Variables for Railway:
```bash
HELIUS_API_KEY=your-helius-api-key-here
PORT=3000
NODE_ENV=production
DATABASE_URL=your-postgres-url (optional, for persistent storage)
```

### Railway Features:
- ✅ **Auto-deployment** on git push
- ✅ **Free tier** available (500 hours/month)
- ✅ **Automatic HTTPS**
- ✅ **Environment variables** securely stored
- ✅ **Always-on** web service
- ✅ **Custom domains** supported
- ✅ **Logs & monitoring** built-in

### After Deployment:
Your drawing system will be live at your Railway URL! Users can:
- Create drawing draws for specific time periods
- Check if they're in the first 69 buyers
- View and save drawing results
- Access the admin panel to manage blocklist
- Use the diagnostic scan page for troubleshooting

## How It Works

**Blockchain:** Solana  
**Supported Tokens:** ANY Solana SPL token  

The drawing system automatically tracks all buys of your specified token and assigns numbers 1-69 to the first buyers within your selected time range. The system is completely universal and works with any Solana token address.

## Notes

- **Helius API Key Required**: Already configured! The key is set in the server.
- **Rate Limits**: The app includes built-in delays to prevent hitting API rate limits.
- **Drawing Time**: Drawing lottery balls can take a few minutes depending on the number of transactions. Be patient!
- **Supported DEXes**: Tracks token buys from Raydium, Jupiter, Pump.fun, and other major Solana DEXes.
- **Drawing Numbers**: Numbers 1-69 are assigned chronologically to the first 69 buyers in your time range.
- **Verification**: All results are verifiable on-chain. Click "View" to see any transaction on Solscan.
- **Universal Support**: Works with ANY Solana token - just paste the contract address!
- All times support multiple timezones for global accessibility

## Troubleshooting

### Drawing Issues
- **"Failed to analyze token"**: Check that the token address is valid and exists on Solana
- **"Please enter a valid Solana address"**: Make sure the token address is a valid base58 Solana address (32-44 characters)
- **No drawing winners found**: Try expanding the date range to include more trading activity
- **Slow drawing process**: This is normal if there are many transactions. The system checks each one for buys.
- **Can't find my wallet**: Make sure you bought during the selected time range and your transaction went through

### General Issues
- Make sure the server is running on port 3000
- Check that you have a stable internet connection
- Check the browser console and server logs for detailed error messages
- If Helius rate limits are hit, wait a few minutes and try again
- All drawing results are verifiable on-chain via Solscan links

## Future Enhancements

- Token transfer tracking
- Export to CSV functionality
- Advanced analytics and charts
- Multiple wallet comparison
- Real-time transaction monitoring
- Notification alerts

## License

ISC

