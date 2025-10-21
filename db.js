const { Pool } = require('pg');

// Create PostgreSQL connection pool only if DATABASE_URL is set
let pool = null;

if (process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });
}

// Initialize database tables
async function initializeDatabase() {
  if (!pool) {
    throw new Error('Database connection not configured');
  }
  const client = await pool.connect();
  try {
    // Create blocklist table
    await client.query(`
      CREATE TABLE IF NOT EXISTS blocklist (
        id SERIAL PRIMARY KEY,
        wallet_address VARCHAR(44) UNIQUE NOT NULL,
        reason TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create drawing_results table
    await client.query(`
      CREATE TABLE IF NOT EXISTS drawing_results (
        id SERIAL PRIMARY KEY,
        drawing_id BIGINT NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        settings JSONB NOT NULL,
        results JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create index for faster queries
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_drawing_results_timestamp 
      ON drawing_results(timestamp DESC);
    `);

    // Add default blocked wallet if not exists
    await client.query(`
      INSERT INTO blocklist (wallet_address, reason)
      VALUES ($1, $2)
      ON CONFLICT (wallet_address) DO NOTHING;
    `, ['HLnpSz9h2S4hiLQ43rnSD9XkcUThA7B8hQMKmDaiTLcC', 'Liquidity Pool - High frequency trading account']);

    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Blocklist functions
async function getBlocklist() {
  if (!pool) return { blockedWallets: [], reason: {} };
  try {
    const result = await pool.query(
      'SELECT wallet_address, reason, created_at FROM blocklist ORDER BY created_at DESC'
    );
    return {
      blockedWallets: result.rows.map(row => row.wallet_address),
      reason: result.rows.reduce((acc, row) => {
        acc[row.wallet_address] = row.reason;
        return acc;
      }, {})
    };
  } catch (error) {
    console.error('Error fetching blocklist:', error);
    return { blockedWallets: [], reason: {} };
  }
}

async function addToBlocklist(walletAddress, reason) {
  if (!pool) return false;
  try {
    await pool.query(
      'INSERT INTO blocklist (wallet_address, reason) VALUES ($1, $2) ON CONFLICT (wallet_address) DO NOTHING',
      [walletAddress, reason]
    );
    return true;
  } catch (error) {
    console.error('Error adding to blocklist:', error);
    return false;
  }
}

async function removeFromBlocklist(walletAddress) {
  if (!pool) return false;
  try {
    await pool.query(
      'DELETE FROM blocklist WHERE wallet_address = $1',
      [walletAddress]
    );
    return true;
  } catch (error) {
    console.error('Error removing from blocklist:', error);
    return false;
  }
}

async function isWalletBlocked(wallet) {
  if (!pool) return false;
  try {
    const result = await pool.query(
      'SELECT 1 FROM blocklist WHERE wallet_address = $1',
      [wallet]
    );
    return result.rows.length > 0;
  } catch (error) {
    console.error('Error checking blocklist:', error);
    return false;
  }
}

// Drawing results functions
async function saveDrawingResult(drawingData) {
  if (!pool) return false;
  try {
    await pool.query(
      'INSERT INTO drawing_results (drawing_id, timestamp, settings, results) VALUES ($1, $2, $3, $4)',
      [
        drawingData.id,
        new Date(drawingData.timestamp),
        JSON.stringify(drawingData.settings),
        JSON.stringify(drawingData.results)
      ]
    );
    return true;
  } catch (error) {
    console.error('Error saving drawing result:', error);
    return false;
  }
}

async function getDrawingResults(limit = 50) {
  if (!pool) return [];
  try {
    const result = await pool.query(
      'SELECT * FROM drawing_results ORDER BY timestamp DESC LIMIT $1',
      [limit]
    );
    return result.rows.map(row => ({
      id: row.drawing_id,
      timestamp: row.timestamp.toISOString(),
      settings: row.settings,
      results: row.results,
      date: new Date(row.timestamp).toLocaleDateString(),
      time: new Date(row.timestamp).toLocaleTimeString()
    }));
  } catch (error) {
    console.error('Error fetching drawing results:', error);
    return [];
  }
}

async function getDrawingResultById(id) {
  if (!pool) return null;
  try {
    const result = await pool.query(
      'SELECT * FROM drawing_results WHERE drawing_id = $1',
      [id]
    );
    if (result.rows.length === 0) return null;
    
    const row = result.rows[0];
    return {
      id: row.drawing_id,
      timestamp: row.timestamp.toISOString(),
      settings: row.settings,
      results: row.results,
      date: new Date(row.timestamp).toLocaleDateString(),
      time: new Date(row.timestamp).toLocaleTimeString()
    };
  } catch (error) {
    console.error('Error fetching drawing result:', error);
    return null;
  }
}

module.exports = {
  pool,
  initializeDatabase,
  getBlocklist,
  addToBlocklist,
  removeFromBlocklist,
  isWalletBlocked,
  saveDrawingResult,
  getDrawingResults,
  getDrawingResultById
};

