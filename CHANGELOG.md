# Changelog

All notable changes to the Universal On-Chain Lottery Drawing System will be documented in this file.

## [1.5.0] - 2025-01-21

### 🎉 Major Update: Universal Token Support

#### Added
- ✨ **Universal Token Support**: Now works with ANY Solana token address
- 🏷️ **Version Display**: Version number (v1.5) displayed under logo
- 🪙 **Token Address Display**: Shows token address in results popup and exports
- 📊 **Enhanced CSV Export**: Includes token address in exported files
- 📚 **Saved Drawings**: Token address shown for each saved drawing
- 🔍 **Universal Diagnostic Scan**: Works with any token for troubleshooting
- 📖 **Comprehensive Guide**: Added UNIVERSAL_LOTTERY_GUIDE.md
- 🗄️ **Database Support**: PostgreSQL support for persistent storage (optional)
- ⚡ **File-Based Mode**: Works without database using local JSON files

#### Changed
- 🎨 **Branding Update**: Changed from "LOTTO AF" to "Universal Lottery Drawing"
- 📝 **Editable Token Input**: Token address field is now editable (was readonly)
- 📄 **Updated Documentation**: README.md reflects universal capabilities
- 🔧 **Improved Error Handling**: Better database connection handling

#### Fixed
- 🐛 **Railway Deployment**: Fixed database connection issues on Railway
- 🛡️ **Null Safety**: Added null checks to all database functions
- ✅ **File-Based Fallback**: App works perfectly without database configured

### Use Cases
- 🚀 Token launches and giveaways
- 🎁 Community rewards
- 🏆 Trading competitions
- 📈 Marketing campaigns
- 🤝 Fair, transparent on-chain drawings

---

## [1.0.0] - 2024-12-XX

### Initial Release

#### Features
- Basic lottery drawing for LOTTA AF token
- First 69 buyers tracking
- Drawing ball numbers (1-69)
- Time-based filtering
- Price filtering
- Wallet scanner
- Admin blocklist management
- CSV export functionality
- Timezone support
- Multi-DEX support (Raydium, Jupiter, Pump.fun)

---

## Version Numbering

This project follows [Semantic Versioning](https://semver.org/):
- **MAJOR.MINOR.PATCH**
- **MAJOR**: Breaking changes
- **MINOR**: New features (backwards compatible)
- **PATCH**: Bug fixes (backwards compatible)

---

## Future Roadmap

### Planned Features
- [ ] Multi-token drawing comparisons
- [ ] Historical drawing analytics
- [ ] NFT distribution integration
- [ ] Discord/Telegram bot integration
- [ ] Scheduled automatic drawings
- [ ] Winner verification system
- [ ] Custom drawing number ranges (beyond 69)
- [ ] Prize pool tracking
- [ ] Multiple winner tiers

---

**For detailed usage instructions, see [UNIVERSAL_LOTTERY_GUIDE.md](UNIVERSAL_LOTTERY_GUIDE.md)**

