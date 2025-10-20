let allTransactions = [];
let filteredTransactions = [];
let currentWalletAddress = '';

// DOM Elements
const walletAddressInput = document.getElementById('walletAddress');
const scanBtn = document.getElementById('scanBtn');
const loading = document.getElementById('loading');
const filtersSection = document.getElementById('filtersSection');
const resultsSection = document.getElementById('resultsSection');
const statsSection = document.getElementById('statsSection');
const transactionsBody = document.getElementById('transactionsBody');
const noResults = document.getElementById('noResults');

// Filter elements
const filterWallet = document.getElementById('filterWallet');
const filterMinPrice = document.getElementById('filterMinPrice');
const filterMaxPrice = document.getElementById('filterMaxPrice');
const filterExactPrice = document.getElementById('filterExactPrice');
const filterStartDate = document.getElementById('filterStartDate');
const filterEndDate = document.getElementById('filterEndDate');
const filterType = document.getElementById('filterType');
const filterStatus = document.getElementById('filterStatus');
const applyFiltersBtn = document.getElementById('applyFilters');
const clearFiltersBtn = document.getElementById('clearFilters');
const exportBtn = document.getElementById('exportBtn');

// Stats elements
const totalTxsEl = document.getElementById('totalTxs');
const filteredTxsEl = document.getElementById('filteredTxs');
const totalVolumeEl = document.getElementById('totalVolume');

// Event Listeners
scanBtn.addEventListener('click', handleScan);
applyFiltersBtn.addEventListener('click', applyFilters);
clearFiltersBtn.addEventListener('click', clearFilters);
exportBtn.addEventListener('click', exportToCSV);

walletAddressInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleScan();
    }
});

// Quick date filter buttons
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('quick-filter-btn')) {
        const hours = parseInt(e.target.dataset.hours);
        setQuickDateFilter(hours);
        
        // Visual feedback
        document.querySelectorAll('.quick-filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        e.target.classList.add('active');
    }
});

async function handleScan() {
    const address = walletAddressInput.value.trim();
    
    if (!address) {
        alert('Please enter a wallet address');
        return;
    }
    
    if (!isValidSolanaAddress(address)) {
        alert('Please enter a valid Solana wallet address');
        return;
    }
    
    currentWalletAddress = address;
    await fetchTransactions(address);
}

function isValidSolanaAddress(address) {
    // Basic validation for Solana addresses (base58, 32-44 characters)
    return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
}

async function fetchTransactions(address) {
    loading.style.display = 'block';
    resultsSection.style.display = 'none';
    filtersSection.style.display = 'none';
    statsSection.style.display = 'none';
    
    try {
        // Fetch SOL transfers
        const response = await fetch(`/api/sol-transfers/${address}?limit=100`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch transactions');
        }
        
        const data = await response.json();
        
        // Process transactions
        allTransactions = processTransactions(data.data || [], address);
        filteredTransactions = [...allTransactions];
        
        displayTransactions(filteredTransactions);
        updateStats();
        
        filtersSection.style.display = 'block';
        statsSection.style.display = 'grid';
        resultsSection.style.display = 'block';
        
    } catch (error) {
        console.error('Error:', error);
        alert('Error fetching transactions. Please try again.');
    } finally {
        loading.style.display = 'none';
    }
}

function processTransactions(transactions, walletAddress) {
    return transactions.map(tx => {
        const isIncoming = tx.dst === walletAddress;
        const amount = tx.lamport / 1000000000; // Convert lamports to SOL
        const txType = isIncoming ? 'BUY' : 'SELL';
        
        return {
            signature: tx.txHash,
            type: txType,
            typeDisplay: isIncoming ? 'INCOMING' : 'OUTGOING',
            isBuy: isIncoming,
            isSell: !isIncoming,
            from: tx.src,
            to: tx.dst,
            amount: amount,
            timestamp: tx.blockTime * 1000, // Convert to milliseconds
            date: new Date(tx.blockTime * 1000),
            status: tx.status === 'Success' ? 'success' : 'failed',
            slot: tx.slot
        };
    });
}

