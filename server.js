const express = require('express');
const axios = require('axios');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Set permissive CSP headers for development
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; connect-src 'self' https://mainnet.helius-rpc.com https://public-api.solscan.io https://solscan.io; img-src 'self' data: https:;"
  );
  next();
});

app.use(express.static('public'));

// Solscan API endpoint
const SOLSCAN_API = 'https://public-api.solscan.io';

// Helius API endpoint
const HELIUS_API_KEY = process.env.HELIUS_API_KEY || 'f749d6d6-c885-4a88-97a0-6ec0649500ea';
const HELIUS_RPC = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;

// Cache for SOL prices to avoid repeated API calls
const solPriceCache = new Map();

// Blocklist management
const BLOCKLIST_FILE = path.join(__dirname, 'blocklist.json');

function loadBlocklist() {
  try {
    const data = fs.readFileSync(BLOCKLIST_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.log('Creating new blocklist file...');
    const defaultBlocklist = {
      blockedWallets: ["HLnpSz9h2S4hiLQ43rnSD9XkcUThA7B8hQMKmDaiTLcC"],
      reason: {
        "HLnpSz9h2S4hiLQ43rnSD9XkcUThA7B8hQMKmDaiTLcC": "Liquidity Pool - High frequency trading account"
      }
    };
    fs.writeFileSync(BLOCKLIST_FILE, JSON.stringify(defaultBlocklist, null, 2));
    return defaultBlocklist;
  }
}

function saveBlocklist(blocklist) {
  fs.writeFileSync(BLOCKLIST_FILE, JSON.stringify(blocklist, null, 2));
}

function isWalletBlocked(wallet) {
  const blocklist = loadBlocklist();
  return blocklist.blockedWallets.includes(wallet);
}

// Get SOL price in USD at a specific timestamp
async function getSolPriceAtTime(timestamp) {
  // Round to nearest day for better caching and fewer API calls
  const date = new Date(timestamp * 1000);
  const dayTimestamp = Math.floor(new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime() / 1000);
  
  // Check cache first
  if (solPriceCache.has(dayTimestamp)) {
    return solPriceCache.get(dayTimestamp);
  }
  
  // Add delay to respect rate limits (free tier: 10-50 calls/min)
  await new Promise(resolve => setTimeout(resolve, 1500)); // 1.5 seconds between calls
  
  try {
    // Use CoinGecko API to get historical price
    const dateStr = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
    
    const response = await axios.get(
      `https://api.coingecko.com/api/v3/coins/solana/history`,
      {
        params: {
          date: dateStr,
          localization: false
        },
        timeout: 10000
      }
    );
    
    const price = response.data?.market_data?.current_price?.usd || null;
    
    if (price) {
      solPriceCache.set(dayTimestamp, price);
      console.log(`📊 SOL price on ${dateStr}: $${price.toFixed(2)}`);
      return price;
    }
  } catch (error) {
    if (error.response?.status === 429) {
      console.warn('⚠️ CoinGecko rate limit hit, waiting longer...');
      await new Promise(resolve => setTimeout(resolve, 5000));
    } else {
      console.error('Error fetching SOL price:', error.message);
    }
  }
  
  // Fallback: use default price based on current market (~$165-180)
  const fallbackPrice = 170;
  console.log(`Using fallback SOL price: $${fallbackPrice}`);
  solPriceCache.set(dayTimestamp, fallbackPrice);
  return fallbackPrice;
}

// Get transactions for a wallet address
app.get('/api/transactions/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const { limit = 50 } = req.query;

    // Fetch transactions from Solscan API
    const response = await axios.get(
      `${SOLSCAN_API}/account/transactions`,
      {
        params: {
          account: address,
          limit: limit
        },
        headers: {
          'Accept': 'application/json'
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching transactions:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch transactions',
      message: error.response?.data?.message || error.message 
    });
  }
});

// Get token transfers for a wallet address
app.get('/api/token-transfers/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    // Fetch token transfers from Solscan API
    const response = await axios.get(
      `${SOLSCAN_API}/account/token/txs`,
      {
        params: {
          account: address,
          limit: limit,
          offset: offset
        },
        headers: {
          'Accept': 'application/json'
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching token transfers:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch token transfers',
      message: error.response?.data?.message || error.message 
    });
  }
});

