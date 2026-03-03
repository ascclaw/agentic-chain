# 🤖 Agentic Chain - Substrate Runtime

This directory contains the **real blockchain implementation** using Substrate.

## Quick Start (30-60 minutes)

### Option 1: Use Python Prototype (Ready Now)

```bash
cd substrate
python3 agentic_runtime.py
```

This runs a fully functional blockchain in Python with:
- Block production
- Transaction pool
- Aura consensus
- Multiple validators
- RPC interface

### Option 2: Build Real Substrate Chain

For production, fork the official Substrate template:

```bash
# Clone official template
git clone https://github.com/substrate-developer-hub/substrate-node-template
cd substrate-node-template

# Checkout stable version
git checkout polkadot-v1.7.1

# Build (30+ min)
cargo build --release

# Run
./target/release/node-template --dev
```

## Features

| Feature | Python Prototype | Substrate |
|---------|------------------|-----------|
| Consensus | Aura (simulated) | Aura + Grandpa |
| P2P | Simulated | Real libp2p |
| Smart Contracts | Basic | Wasm + EVM |
| Performance | Testnet | Production |
| Setup Time | 1 min | 30-60 min |

## Python Prototype Commands

```bash
# Run
python3 agentic_runtime.py

# Commands:
balance 0x...   # Check balance
send            # Send transaction
blocks          # Show blocks
peers           # Show peers
quit            # Exit
```

## For Production (Real Substrate)

1. **Clone**: `git clone https://github.com/substrate-developer-hub/substrate-node-template`
2. **Customize**: Add pallets in `runtime/src/lib.rs`
3. **Build**: `cargo build --release`
4. **Launch**: `./target/release/node-template --dev`

## Architecture

```
┌─────────────────────────────────────────┐
│           Agentic Chain                 │
├─────────────────────────────────────────┤
│  ┌─────────────────────────────────┐   │
│  │     Runtime (State Machine)     │   │
│  │  • Balances Pallet              │   │
│  │  • Agent Wallet Pallet          │   │
│  │  • Inference Pallet             │   │
│  └─────────────────────────────────┘   │
├─────────────────────────────────────────┤
│  ┌─────────────────────────────────┐   │
│  │     Consensus (Aura + Grandpa)  │   │
│  └─────────────────────────────────┘   │
├─────────────────────────────────────────┤
│  ┌─────────────────────────────────┐   │
│  │     P2P Networking (libp2p)     │   │
│  └─────────────────────────────────┘   │
├─────────────────────────────────────────┤
│  ┌─────────────────────────────────┐   │
│  │     RPC Interface               │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

## Documentation

- [Substrate Docs](https://docs.substrate.io/)
- [Polkadot Wiki](https://wiki.polkadot.network/)
- [Substrate Stack Exchange](https://substrate.stackexchange.com/)

---

*© 2026 Agentic Chain Foundation*