function applyFilters() {
    const filters = {
        wallet: filterWallet.value.trim().toLowerCase(),
        minPrice: parseFloat(filterMinPrice.value) || 0,
        maxPrice: parseFloat(filterMaxPrice.value) || Infinity,
        exactPrice: parseFloat(filterExactPrice.value) || null,
        startDate: filterStartDate.value ? new Date(filterStartDate.value).getTime() : 0,
        endDate: filterEndDate.value ? new Date(filterEndDate.value).getTime() : Infinity,
        type: filterType.value,
        status: filterStatus.value
    };
    
    filteredTransactions = allTransactions.filter(tx => {
        // Wallet filter - check counterparty (the other wallet)
        if (filters.wallet) {
            const counterparty = tx.isBuy ? tx.from : tx.to;
            if (!counterparty.toLowerCase().includes(filters.wallet)) {
                return false;
            }
        }
        
        // Exact price filter (takes priority if set)
        if (filters.exactPrice !== null) {
            // Allow small variance for floating point comparison
            const variance = 0.0001;
            if (Math.abs(tx.amount - filters.exactPrice) > variance) {
                return false;
            }
        } else {
            // Price range filter
            if (tx.amount < filters.minPrice || tx.amount > filters.maxPrice) {
                return false;
            }
        }
        
        // Date and time filter
        if (tx.timestamp < filters.startDate || tx.timestamp > filters.endDate) {
            return false;
        }
        
        // Buy/Sell filter
        if (filters.type && tx.type !== filters.type) {
            return false;
        }
        
        // Status filter
        if (filters.status && tx.status !== filters.status) {
            return false;
        }
        
        return true;
    });
    
    displayTransactions(filteredTransactions);
    updateStats();
    
    // Show notification
    showNotification(`Found ${filteredTransactions.length} transactions matching filters`);
}

function clearFilters() {
    filterWallet.value = '';
    filterMinPrice.value = '';
    filterMaxPrice.value = '';
    filterExactPrice.value = '';
    filterStartDate.value = '';
    filterEndDate.value = '';
    filterType.value = '';
    filterStatus.value = '';
    
    // Remove active state from quick filter buttons
    document.querySelectorAll('.quick-filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    filteredTransactions = [...allTransactions];
    displayTransactions(filteredTransactions);
    updateStats();
    
    showNotification('All filters cleared');
}

function setQuickDateFilter(hours) {
    const now = new Date();
    const startDate = new Date(now.getTime() - (hours * 60 * 60 * 1000));
    
    // Format for datetime-local input
    filterStartDate.value = formatDateForInput(startDate);
    filterEndDate.value = formatDateForInput(now);
    
    // Auto-apply filters
    applyFilters();
}

function formatDateForInput(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function displayTransactions(transactions) {
    transactionsBody.innerHTML = '';
    
    if (transactions.length === 0) {
        noResults.style.display = 'block';
        document.querySelector('.table-container').style.display = 'none';
        return;
    }
    
    noResults.style.display = 'none';
    document.querySelector('.table-container').style.display = 'block';
    
    transactions.forEach(tx => {
        const row = document.createElement('tr');
        const typeIcon = tx.isBuy ? '🟢' : '🔴';
        const typeLabel = tx.isBuy ? 'BUY' : 'SELL';
        
        row.innerHTML = `
            <td>
                <span class="tx-signature" onclick="viewOnSolscan('${tx.signature}')">
                    ${shortenAddress(tx.signature)}
                </span>
            </td>
            <td>
                <span class="tx-type ${tx.type.toLowerCase()}">
                    ${typeIcon} ${typeLabel}
                </span>
            </td>
            <td>
                <span class="wallet-address" title="${tx.from}">
                    ${shortenAddress(tx.from)}
                </span>
            </td>
            <td>
                <span class="wallet-address" title="${tx.to}">
                    ${shortenAddress(tx.to)}
                </span>
            </td>
            <td><strong>${tx.amount.toFixed(4)}</strong> SOL</td>
            <td>${formatDate(tx.date)}</td>
            <td>
                <span class="tx-status ${tx.status}">
                    ${tx.status.toUpperCase()}
                </span>
            </td>
            <td>
                <button class="view-btn" onclick="viewOnSolscan('${tx.signature}')">
                    View
                </button>
            </td>
        `;
        
        transactionsBody.appendChild(row);
    });
}

function updateStats() {
    totalTxsEl.textContent = allTransactions.length;
    filteredTxsEl.textContent = filteredTransactions.length;
    
    const totalVolume = filteredTransactions.reduce((sum, tx) => sum + tx.amount, 0);
    totalVolumeEl.textContent = totalVolume.toFixed(4);
}

function shortenAddress(address) {
    if (address.length <= 16) return address;
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
}

function formatDate(date) {
    const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    };
    return date.toLocaleString('en-US', options);
}

function viewOnSolscan(signature) {
    window.open(`https://solscan.io/tx/${signature}`, '_blank');
}

function exportToCSV() {
    if (filteredTransactions.length === 0) {
        alert('No transactions to export');
        return;
    }
    
    // CSV Headers
    const headers = ['Signature', 'Type', 'From', 'To', 'Amount (SOL)', 'Date & Time', 'Status', 'Solscan Link'];
    
    // CSV Rows
    const rows = filteredTransactions.map(tx => [
        tx.signature,
        tx.type,
        tx.from,
        tx.to,
        tx.amount.toFixed(9),
        tx.date.toISOString(),
        tx.status,
        `https://solscan.io/tx/${tx.signature}`
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
    link.setAttribute('download', `solana_transactions_${currentWalletAddress}_${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification(`Exported ${filteredTransactions.length} transactions to CSV`);
}

function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
        color: var(--bg-dark);
        padding: 15px 25px;
        border-radius: 10px;
        font-weight: 600;
        box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

