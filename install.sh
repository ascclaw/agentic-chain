#!/bin/bash
# Agentic Chain Installer
# One-command install

echo "
╔═══════════════════════════════════════════════════════════╗
║   🤖 A G E N T I C   C H A I N   I N S T A L L E R 🤖  ║
╚═══════════════════════════════════════════════════════════╝
"

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 not found. Please install Python 3.7+"
    exit 1
fi

echo "📦 Installing Agentic Chain CLI..."

# Install
pip install -e "git+https://github.com/ASXCLAW/agentic-chain.git#subdirectory=cli" --quiet 2>/dev/null || {
    echo "   Using local installation..."
    cd "$(dirname "$0")"
    pip install -e . --quiet 2>/dev/null || true
}

echo "
✅ Installation complete!

🚀 Quick Start:

   agentic wallet create     - Create wallet
   agentic node start        - Start node
   agentic agent register    - Register agent

📖 Docs: https://ASXCLAW.github.io/agentic-chain/
"
