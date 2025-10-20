let analysisResults = null;
let drawingSettings = null;
let isAnalyzing = false;
let currentAbortController = null;

// Storage functions
function saveDrawingResult() {
    if (!analysisResults || !drawingSettings) {
        showNotification('No drawing results to save', 'error');
        return;
    }

    const drawingData = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        settings: drawingSettings,
        results: analysisResults,
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString()
    };

    const savedLotteries = JSON.parse(localStorage.getItem('lottoAfLotteries') || '[]');
    savedLotteries.unshift(drawingData); // Add to beginning
    
    // Keep only last 50 lotteries
    if (savedLotteries.length > 50) {
        savedLotteries.splice(50);
    }
    
    localStorage.setItem('lottoAfLotteries', JSON.stringify(savedLotteries));
    showNotification('🎉 Drawing result saved successfully!', 'success');
    loadSavedLotteries();
}

function loadSavedLotteries() {
    const savedLotteries = JSON.parse(localStorage.getItem('lottoAfLotteries') || '[]');
    const container = document.getElementById('savedLotteriesList');
    const savedSection = document.getElementById('savedLotteries');
    
    if (savedLotteries.length === 0) {
        savedSection.style.display = 'none';
        return;
    }
    
    savedSection.style.display = 'block';
    container.innerHTML = savedLotteries.map(drawing => `
        <div class="saved-drawing-item" onclick="loadSavedDrawing('${drawing.id}')">
            <div class="saved-drawing-date">🎱 ${drawing.date} at ${drawing.time}</div>
            <div class="saved-drawing-info">
                ${drawing.results.numberedBuys.length} winners • 
                ${drawing.settings.minPurchaseUSD}$ minimum • 
                ${drawing.settings.timezone} timezone
            </div>
        </div>
    `).join('');
}

function loadSavedDrawing(id) {
    const savedLotteries = JSON.parse(localStorage.getItem('lottoAfLotteries') || '[]');
    const drawing = savedLotteries.find(l => l.id.toString() === id);
    
    if (!drawing) {
        showNotification('Drawing not found', 'error');
        return;
    }
    
    // Load the drawing data
    drawingSettings = drawing.settings;
    analysisResults = drawing.results;
    
    // Display in popup
    displayDrawingResults(drawing.results, drawing.settings.timezone);
    showDrawingPopup();
    
    showNotification('🎱 Loaded saved drawing result', 'success');
}

