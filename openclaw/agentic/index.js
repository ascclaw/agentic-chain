// AGENTIC CHAIN - OpenClaw Skill v2
// Enhanced for AI Agents with safety, marketplace, and batch operations

const { ethers } = require('ethers');

// Configuration
const CONFIG = {
    rpcUrl: process.env.AGENTIC_RPC || 'http://localhost:8545',
    chainId: parseInt(process.env.AGENTIC_CHAIN_ID || '999999'),
    tokenAddress: process.env.AGENTIC_TOKEN || '0x0000000000000000000000000000000000000001',
    gatewayAddress: process.env.AGENTIC_GATEWAY || '0x0000000000000000000000000000000000000002',
    batchExecutorAddress: process.env.AGENTIC_BATCH || '0x0000000000000000000000000000000000000003',
    agentSafetyAddress: process.env.AGENTIC_SAFETY || '0x0000000000000000000000000000000000000004',
    agentIdentityAddress: process.env.AGENTIC_IDENTITY || '0x0000000000000000000000000000000000000005',
    marketplaceAddress: process.env.AGENTIC_MARKETPLACE || '0x0000000000000000000000000000000000000006'
};

// Extended ABIs
const BATCH_ABI = [
    'function executeBatch(address[] targets, bytes[] data) external payable returns (bytes[])',
    'function executeBatchWithValue(address[] targets, bytes[] data, uint256[] values) external payable returns (bytes[])'
];

const SAFETY_ABI = [
    'function checkRateLimit(address agent) view returns (bool allowed, uint256 nextAvailable)',
    'function simulate(address target, bytes data) external returns (bytes32)',
    'function getSimulationResult(bytes32 simId) view returns (bool)'
];

const IDENTITY_ABI = [
    'function registerAgent(string name, string metadata) external',
    'function updateMetadata(string metadata) external',
    'function getProfile(address agent) view returns (tuple(string name, string metadata, uint256 createdAt, uint256 reputation, bool active))'
];

const MARKETPLACE_ABI = [
    'function createListing(string serviceName, string description, uint256 pricePerUse, uint256 pricePerMonth) external payable returns (bytes32)',
    'function purchaseService(bytes32 listingId) external payable',
    'function getAllListings() external view returns (tuple[])',
    'function getReputation(address agent) external view returns (uint256)'
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
 * Batch execute multiple transactions (gas efficient)
 */
async function batchExecute(calls, privateKey) {
    const wallet = getWallet(privateKey);
    const batch = new ethers.Contract(CONFIG.batchExecutorAddress, BATCH_ABI, wallet);
    
    const targets = calls.map(c => c.target);
    const data = calls.map(c => c.data);
    
    const tx = await batch.executeBatch(targets, data);
    await tx.wait();
    
    return { hash: tx.hash, status: 'confirmed' };
}

/**
 * Check rate limit before transacting
 */
async function checkRateLimit(agentAddress) {
    const provider = getProvider();
    const safety = new ethers.Contract(CONFIG.agentSafetyAddress, SAFETY_ABI, provider);
    
    const [allowed, nextAvailable] = await safety.checkRateLimit(agentAddress);
    return { allowed, nextAvailable };
}

/**
 * Simulate transaction without executing
 */
async function simulateTransaction(target, data, privateKey) {
    const wallet = getWallet(privateKey);
    const safety = new ethers.Contract(CONFIG.agentSafetyAddress, SAFETY_ABI, wallet);
    
    const simId = await safety.simulate.staticCall(target, data);
    return { simId };
}

/**
 * Register agent identity
 */
async function registerAgent(name, metadata, privateKey) {
    const wallet = getWallet(privateKey);
    const identity = new ethers.Contract(CONFIG.agentIdentityAddress, IDENTITY_ABI, wallet);
    
    const tx = await identity.registerAgent(name, metadata);
    await tx.wait();
    
    return { hash: tx.hash, name };
}

/**
 * Get agent profile
 */
async function getAgentProfile(agentAddress) {
    const provider = getProvider();
    const identity = new ethers.Contract(CONFIG.agentIdentityAddress, IDENTITY_ABI, provider);
    
    const profile = await identity.getProfile(agentAddress);
    return profile;
}

/**
 * Create service listing in marketplace
 */
async function createServiceListing(serviceName, description, pricePerUse, privateKey) {
    const wallet = getWallet(privateKey);
    const marketplace = new ethers.Contract(CONFIG.marketplaceAddress, MARKETPLACE_ABI, wallet);
    
    const tx = await marketplace.createListing(serviceName, description, pricePerUse, 0);
    await tx.wait();
    
    return { hash: tx.hash, serviceName };
}

/**
 * Purchase service
 */
async function purchaseService(listingId, price, privateKey) {
    const wallet = getWallet(privateKey);
    const marketplace = new ethers.Contract(CONFIG.marketplaceAddress, MARKETPLACE_ABI, wallet);
    
    const tx = await marketplace.purchaseService(listingId, { value: price });
    await tx.wait();
    
    return { hash: tx.hash };
}

/**
 * Get marketplace listings
 */
async function getMarketplaceListings() {
    const provider = getProvider();
    const marketplace = new ethers.Contract(CONFIG.marketplaceAddress, MARKETPLACE_ABI, provider);
    
    const listings = await marketplace.getAllListings();
    return listings;
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
    
    // Agent extensions
    batchExecute,
    checkRateLimit,
    simulateTransaction,
    registerAgent,
    getAgentProfile,
    createServiceListing,
    purchaseService,
    getMarketplaceListings,
    
    // Blockchain queries
    getBlock,
    getTransaction,
    
    // Node operations
    startNode,
    getNodeStatus
};
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
