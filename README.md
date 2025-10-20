# 🎰 LOTTO AF ON CHAIN LOTTERY

The official on-chain lottery system for $LOTTA AF token holders. Find out if you're one of the first 69 buyers and check your lottery number!

## Features

### 🎰 LOTTO AF LOTTERY SYSTEM
- **Check Your Lottery Number**: See if you're one of the first 69 $LOTTA AF buyers
- **Time-Based Lottery Draws**: Set date/time ranges for different lottery periods
- **Price Filtering**: Filter entries by minimum purchase amount
- **Automatic Numbering**: System assigns lottery numbers 1-69 based on buy order
- **Timezone Support**: View buy times in your preferred timezone
- **Multi-DEX Support**: Tracks buys from Raydium, Jupiter, Pump.fun, and more
- **Detailed Winner Info**: See tokens bought, SOL spent, and exact buy time
- **Export Lottery Results**: Download winner list as CSV

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

### Using the LOTTO AF Lottery

1. **Go to**: `http://localhost:3000`

2. **Set Lottery Parameters**:
   - **Token Contract Address**: Pre-filled with $LOTTA AF address (FvNcnFnWtschwYRNP758bg5yqmXBUKdDDcUcbrVvKLHv)
   - **Start Date & Time**: When the lottery period begins
   - **End Date & Time**: When the lottery period ends
   - **Min Price** (Optional): Minimum SOL purchase to qualify (default: any amount)
   - **Timezone**: Choose your timezone

3. **Click "🎰 Draw Lottery Numbers (1-69)"**

4. **View Lottery Results**:
   - See the first 69 buyers and their lottery numbers
   - Check if your wallet is among the winners
   - View amounts purchased and exact buy times
   - Click "Copy" to copy winner wallet addresses
   - Click "View" to verify transactions on Solscan
   - Export all lottery results to CSV

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
- **Dependencies**: 
  - axios (HTTP client)
  - cors (Cross-origin resource sharing)
  - dotenv (Environment variables)

## LOTTA AF Token Information

**Token Name:** Lotta AF  
**Contract Address:** `FvNcnFnWtschwYRNP758bg5yqmXBUKdDDcUcbrVvKLHv`  
**Blockchain:** Solana  

The lottery system automatically tracks all buys of $LOTTA AF and assigns numbers 1-69 to the first buyers within your selected time range.

## Notes

- **Helius API Key Required**: Already configured! The key is set in the server.
- **Rate Limits**: The app includes built-in delays to prevent hitting API rate limits.
- **Drawing Time**: Drawing lottery numbers can take a few minutes depending on the number of transactions. Be patient!
- **Supported DEXes**: Tracks $LOTTA AF buys from Raydium, Jupiter, Pump.fun, and other major DEXes.
- **Lottery Numbers**: Numbers 1-69 are assigned chronologically to the first 69 buyers in your time range.
- **Verification**: All results are verifiable on-chain. Click "View" to see any transaction on Solscan.
- All times support multiple timezones for global accessibility

## Troubleshooting

### Lottery Draw Issues
- **"Failed to analyze token"**: The Helius API key is already configured in the server
- **No lottery winners found**: Try expanding the date range to include more trading activity
- **Slow lottery draw**: This is normal if there are many $LOTTA AF transactions. The system checks each one.
- **Can't find my wallet**: Make sure you bought during the selected time range and your transaction went through

### General Issues
- Make sure the server is running on port 3000
- Check that you have a stable internet connection
- Check the browser console and server logs for detailed error messages
- If Helius rate limits are hit, wait a few minutes and try again
- All lottery results are verifiable on-chain via Solscan links

## Future Enhancements

- Token transfer tracking
- Export to CSV functionality
- Advanced analytics and charts
- Multiple wallet comparison
- Real-time transaction monitoring
- Notification alerts

## License

ISC