function showDrawingPopup() {
    document.getElementById('popupOverlay').style.display = 'block';
    document.getElementById('drawingPopup').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function hideDrawingPopup() {
    document.getElementById('popupOverlay').style.display = 'none';
    document.getElementById('drawingPopup').style.display = 'none';
    document.body.style.overflow = 'auto';
}

function displayDrawingResults(data, timezone) {
    // Display stats in popup
    const statsContainer = document.getElementById('popupStats');
    statsContainer.innerHTML = `
        <div class="popup-stat-card">
            <div class="popup-stat-label">🎫 Total Winners</div>
            <div class="popup-stat-value">${data.numberedBuys.length}</div>
        </div>
        <div class="popup-stat-card">
            <div class="popup-stat-label">💰 Total Volume</div>
            <div class="popup-stat-value">${data.totalVolume.toFixed(2)} SOL</div>
        </div>
        <div class="popup-stat-card">
            <div class="popup-stat-label">💵 Total USD</div>
            <div class="popup-stat-value">$${data.totalUSD.toFixed(2)}</div>
        </div>
        <div class="popup-stat-card">
            <div class="popup-stat-label">📊 Unique Buyers</div>
            <div class="popup-stat-value">${data.uniqueBuyers}</div>
        </div>
    `;
    
    // Display trades in popup
    const tradesContainer = document.getElementById('popupTradesContainer');
    tradesContainer.innerHTML = `
        <h3 style="color: var(--primary-color); margin-bottom: 20px; text-align: center;">
            🎱 DRAWING BALLS (1-${data.numberedBuys.length})
        </h3>
        <div style="display: grid; gap: 15px; grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));">
            ${data.numberedBuys.map(trade => createTradeCard(trade, timezone)).join('')}
        </div>
    `;
}

function openInNewWindow() {
    if (!analysisResults) {
        showNotification('No drawing results to open', 'error');
        return;
    }
    
    const newWindow = window.open('', '_blank', 'width=1200,height=800,scrollbars=yes');
    newWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>🎱 LOTTO AF Drawing Results</title>
            <style>
                body { 
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                    background: #0a0a0a; 
                    color: #ffffff; 
                    margin: 0; 
                    padding: 20px;
                }
                .container { max-width: 1200px; margin: 0 auto; }
                h1 { color: #14f195; text-align: center; margin-bottom: 30px; }
                .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
                .stat-card { background: linear-gradient(135deg, #14f195, #9945ff); padding: 20px; border-radius: 15px; text-align: center; color: #000; }
                .trades { display: grid; gap: 15px; grid-template-columns: repeat(auto-fill, minmax(400px, 1fr)); }
                .trade-card { background: #1a1a1a; border: 1px solid #14f195; border-radius: 10px; padding: 15px; }
                .drawing-ball { width: 60px; height: 60px; border-radius: 50%; background: radial-gradient(circle at 30% 30%, #ffffff, #14f195 45%, #9945ff); display: flex; justify-content: center; align-items: center; font-size: 1.5rem; font-weight: 900; color: #000; box-shadow: 0 4px 15px rgba(20, 241, 149, 0.5); }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>🎱 LOTTO AF DRAWING RESULTS</h1>
                <div class="stats">
                    <div class="stat-card">
                        <div style="font-size: 0.9rem; margin-bottom: 5px;">🎫 Total Winners</div>
                        <div style="font-size: 1.8rem; font-weight: 900;">${analysisResults.numberedBuys.length}</div>
                    </div>
                    <div class="stat-card">
                        <div style="font-size: 0.9rem; margin-bottom: 5px;">💰 Total Volume</div>
                        <div style="font-size: 1.8rem; font-weight: 900;">${analysisResults.totalVolume.toFixed(2)} SOL</div>
                    </div>
                    <div class="stat-card">
                        <div style="font-size: 0.9rem; margin-bottom: 5px;">💵 Total USD</div>
                        <div style="font-size: 1.8rem; font-weight: 900;">$${analysisResults.totalUSD.toFixed(2)}</div>
                    </div>
                </div>
                <div class="trades">
                    ${analysisResults.numberedBuys.map(trade => `
                        <div class="trade-card">
                            <div style="display: flex; align-items: center; gap: 15px;">
                                <div class="drawing-ball">${trade.number}</div>
                                <div style="flex: 1;">
                                    <div style="font-weight: 700; color: #14f195; margin-bottom: 5px;">🏆 ${trade.wallet.substring(0, 8)}...${trade.wallet.substring(trade.wallet.length - 8)}</div>
                                    <div style="font-size: 0.9rem; color: #cccccc;">
                                        💰 Spent: ${trade.solAmount.toFixed(4)} SOL ($${trade.usdAmount.toFixed(2)})<br>
                                        🪙 Bought: ${trade.tokenAmount.toLocaleString()} tokens<br>
                                        📅 ${new Date(trade.timestamp).toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </body>
        </html>
    `);
    newWindow.document.close();
}

function stopAnalysis() {
    if (currentAbortController) {
        currentAbortController.abort();
        currentAbortController = null;
    }
    
    isAnalyzing = false;
    document.getElementById('loading').style.display = 'none';
    document.getElementById('stopBtn').style.display = 'none';
    
    showNotification('🛑 Drawing analysis stopped', 'info');
}

// Set default dates (last 24 hours)
window.addEventListener('DOMContentLoaded', () => {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    document.getElementById('endDate').value = formatDateForInput(now);
    document.getElementById('startDate').value = formatDateForInput(yesterday);
    
    // Initialize popup event listeners
    document.getElementById('popupClose').addEventListener('click', hideDrawingPopup);
    document.getElementById('popupOverlay').addEventListener('click', hideDrawingPopup);
    
    // Load saved lotteries
    loadSavedLotteries();
});

function formatDateForInput(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

// Step 1: Create Drawing
function createDrawing() {
    const tokenAddress = document.getElementById('tokenAddress').value.trim();
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const minPrice = document.getElementById('minPrice').value;
    const timezone = document.getElementById('timezone').value;

    // Validation
    if (!tokenAddress) {
        showNotification('Please enter a token contract address', 'error');
        return;
    }

    if (!isValidSolanaAddress(tokenAddress)) {
        showNotification('Please enter a valid Solana address', 'error');
        return;
    }

    if (!startDate || !endDate) {
        showNotification('Please select start and end dates', 'error');
        return;
    }

    // Store drawing settings
    drawingSettings = {
        tokenAddress,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        minPrice: minPrice ? parseFloat(minPrice) : null,
        timezone
    };

    // Update UI
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    const infoText = `
        <strong>Start:</strong> ${startDateObj.toLocaleString()}<br>
        <strong>End:</strong> ${endDateObj.toLocaleString()}<br>
        ${minPrice ? `<strong>Min Purchase:</strong> $${minPrice} USD<br>` : ''}
        <strong>Status:</strong> <span style="color: var(--success);">● ACTIVE</span> - Waiting for 69 buyers
    `;
    document.getElementById('drawingInfo').innerHTML = infoText;
    document.getElementById('drawingCreatedSection').style.display = 'block';
    document.getElementById('createDrawingBtn').disabled = true;

    showNotification('🔮 Drawing created! Now click "Draw Drawing Balls"', 'success');
}

// Step 2: Calculate Current Results
async function calculateDrawing() {
    if (!drawingSettings) {
        showNotification('Please create a drawing first', 'error');
        return;
    }

    // Set up abort controller for cancellation
    currentAbortController = new AbortController();
    isAnalyzing = true;

    document.getElementById('loading').style.display = 'block';
    document.getElementById('loadingText').textContent = '🔮 Drawing drawing balls... Finding winners!';
    document.getElementById('resultsSection').style.display = 'none';
    document.getElementById('calculateBtn').disabled = true;
    document.getElementById('stopBtn').style.display = 'block';

    try {
        const response = await fetch('/api/analyze-token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(drawingSettings),
            signal: currentAbortController.signal
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to analyze token');
        }

        const data = await response.json();
        analysisResults = data;
        displayResults(data, drawingSettings.timezone);

        // Show refresh button if we don't have 69 buyers yet and end date hasn't passed
        const endDate = new Date(drawingSettings.endDate);
        const now = new Date();
        
        if (data.numberedBuys.length < 69 && now < endDate) {
            document.getElementById('refreshBtn').style.display = 'block';
            showNotification(`🎱 Drew ${data.numberedBuys.length}/69 drawing balls. Click refresh for more!`, 'success');
        } else if (data.numberedBuys.length >= 69) {
            document.getElementById('refreshBtn').style.display = 'none';
            showNotification(`🎉 ALL 69 DRAWING BALLS DRAWN! Winners complete!`, 'success');
        } else {
            document.getElementById('refreshBtn').style.display = 'none';
            showNotification(`⏰ Time ended. Drew ${data.numberedBuys.length} drawing balls.`, 'success');
        }

        // Show results in popup
        displayDrawingResults(data, drawingSettings.timezone);
        showDrawingPopup();

    } catch (error) {
        if (error.name === 'AbortError') {
            showNotification('🛑 Drawing analysis cancelled', 'info');
            return;
        }
        console.error('Error:', error);
        showNotification(`Error: ${error.message}`, 'error');
    } finally {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('calculateBtn').disabled = false;
        document.getElementById('stopBtn').style.display = 'none';
        isAnalyzing = false;
        currentAbortController = null;
    }
}

// Step 3: Refresh to check for more buyers
async function refreshDrawing() {
    if (!drawingSettings) {
        showNotification('Please create a drawing first', 'error');
        return;
    }

    // Update end date to now to capture new transactions
    const now = new Date();
    const originalEndDate = new Date(drawingSettings.endDate);
    
    if (now > originalEndDate) {
        showNotification('Drawing time period has ended', 'error');
        return;
    }

    document.getElementById('loading').style.display = 'block';
    document.getElementById('loadingText').textContent = '🔄 Checking for new drawing balls...';
    document.getElementById('refreshBtn').disabled = true;

    try {
        const response = await fetch('/api/analyze-token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(drawingSettings)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to refresh');
        }

        const data = await response.json();
        const previousCount = analysisResults ? analysisResults.numberedBuys.length : 0;
        analysisResults = data;
        displayResults(data, drawingSettings.timezone);

        const newBuyers = data.numberedBuys.length - previousCount;

        if (data.numberedBuys.length >= 69) {
            document.getElementById('refreshBtn').style.display = 'none';
            showNotification(`🎉 ALL 69 DRAWING BALLS DRAWN! (+${newBuyers} new)`, 'success');
        } else if (newBuyers > 0) {
            showNotification(`🎱 Drew ${newBuyers} new balls! Total: ${data.numberedBuys.length}/69`, 'success');
        } else {
            showNotification(`⏳ No new balls yet. Still at ${data.numberedBuys.length}/69`, 'success');
        }

    } catch (error) {
        console.error('Error:', error);
        showNotification(`Error: ${error.message}`, 'error');
    } finally {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('refreshBtn').disabled = false;
    }
}

function displayResults(data, timezone) {
    const { totalBuys, numberedBuys } = data;

    // Update stats
    document.getElementById('totalBuys').textContent = totalBuys;
    document.getElementById('numberedTraders').textContent = numberedBuys.length;

    if (numberedBuys.length > 0) {
        const firstTrade = new Date(numberedBuys[0].timestamp * 1000);
        const lastTrade = new Date(numberedBuys[numberedBuys.length - 1].timestamp * 1000);
        document.getElementById('timeRange').textContent = 
            `${firstTrade.toLocaleDateString()} - ${lastTrade.toLocaleDateString()}`;
    }

    // Display trades
    const container = document.getElementById('tradesContainer');
    const noResults = document.getElementById('noResults');

    if (numberedBuys.length === 0) {
        container.innerHTML = '';
        noResults.style.display = 'block';
    } else {
        noResults.style.display = 'none';
        container.innerHTML = numberedBuys.map(trade => createTradeCard(trade, timezone)).join('');
    }

    // Show results section
    document.getElementById('resultsSection').style.display = 'block';
}

function createTradeCard(trade, timezone) {
    const { number, wallet, tokenAmount, solAmount, priceInSol, usdAmount, priceInUSD, solPriceUSD, formattedDate, signature } = trade;

    return `
        <div class="trade-card">
            <div class="trade-number">
                <div class="drawing-ball">${number}</div>
            </div>
            <div class="trade-info">
                <div class="trade-wallet" title="${wallet}">
                    🏆 ${shortenAddress(wallet)}
                </div>
                <div class="trade-details">
                    <div class="trade-detail-item">
                        <strong>$LOTTA AF:</strong> ${formatNumber(tokenAmount)}
                    </div>
                    <div class="trade-detail-item">
                        <strong>💵 USD Spent:</strong> $${usdAmount ? usdAmount.toFixed(2) : 'N/A'}
                    </div>
                    <div class="trade-detail-item">
                        <strong>Spent SOL:</strong> ${solAmount.toFixed(4)} SOL ${solPriceUSD ? `($${solPriceUSD.toFixed(2)}/SOL)` : ''}
                    </div>
                    <div class="trade-detail-item">
                        <strong>Price/Token:</strong> $${priceInUSD ? priceInUSD.toFixed(6) : 'N/A'}
                    </div>
                    <div class="trade-detail-item">
                        <strong>Buy Time:</strong> ${formattedDate}
                    </div>
                </div>
            </div>
            <div class="trade-actions">
                <button class="action-btn" onclick="copyToClipboard('${wallet}')">
                    📋 Copy
                </button>
                <button class="action-btn" onclick="viewOnSolscan('${signature}')">
                    🔍 View
                </button>
            </div>
        </div>
    `;
}

function shortenAddress(address) {
    if (!address || address.length <= 16) return address || 'Unknown';
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
}

function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(2) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(2) + 'K';
    }
    return num.toFixed(2);
}

function isValidSolanaAddress(address) {
    return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification('Wallet address copied!', 'success');
    }).catch(err => {
        console.error('Failed to copy:', err);
        showNotification('Failed to copy address', 'error');
    });
}

function viewOnSolscan(signature) {
    window.open(`https://solscan.io/tx/${signature}`, '_blank');
}

function exportResults() {
    if (!analysisResults || analysisResults.numberedBuys.length === 0) {
        showNotification('No results to export', 'error');
        return;
    }

    const { numberedBuys, tokenAddress } = analysisResults;

    // CSV Headers
    const headers = [
        'Drawing Number',
        'Winner Wallet Address',
        'LOTTA AF Tokens',
        'USD Spent',
        'SOL Spent',
        'SOL Price (USD)',
        'Price per Token (USD)',
        'Buy Time',
        'Transaction Signature',
        'Solscan Link'
    ];

    // CSV Rows
    const rows = numberedBuys.map(trade => [
        trade.number,
        trade.wallet,
        trade.tokenAmount.toFixed(2),
        trade.usdAmount ? `$${trade.usdAmount.toFixed(2)}` : 'N/A',
        trade.solAmount.toFixed(4),
        trade.solPriceUSD ? `$${trade.solPriceUSD.toFixed(2)}` : 'N/A',
        trade.priceInUSD ? `$${trade.priceInUSD.toFixed(6)}` : 'N/A',
        trade.formattedDate,
        trade.signature,
        `https://solscan.io/tx/${trade.signature}`
    ]);

    // Create CSV content
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `LOTTA_AF_Drawing_Results_${Date.now()}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showNotification(`🎰 Exported ${numberedBuys.length} drawing winners to CSV!`, 'success');
}

function showNotification(message, type = 'success') {
    // Remove existing notifications
    const existing = document.querySelectorAll('.notification');
    existing.forEach(n => n.remove());

    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;

    if (type === 'error') {
        notification.style.background = 'linear-gradient(90deg, #f85149, #d29922)';
    }

    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Reset and create new drawing
function resetDrawing() {
    drawingSettings = null;
    analysisResults = null;
    
    // Reset UI
    document.getElementById('drawingCreatedSection').style.display = 'none';
    document.getElementById('resultsSection').style.display = 'none';
    document.getElementById('createDrawingBtn').disabled = false;
    document.getElementById('refreshBtn').style.display = 'none';
    
    // Reset dates to default
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    document.getElementById('endDate').value = formatDateForInput(now);
    document.getElementById('startDate').value = formatDateForInput(yesterday);
    
    showNotification('Ready to create a new drawing!', 'success');
}

// Allow Enter key to create drawing
document.getElementById('tokenAddress').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        createDrawing();
    }
});

