// Set default dates (last 7 days for better scanning)
window.addEventListener('DOMContentLoaded', () => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    document.getElementById('endDate').value = formatDateForInput(now);
    document.getElementById('startDate').value = formatDateForInput(weekAgo);
});

function formatDateForInput(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

async function scanAllBuys() {
    const tokenAddress = document.getElementById('tokenAddress').value.trim();
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;

    if (!startDate || !endDate) {
        showNotification('Please select start and end dates', 'error');
        return;
    }

    document.getElementById('loading').style.display = 'block';
    document.getElementById('resultsSection').style.display = 'none';

    try {
        const response = await fetch('/api/scan-all-buys', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                tokenAddress,
                startDate: new Date(startDate).toISOString(),
                endDate: new Date(endDate).toISOString()
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to scan');
        }

        const data = await response.json();
        displayResults(data);
        showNotification(`Found ${data.buys.length} buy transactions!`, 'success');

    } catch (error) {
        console.error('Error:', error);
        showNotification(`Error: ${error.message}`, 'error');
    } finally {
        document.getElementById('loading').style.display = 'none';
    }
}

function displayResults(data) {
    const { buys, totalTransactions } = data;

    // Calculate stats
    const uniqueBuyersSet = new Set(buys.map(b => b.wallet));
    const totalVolume = buys.reduce((sum, b) => sum + b.solAmount, 0);

    document.getElementById('totalTxs').textContent = totalTransactions;
    document.getElementById('totalBuys').textContent = buys.length;
    document.getElementById('uniqueBuyers').textContent = uniqueBuyersSet.size;
    document.getElementById('totalVolume').textContent = totalVolume.toFixed(4);

    // Display all buys in table
    const tbody = document.getElementById('buysList');
    tbody.innerHTML = '';

    buys.forEach((buy, index) => {
        const row = document.createElement('tr');
        const buyTime = new Date(buy.timestamp * 1000);
        
        row.innerHTML = `
            <td><strong>${index + 1}</strong></td>
            <td>
                <span class="wallet-addr" title="${buy.wallet}">
                    ${shortenAddress(buy.wallet)}
                </span>
            </td>
            <td>${formatNumber(buy.tokenAmount)}</td>
            <td>${buy.solAmount.toFixed(4)} SOL</td>
            <td>$${buy.usdAmount ? buy.usdAmount.toFixed(2) : 'N/A'}</td>
            <td>$${buy.priceInUSD ? buy.priceInUSD.toFixed(6) : 'N/A'}</td>
            <td>${buyTime.toLocaleString()}</td>
            <td>
                <button class="copy-btn" onclick="copyToClipboard('${buy.wallet}')">Copy</button>
                <button class="copy-btn" onclick="viewOnSolscan('${buy.signature}')">View</button>
            </td>
        `;
        tbody.appendChild(row);
    });

    document.getElementById('resultsSection').style.display = 'block';
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

function showNotification(message, type = 'success') {
    const existing = document.querySelectorAll('.notification');
    existing.forEach(n => n.remove());

    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;

    if (type === 'error') {
        notification.style.background = 'linear-gradient(90deg, #f85149, #d29922)';
    }

    document.body.appendChild(notification);

    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 3000);
}

