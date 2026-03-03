# AGENTIC CHAIN - OpenClaw Skill

This is an OpenClaw skill for interacting with Agentic Chain.

## Installation

Copy this file to your OpenClaw skills directory:
- `~/.openclaw/skills/agentic/`

## Setup

1. Get the RPC URL:
   - Local: `http://localhost:8545`
   - Testnet: Get from deploy

2. Configure the skill:

```bash
# Set environment variables
export AGENTIC_RPC="http://localhost:8545"
export AGENTIC_CHAIN_ID="999999"  # Your chain ID
```

## Usage

### Check Balance

```javascript
// Check AGENTIC balance
const balance = await agentic.balance("0x...");
console.log(`Balance: ${balance} AGENTIC`);
```

### Transfer Tokens

```javascript
// Transfer AGENTIC
const tx = await agentic.transfer("0x...", 1000000000000000000n);
console.log(`Transaction: ${tx.hash}`);
```

### Stake Tokens

```javascript
// Stake for rewards
const stakeTx = await agentic.stake(1000000000000000000n);
console.log(`Staked: ${stakeTx.hash}`);
```

### Bridge Tokens

```javascript
// Request bridge to another chain
const bridgeTx = await agentic.bridge("0x...", 1000000000000000000n, "ethereum");
console.log(`Bridge: ${bridgeTx.hash}`);
```

### Run Node

```javascript
// Start a node and start earning
const node = await agentic.startNode();
console.log(`Node started: ${node.walletAddress}`);
console.log(`Rewards: ${node.earnings} AGENTIC`);
```

## API Reference

### agentic.balance(address)

Get token balance for an address.

**Parameters:**
- `address` (string): Wallet address

**Returns:** BigInt (wei)

### agentic.transfer(to, amount)

Transfer AGENTIC tokens.

**Parameters:**
- `to` (string): Recipient address
- `amount` (BigInt): Amount in wei

**Returns:** Transaction object

### agentic.stake(amount)

Stake AGENTIC tokens for 12% APY.

**Parameters:**
- `amount` (BigInt): Amount to stake

**Returns:** Transaction object

### agentic.unstake(amount)

Unstake AGENTIC tokens.

**Parameters:**
- `amount` (BigInt): Amount to unstake

**Returns:** Transaction object

### agentic.claimRewards()

Claim accumulated staking rewards.

**Returns:** Transaction object

### agentic.bridge(to, amount, destinationChain)

Request cross-chain bridge.

**Parameters:**
- `to` (string): Recipient on destination chain
- `amount` (BigInt): Amount to bridge
- `destinationChain` (string): Target chain name

**Returns:** Transaction object

### agentic.startNode()

Start an Agentic Chain node and begin earning rewards.

**Returns:** Node info object

### agentic.getNodeStatus()

Get current node status and earnings.

**Returns:** Status object

### agentic.getBlock(blockNumber)

Get block information.

**Parameters:**
- `blockNumber` (number): Block number (or "latest")

**Returns:** Block object

### agentic.getTransaction(txHash)

Get transaction details.

**Parameters:**
- `txHash` (string): Transaction hash

**Returns:** Transaction object

## Wise Usage Guidelines

1. **Start with simulations**: Use `eth_call` to simulate transactions before committing
2. **Monitor costs**: Set gas limits and track spending
3. **Batch operations**: Combine multiple operations to save fees
4. **Check rewards**: Regularly claim staking rewards
5. **Node uptime**: Keep node running for maximum earnings

## Error Handling

```javascript
try {
    const tx = await agentic.transfer(to, amount);
} catch (error) {
    if (error.code === 'INSUFFICIENT_BALANCE') {
        console.log('Not enough AGENTIC');
    } else if (error.code === 'GAS_TOO_LOW') {
        console.log('Increase gas limit');
    }
}
```

---

*© 2026 Agentic Chain Foundation*
