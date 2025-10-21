// Load blocklist on page load
window.addEventListener('DOMContentLoaded', loadBlocklist);

async function loadBlocklist() {
    try {
        const response = await fetch('/api/admin/blocklist');
        const data = await response.json();
        
        displayBlocklist(data);
    } catch (error) {
        console.error('Error loading blocklist:', error);
        showNotification('Error loading blocklist', 'error');
    }
}

function displayBlocklist(data) {
    const { blockedWallets, reason } = data;
    const tbody = document.getElementById('blocklistBody');
    const countBadge = document.getElementById('blocklistCount');
    
    countBadge.textContent = blockedWallets.length;
    
    if (blockedWallets.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; padding: 40px; color: var(--text-secondary);">
                    No blocked wallets yet. Add wallets to exclude them from drawing results.
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = '';
    
    blockedWallets.forEach((wallet, index) => {
        const row = document.createElement('tr');
        const walletReason = reason[wallet] || 'No reason specified';
        
        row.innerHTML = `
            <td><strong>${index + 1}</strong></td>
            <td class="wallet-cell" title="${wallet}">
                ${wallet}
            </td>
            <td>${walletReason}</td>
            <td>
                <button class="remove-btn" onclick="removeFromBlocklist('${wallet}')">
                    ❌ Remove
                </button>
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

async function addToBlocklist() {
    const wallet = document.getElementById('newWalletAddress').value.trim();
    const reason = document.getElementById('newWalletReason').value.trim();
    
    if (!wallet) {
        showNotification('Please enter a wallet address', 'error');
        return;
    }
    
    if (!isValidSolanaAddress(wallet)) {
        showNotification('Please enter a valid Solana address', 'error');
        return;
    }
    
    try {
        const response = await fetch('/api/admin/blocklist/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                wallet,
                reason: reason || 'Excluded from drawing'
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            displayBlocklist(data.blocklist);
            document.getElementById('newWalletAddress').value = '';
            document.getElementById('newWalletReason').value = '';
            showNotification('Wallet added to blocklist!', 'success');
        } else {
            showNotification('Failed to add wallet', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error adding to blocklist', 'error');
    }
}

async function removeFromBlocklist(wallet) {
    if (!confirm(`Remove ${wallet.slice(0, 8)}...${wallet.slice(-8)} from blocklist?`)) {
        return;
    }
    
    try {
        const response = await fetch('/api/admin/blocklist/remove', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ wallet })
        });
        
        const data = await response.json();
        
        if (data.success) {
            displayBlocklist(data.blocklist);
            showNotification('Wallet removed from blocklist!', 'success');
        } else {
            showNotification('Failed to remove wallet', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error removing from blocklist', 'error');
    }
}

async function clearBlocklist() {
    if (!confirm('⚠️ This will CLEAR ALL blocked wallets and reset to default (only the LP wallet).\n\nAre you sure?')) {
        return;
    }
    
    try {
        const response = await fetch('/api/admin/blocklist/clear', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            displayBlocklist(data.blocklist);
            showNotification('🧹 Blocklist cleared and reset to default!', 'success');
        } else {
            showNotification('Failed to clear blocklist', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error clearing blocklist', 'error');
    }
}

function isValidSolanaAddress(address) {
    return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
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