// Get SOL transfers for a wallet address
app.get('/api/sol-transfers/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    // Fetch SOL transfers from Solscan API
    const response = await axios.get(
      `${SOLSCAN_API}/account/solTransfers`,
      {
        params: {
          account: address,
          limit: limit,
          offset: offset
        },
        headers: {
          'Accept': 'application/json'
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching SOL transfers:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch SOL transfers',
      message: error.response?.data?.message || error.message 
    });
  }
});

// Get transaction details
app.get('/api/transaction/:signature', async (req, res) => {
  try {
    const { signature } = req.params;

    const response = await axios.get(
      `${SOLSCAN_API}/transaction/${signature}`,
      {
        headers: {
          'Accept': 'application/json'
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching transaction details:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch transaction details',
      message: error.response?.data?.message || error.message 
    });
  }
});

// Admin endpoints for blocklist management
app.get('/api/admin/blocklist', (req, res) => {
  try {
    const blocklist = loadBlocklist();
    res.json(blocklist);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load blocklist' });
  }
});

app.post('/api/admin/blocklist/add', (req, res) => {
  try {
    const { wallet, reason } = req.body;
    
    if (!wallet) {
      return res.status(400).json({ error: 'Wallet address is required' });
    }
    
    const blocklist = loadBlocklist();
    
    if (!blocklist.blockedWallets.includes(wallet)) {
      blocklist.blockedWallets.push(wallet);
      blocklist.reason[wallet] = reason || 'Excluded from drawing';
      saveBlocklist(blocklist);
      console.log(`🚫 Added to blocklist: ${wallet}`);
    }
    
    res.json({ success: true, blocklist });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add to blocklist' });
  }
});

app.post('/api/admin/blocklist/remove', (req, res) => {
  try {
    const { wallet } = req.body;
    
    if (!wallet) {
      return res.status(400).json({ error: 'Wallet address is required' });
    }
    
    const blocklist = loadBlocklist();
    blocklist.blockedWallets = blocklist.blockedWallets.filter(w => w !== wallet);
    delete blocklist.reason[wallet];
    saveBlocklist(blocklist);
    
    console.log(`✅ Removed from blocklist: ${wallet}`);
    res.json({ success: true, blocklist });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove from blocklist' });
  }
});

// Diagnostic scan - get ALL buys without filters
app.post('/api/scan-all-buys', async (req, res) => {
  try {
    const { tokenAddress, startDate, endDate } = req.body;

    if (!tokenAddress) {
      return res.status(400).json({ error: 'Token address is required' });
    }

    const startTime = startDate ? new Date(startDate).getTime() / 1000 : 0;
    const endTime = endDate ? new Date(endDate).getTime() / 1000 : Math.floor(Date.now() / 1000);

    console.log(`🔍 DIAGNOSTIC SCAN for token: ${tokenAddress}`);
    console.log(`Time range: ${new Date(startTime * 1000)} to ${new Date(endTime * 1000)}`);

    const signatures = await getTokenSignatures(tokenAddress, startTime, endTime);
    console.log(`Found ${signatures.length} signatures`);

    // Parse transactions to find ALL buys (no filtering)
    const buyTrades = [];
    let processedCount = 0;
    for (const sig of signatures) {
      try {
        processedCount++;
        if (processedCount % 10 === 0) {
          console.log(`Scanning ${processedCount}/${signatures.length}...`);
        }
        
        const txDetails = await getEnhancedTransaction(sig);
        if (txDetails && txDetails.type === 'SWAP') {
          const trade = parseSwapTransaction(txDetails, tokenAddress);
          if (trade && trade.direction === 'BUY') {
            buyTrades.push(trade);
          }
        }
        // Slower rate to avoid 429 errors (Helius free tier limits)
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`Error parsing transaction ${sig}:`, error.message);
      }
    }

    console.log(`✅ Scan complete: Found ${buyTrades.length} buy trades`);

    // Sort by timestamp
    buyTrades.sort((a, b) => a.timestamp - b.timestamp);

    // Get USD prices for all trades
    console.log('Fetching USD prices...');
    for (const trade of buyTrades) {
      const solPrice = await getSolPriceAtTime(trade.timestamp);
      trade.solPriceUSD = solPrice;
      trade.usdAmount = trade.solAmount * solPrice;
      trade.priceInUSD = trade.usdAmount / trade.tokenAmount;
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    res.json({
      tokenAddress,
      totalTransactions: signatures.length,
      buys: buyTrades,
      scanComplete: true
    });

  } catch (error) {
    console.error('Error scanning:', error.message);
    res.status(500).json({ 
      error: 'Failed to scan',
      message: error.message 
    });
  }
});

// Analyze token trades and assign numbers to buyers
app.post('/api/analyze-token', async (req, res) => {
  try {
    const { tokenAddress, startDate, endDate, minPrice, timezone = 'UTC' } = req.body;

    if (!tokenAddress) {
      return res.status(400).json({ error: 'Token address is required' });
    }

    // Convert dates to timestamps
    const startTime = startDate ? new Date(startDate).getTime() / 1000 : 0;
    const endTime = endDate ? new Date(endDate).getTime() / 1000 : Math.floor(Date.now() / 1000);

    console.log(`Analyzing token: ${tokenAddress}`);
    console.log(`Time range: ${new Date(startTime * 1000)} to ${new Date(endTime * 1000)}`);

    // Get token account (mint address)
    const signatures = await getTokenSignatures(tokenAddress, startTime, endTime);
    console.log(`Found ${signatures.length} signatures`);

    // Parse transactions to find buys
    const buyTrades = [];
    let processedCount = 0;
    for (const sig of signatures) {
      try {
        processedCount++;
        if (processedCount % 10 === 0) {
          console.log(`Processing transaction ${processedCount}/${signatures.length}...`);
        }
        
        const txDetails = await getEnhancedTransaction(sig);
        if (txDetails && txDetails.type === 'SWAP') {
          const trade = parseSwapTransaction(txDetails, tokenAddress);
          if (trade && trade.direction === 'BUY') {
            buyTrades.push(trade);
          }
        } else if (txDetails) {
          console.log(`Transaction ${sig.slice(0, 8)} - no token balances`);
        }
        // Slower rate to avoid 429 errors (Helius free tier limits)
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`Error parsing transaction ${sig}:`, error.message);
      }
    }
    
    console.log(`✅ Analysis complete: Found ${buyTrades.length} buy trades out of ${signatures.length} transactions`);

    // Sort by timestamp
    buyTrades.sort((a, b) => a.timestamp - b.timestamp);

    // Get USD prices for each trade and filter by minimum USD
    console.log('Fetching USD prices for trades...');
    const tradesWithUSD = [];
    for (const trade of buyTrades) {
      const solPrice = await getSolPriceAtTime(trade.timestamp);
      trade.solPriceUSD = solPrice;
      trade.usdAmount = trade.solAmount * solPrice;
      trade.priceInUSD = trade.usdAmount / trade.tokenAmount;
      
      // Filter by minimum USD amount if specified
      if (minPrice && trade.usdAmount < minPrice) {
        console.log(`Filtered out: ${trade.wallet.slice(0, 8)} - spent $${trade.usdAmount.toFixed(2)} (below $${minPrice} minimum)`);
        continue;
      }
      
      tradesWithUSD.push(trade);
      // Add delay to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    console.log(`After USD filtering: ${tradesWithUSD.length} trades qualify`);

    // Assign numbers 1-69
    const numberedTrades = tradesWithUSD.slice(0, 69).map((trade, index) => ({
      ...trade,
      number: index + 1,
      formattedDate: new Date(trade.timestamp * 1000).toLocaleString('en-US', { timeZone: timezone })
    }));

    console.log(`✅ Drawing complete! ${numberedTrades.length} winners with USD pricing`);

    res.json({
      tokenAddress,
      totalBuys: buyTrades.length,
      numberedBuys: numberedTrades,
      analysisComplete: true
    });

  } catch (error) {
    console.error('Error analyzing token:', error.message);
    res.status(500).json({ 
      error: 'Failed to analyze token',
      message: error.message 
    });
  }
});

// Helper function to get token signatures using standard RPC (more reliable)
async function getTokenSignatures(tokenAddress, startTime, endTime) {
  const signatures = [];
  let before = null;
  let hasMore = true;
  let page = 0;
  
  console.log(`Fetching transactions for token: ${tokenAddress}`);
  console.log(`Time filter: ${startTime} to ${endTime}`);
  
  // Use standard RPC for reliability and better pagination
  while (hasMore && page < 20) { // Increased from 10 to 20 pages (2000 txs max)
    try {
      const params = {
        limit: 100
      };
      if (before) params.before = before;

      const response = await axios.post(HELIUS_RPC, {
        jsonrpc: '2.0',
        id: 'token-sigs',
        method: 'getSignaturesForAddress',
        params: [tokenAddress, params]
      });

      const results = response.data.result || [];
      
      if (results.length === 0) {
        console.log(`No more transactions found at page ${page}`);
        hasMore = false;
        break;
      }

      console.log(`Page ${page}: Found ${results.length} signatures, checking timestamps...`);
      
      let addedThisPage = 0;
      for (const sig of results) {
        // Stop if we've gone past the start time
        if (sig.blockTime < startTime) {
          console.log(`Reached transactions before start time at page ${page}`);
          hasMore = false;
          break;
        }
        
        // Add if within range
        if (sig.blockTime >= startTime && sig.blockTime <= endTime) {
          signatures.push(sig.signature);
          addedThisPage++;
        }
      }
      
      console.log(`Added ${addedThisPage} transactions from page ${page} (total: ${signatures.length})`);

      before = results[results.length - 1]?.signature;
      page++;
      
      if (results.length < 100) {
        console.log(`Received less than 100 results, no more pages`);
        hasMore = false;
      }
      
      // Rate limiting - be more conservative
      await new Promise(resolve => setTimeout(resolve, 300));
    } catch (error) {
      console.error(`Error fetching page ${page}:`, error.message);
      hasMore = false;
    }
  }

  console.log(`✅ Fetched ${signatures.length} total signatures across ${page} pages`);
  return signatures;
}

// Get enhanced transaction details from Helius with retry logic
async function getEnhancedTransaction(signature, retries = 3) {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await axios.post(HELIUS_RPC, {
        jsonrpc: '2.0',
        id: 'enhanced-tx',
        method: 'getTransaction',
        params: [
          signature,
          {
            encoding: 'jsonParsed',
            maxSupportedTransactionVersion: 0
          }
        ],
        timeout: 10000
      });

      const tx = response.data.result;
      if (!tx) return null;

      // Try to parse as enhanced transaction
      return parseEnhancedTx(tx);
    } catch (error) {
      if (error.response?.status === 429 && attempt < retries - 1) {
        // Rate limited, wait longer and retry
        const waitTime = (attempt + 1) * 2000; // 2s, 4s, 6s
        console.log(`⚠️ Rate limited, waiting ${waitTime/1000}s before retry ${attempt + 1}/${retries}...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      } else if (attempt === retries - 1) {
        console.error(`❌ Failed to fetch ${signature.slice(0, 8)} after ${retries} attempts`);
        return null;
      } else {
        console.error(`Error fetching transaction ${signature.slice(0, 8)}:`, error.message);
        return null;
      }
    }
  }
  return null;
}

// Parse enhanced transaction
function parseEnhancedTx(tx) {
  try {
    const meta = tx.meta;
    const instructions = tx.transaction.message.instructions;
    
    // If there are token balance changes, it's likely a swap
    if (meta && meta.postTokenBalances && meta.postTokenBalances.length > 0) {
      return {
        type: 'SWAP',
        signature: tx.transaction.signatures[0],
        blockTime: tx.blockTime,
        meta: meta,
        instructions: instructions,
        accounts: tx.transaction.message.accountKeys
      };
    }
    
    return null;
  } catch (error) {
    return null;
  }
}

// Parse swap transaction to determine buy/sell and amount
function parseSwapTransaction(txDetails, tokenAddress) {
  try {
    const { meta, blockTime, signature, accounts } = txDetails;
    
    if (!meta) {
      console.log(`❌ No meta for ${signature.slice(0, 8)}`);
      return null;
    }

    // Find token balance changes
    const preBalances = meta.preTokenBalances || [];
    const postBalances = meta.postTokenBalances || [];
    
    // Track SOL and token changes for each account
    const accountChanges = new Map();
    let foundOurToken = false;

    // Check token balance changes for our specific token
    for (const postBal of postBalances) {
      if (postBal.mint === tokenAddress) {
        foundOurToken = true;
        const preBal = preBalances.find(pb => 
          pb.accountIndex === postBal.accountIndex
        );
        
        const preAmount = preBal ? parseFloat(preBal.uiTokenAmount.uiAmount || 0) : 0;
        const postAmount = parseFloat(postBal.uiTokenAmount.uiAmount || 0);
        const change = postAmount - preAmount;
        
        if (change > 0) {
          // This account gained tokens
          const owner = postBal.owner;
          if (!accountChanges.has(owner)) {
            accountChanges.set(owner, { tokenChange: 0, solChange: 0 });
          }
          accountChanges.get(owner).tokenChange += change;
        }
      }
    }

    if (!foundOurToken) {
      return null;
    }

    // Check SOL balance changes - be more lenient
    if (meta.preBalances && meta.postBalances && accounts) {
      for (let i = 0; i < meta.preBalances.length; i++) {
        const preSol = meta.preBalances[i] / 1e9;
        const postSol = meta.postBalances[i] / 1e9;
        const change = postSol - preSol;
        
        // Get the account address
        let accountAddr = accounts[i];
        if (typeof accountAddr === 'object' && accountAddr.pubkey) {
          accountAddr = accountAddr.pubkey;
        }
        
        // If this account spent SOL (negative change) - be more lenient with threshold
        if (change < -0.0001) { // Lower threshold from 0.001 to 0.0001
          if (!accountChanges.has(accountAddr)) {
            accountChanges.set(accountAddr, { tokenChange: 0, solChange: 0 });
          }
          accountChanges.get(accountAddr).solChange += Math.abs(change);
        }
      }
    }

    // Find accounts that gained tokens (buyers)
    // Be lenient - if they gained tokens, it's likely a buy even if SOL change isn't detected
    for (const [wallet, changes] of accountChanges.entries()) {
      if (changes.tokenChange > 0) {
        // Check if wallet is blocked (liquidity pool, etc.)
        if (isWalletBlocked(wallet)) {
          console.log(`🚫 Blocked wallet detected: ${wallet.slice(0, 8)} - Excluding from drawing`);
          continue;
        }
        
        // If we have both token gain and SOL spent, great!
        if (changes.solChange > 0) {
          const priceInSol = changes.solChange / changes.tokenChange;
          console.log(`✅ Found BUY: ${wallet.slice(0, 8)} bought ${changes.tokenChange.toFixed(2)} tokens for ${changes.solChange.toFixed(4)} SOL`);

          return {
            direction: 'BUY',
            wallet: wallet,
            tokenAmount: changes.tokenChange,
            solAmount: changes.solChange,
            priceInSol: priceInSol,
            timestamp: blockTime,
            signature: signature
          };
        } else {
          // Token gain but no clear SOL spend - might still be a buy, estimate SOL
          // Look for ANY SOL decrease as a proxy
          let maxSolDecrease = 0;
          for (const [addr, ch] of accountChanges.entries()) {
            if (ch.solChange > maxSolDecrease) {
              maxSolDecrease = ch.solChange;
            }
          }
          
          if (maxSolDecrease > 0) {
            const priceInSol = maxSolDecrease / changes.tokenChange;
            console.log(`✅ BUY: ${wallet.slice(0, 8)} → ${changes.tokenChange.toFixed(0)} tokens for ~${maxSolDecrease.toFixed(4)} SOL`);
            
            return {
              direction: 'BUY',
              wallet: wallet,
              tokenAmount: changes.tokenChange,
              solAmount: maxSolDecrease,
              priceInSol: priceInSol,
              timestamp: blockTime,
              signature: signature
            };
          }
        }
      }
    }

    return null;
  } catch (error) {
    console.error('Error parsing swap:', error.message);
    return null;
  }
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


