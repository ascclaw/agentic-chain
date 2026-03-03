// AGENTIC CHAIN - OpenClaw Skill
// Interaction with Agentic Chain for autonomous agents

const { ethers } = require('ethers');

// Configuration
const CONFIG = {
    rpcUrl: process.env.AGENTIC_RPC || 'http://localhost:8545',
    chainId: parseInt(process.env.AGENTIC_CHAIN_ID || '999999'),
    tokenAddress: process.env.AGENTIC_TOKEN || '0x0000000000000000000000000000000000000001',
    gatewayAddress: process.env.AGENTIC_GATEWAY || '0x0000000000000000000000000000000000000002'
};

// ABI fragments
const ERC20_ABI = [
    'function balanceOf(address owner) view returns (uint256)',
    'function transfer(address to, uint256 amount) returns (bool)',
    'function approve(address spender, uint256 amount) returns (bool)',
    'function stake(uint256 amount)',
    'function unstake(uint256 amount)',
    'function claimRewards()',
    'function getStakedBalance(address account) view returns (uint256)',
    'function getPendingRewards(address account) view returns (uint256)'
];

const GATEWAY_ABI = [
    'function registerAgent(address agent, string metadata)',
    'function executeTask(address target, bytes data, string taskDescription) returns (bytes32)',
    'function requestBridge(address token, uint256 amount) returns (bytes32)',
    'function isTaskExecuted(bytes32 taskId) view returns (bool)'
];

/**
 * Initialize provider and contracts
 */
function getProvider() {
    return new ethers.JsonRpcProvider(CONFIG.rpcUrl);
}

function getWallet(privateKey) {
    return new ethers.Wallet(privateKey, getProvider());
}

function getTokenContract(wallet) {
    return new ethers.Contract(CONFIG.tokenAddress, ERC20_ABI, wallet);
}

function getGatewayContract(wallet) {
    return new ethers.Contract(CONFIG.gatewayAddress, GATEWAY_ABI, wallet);
}

/**
 * Get AGENTIC balance for an address
 */
async function balance(address) {
    const provider = getProvider();
    const token = getTokenContract(provider);
    const bal = await token.balanceOf(address);
    return bal;
}

/**
 * Transfer AGENTIC tokens
 */
async function transfer(to, amount, privateKey) {
    const wallet = getWallet(privateKey);
    const token = getTokenContract(wallet);
    
    const tx = await token.transfer(to, amount);
    await tx.wait();
    
    return {
        hash: tx.hash,
        status: 'confirmed',
        to,
        amount: amount.toString()
    };
}

/**
 * Stake tokens for rewards
 */
async function stake(amount, privateKey) {
    const wallet = getWallet(privateKey);
    const token = getTokenContract(wallet);
    
    // Approve first
    const approveTx = await token.approve(CONFIG.tokenAddress, amount);
    await approveTx.wait();
    
    // Stake
    const tx = await token.stake(amount);
    await tx.wait();
    
    return {
        hash: tx.hash,
        status: 'confirmed',
        amount: amount.toString()
    };
}

/**
 * Unstake tokens
 */
async function unstake(amount, privateKey) {
    const wallet = getWallet(privateKey);
    const token = getTokenContract(wallet);
    
    const tx = await token.unstake(amount);
    await tx.wait();
    
    return {
        hash: tx.hash,
        status: 'confirmed',
        amount: amount.toString()
    };
}

/**
 * Claim staking rewards
 */
async function claimRewards(privateKey) {
    const wallet = getWallet(privateKey);
    const token = getTokenContract(wallet);
    
    const tx = await token.claimRewards();
    await tx.wait();
    
    return {
        hash: tx.hash,
        status: 'confirmed'
    };
}

/**
 * Get staking info
 */
async function getStakeInfo(address) {
    const provider = getProvider();
    const token = getTokenContract(provider);
    
    const staked = await token.getStakedBalance(address);
    const pending = await token.getPendingRewards(address);
    
    return {
        staked: staked.toString(),
        pendingRewards: pending.toString()
    };
}

/**
 * Execute agent task via Gateway
 */
async function executeTask(target, data, description, privateKey) {
    const wallet = getWallet(privateKey);
    const gateway = getGatewayContract(wallet);
    
    const tx = await gateway.executeTask(target, data, description);
    await tx.wait();
    
    return {
        hash: tx.hash,
        taskId: ethers.keccak256(abi.encode(...)),
        status: 'executed'
    };
}

/**
 * Request bridge
 */
async function requestBridge(token, amount, privateKey) {
    const wallet = getWallet(privateKey);
    const gateway = getGatewayContract(wallet);
    
    const tx = await gateway.requestBridge(token, amount);
    await tx.wait();
    
    return {
        hash: tx.hash,
        status: 'pending'
    };
}

/**
 * Get block info
 */
async function getBlock(blockNumber = 'latest') {
    const provider = getProvider();
    const block = await provider.getBlock(blockNumber);
    
    return {
        number: block.number,
        hash: block.hash,
        parentHash: block.parentHash,
        timestamp: block.timestamp,
        transactions: block.transactions.length,
        gasUsed: block.gasUsed?.toString()
    };
}

/**
 * Get transaction info
 */
async function getTransaction(txHash) {
    const provider = getProvider();
    const tx = await provider.getTransaction(txHash);
    
    const receipt = await provider.getTransactionReceipt(txHash);
    
    return {
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        value: tx.value.toString(),
        gasUsed: receipt.gasUsed.toString(),
        status: receipt.status === 1 ? 'success' : 'failed'
    };
}

/**
 * Start a node (creates wallet and connects)
 */
async function startNode() {
    // Generate new wallet
    const wallet = ethers.Wallet.createRandom();
    
    return {
        walletAddress: wallet.address,
        privateKey: wallet.privateKey,
        mnemonic: wallet.mnemonic.phrase,
        rpc: CONFIG.rpcUrl,
        chainId: CONFIG.chainId
    };
}

/**
 * Get node status
 */
async function getNodeStatus(walletAddress) {
    const provider = getProvider();
    const network = await provider.getNetwork();
    
    const balance = await provider.getBalance(walletAddress);
    const stakeInfo = await getStakeInfo(walletAddress);
    
    return {
        address: walletAddress,
        balance: balance.toString(),
        chainId: network.chainId.toString(),
        ...stakeInfo
    };
}

// Export for OpenClaw
module.exports = {
    // Config
    config: CONFIG,
    
    // Core functions
    balance,
    transfer,
    stake,
    unstake,
    claimRewards,
    getStakeInfo,
    executeTask,
    requestBridge,
    
    // Blockchain queries
    getBlock,
    getTransaction,
    
    // Node operations
    startNode,
    getNodeStatus
};

// For OpenClaw skill format
module.exports.SKILL = {
    name: 'agentic',
    description: 'Interact with Agentic Chain - stake, transfer, bridge, and run nodes',
    actions: ['balance', 'transfer', 'stake', 'unstake', 'claimRewards', 'bridge', 'startNode'],
    envVars: ['AGENTIC_RPC', 'AGENTIC_CHAIN_ID', 'AGENTIC_TOKEN', 'AGENTIC_GATEWAY']
};
