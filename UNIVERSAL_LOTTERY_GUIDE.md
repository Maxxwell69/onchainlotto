# 🎰 Universal Lottery Drawing System - Quick Guide

## What Changed?

Your lottery drawing system is now **completely universal** and works with **ANY Solana token**! 

### Key Updates:

✅ **Token Address Input**: Now editable and accepts any Solana token address  
✅ **Generic Branding**: All references to "LOTTA AF" updated to generic lottery terminology  
✅ **Token Display**: Results now show which token address was used in the drawing  
✅ **Flexible CSV Export**: Exported files include the token address at the top  
✅ **Saved Drawings**: Shows token address for each saved drawing  
✅ **Diagnostic Scan**: Universal scanner works with any token  
✅ **Documentation**: README updated with universal instructions  

---

## How to Use with Different Tokens

### Example 1: Create a Drawing for Bonk Token
```
Token Address: DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263
Start Date: January 1, 2024, 00:00
End Date: January 31, 2024, 23:59
Min Purchase: $10 USD
```

### Example 2: Create a Drawing for WIF Token
```
Token Address: EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm
Start Date: February 1, 2024, 00:00
End Date: February 28, 2024, 23:59
Min Purchase: $5 USD
```

### Example 3: Your Custom Token Launch
```
Token Address: [Your token's contract address]
Start Date: [Your launch date]
End Date: [Your drawing cutoff date]
Min Purchase: [Your minimum purchase requirement]
```

---

## Features That Work with Any Token

### 🎱 Drawing Creation
1. Paste any Solana SPL token address
2. Set your time range
3. Set minimum purchase amount (optional)
4. Click "Create a Lotto Drawing"
5. Click "Draw Lotto Balls" to find the first 69 buyers

### 📊 Results Display
- Token address shown in results popup
- Winner wallet addresses with drawing numbers 1-69
- Tokens bought by each winner
- USD and SOL amounts spent
- Exact buy timestamps
- Verification links to Solscan

### 💾 Save & Export
- Save drawings with token address metadata
- Export to CSV with token address included
- Load previous drawings by token
- Open results in new window for sharing

### 🔍 Diagnostic Scan
- Scan ALL buys for any token
- No minimum purchase filters
- See complete transaction history
- Troubleshoot drawing issues

---

## Page Overview

### Main Drawing Page (`/`)
- Create lottery drawings for any token
- View beautiful drawing balls (1-69)
- Save and load drawing results
- Export to CSV

### Admin Panel (`/admin.html`)
- Manage blocklist for wallets to exclude
- Add/remove wallets (useful for liquidity pools, team wallets, etc.)
- Applies to all drawings

### Diagnostic Scan (`/scan.html`)
- Deep scan any token's transactions
- No filters applied - see EVERYTHING
- Useful for troubleshooting

---

## Use Cases

### 🚀 Token Launches
Create a lottery for your token launch to reward early buyers with prizes, NFTs, or bonus tokens.

### 🎁 Community Giveaways
Run fair, transparent on-chain drawings for your token community.

### 🏆 Trading Competitions
Reward the first X buyers during specific time periods.

### 📈 Marketing Campaigns
Create excitement around your token with time-limited drawing draws.

### 🤝 Fair Distribution
Use on-chain data to ensure fair and verifiable winner selection.

---

## Technical Details

### What Tokens Are Supported?
- ✅ ANY Solana SPL token
- ✅ Tokens on Raydium
- ✅ Tokens on Jupiter
- ✅ Tokens on Pump.fun
- ✅ Tokens on Orca
- ✅ Any other Solana DEX

### How It Works
1. System fetches all transactions for the token address
2. Analyzes each transaction to identify buys
3. Filters by your date/time range and minimum purchase
4. Sorts by timestamp (earliest first)
5. Assigns numbers 1-69 to the first buyers
6. Fetches historical SOL/USD prices for accurate USD amounts
7. Displays beautiful drawing balls with winner info

### Verification
- All results are 100% on-chain and verifiable
- Click "View" on any winner to see their transaction on Solscan
- Copy wallet addresses to verify ownership
- Export to CSV for record-keeping

---

## Example: Running Multiple Drawings

You can create drawings for different tokens and save them all:

```
Drawing 1: Bonk Token
- First 69 buyers in January 2024
- $10 minimum purchase
- 42 winners found

Drawing 2: WIF Token  
- First 69 buyers in February 2024
- $5 minimum purchase
- 69 winners found (complete!)

Drawing 3: Your Token
- First 69 buyers from launch day
- No minimum purchase
- 51 winners found so far
```

All saved drawings are accessible from the main page!

---

## Tips for Best Results

1. **Choose Appropriate Time Ranges**: 
   - Too short: Might not find 69 buyers
   - Too long: Processing takes longer

2. **Set Minimum Purchase Wisely**:
   - Higher minimums = fewer qualifiers
   - Lower/no minimum = more qualifiers

3. **Use Blocklist for Fairness**:
   - Exclude liquidity pools
   - Exclude team wallets
   - Exclude bots (if identified)

4. **Test with Diagnostic Scan First**:
   - See total buy count before creating drawing
   - Identify date ranges with most activity

5. **Save Your Results**:
   - Results are stored locally and can be saved to database
   - Export to CSV for permanent records

---

## Support

The system is now completely universal and ready to use with any Solana token. Just paste a token address and start creating drawings!

**Happy Drawing! 🎱🎰✨**

