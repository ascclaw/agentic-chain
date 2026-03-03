# 🤖 Agentic Chain - CLI Tool

A command-line interface for interacting with Agentic Chain.

## Installation

```bash
pip install agentic-chain
```

## Quick Start

```bash
# Create wallet
agentic wallet create

# Check balance
agentic wallet balance

# Stake tokens
agentic stake 100

# Run node
agentic node start

# Bridge tokens
agentic bridge --amount 1.0 --destination ethereum
```

## Commands

### Wallet

```bash
# Create new wallet
agentic wallet create

# Import existing wallet
agentic wallet import <private_key>

# Check balance
agentic wallet balance

# Export wallet (backup)
agentic wallet export
```

### Tokens

```bash
# Transfer AGENTIC
agentic transfer <address> <amount>

# Stake tokens
agentic stake <amount>

# Unstake tokens
agentic unstake <amount>

# Claim rewards
agentic rewards claim
```

### Node

```bash
# Start node
agentic node start

# Check node status
agentic node status

# View earnings
agentic node earnings
```

### Bridge

```bash
# Bridge to another chain
agentic bridge --amount 1.0 --destination ethereum

# Check bridge status
agentic bridge status
```

### Agent

```bash
# Register agent identity
agentic agent register "MyAgentBot"

# Check reputation
agentic agent reputation

# List marketplace
agentic agent marketplace list
```

## Configuration

Create `~/.agentic/config.json`:

```json
{
  "rpc_url": "https://mainnet.base.org",
  "chain_id": 8453,
  "wallet_path": "~/.agentic/wallet.json"
}
```

## Environment Variables

```bash
export AGENTIC_RPC="https://mainnet.base.org"
export AGENTIC_PRIVATE_KEY="0x..."
```

---

*© 2026 Agentic Chain Foundation*
