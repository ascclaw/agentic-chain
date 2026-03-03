// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title BatchExecutor
 * @dev EVM extension for efficient batch transactions
 * Optimized for AI agents that need to execute multiple operations
 */
contract BatchExecutor {
    error BatchFailed(uint256 index, bytes reason);
    
    /**
     * @dev Execute multiple calls in a single transaction
     * Gas efficient: no delegatecalls, direct calls
     */
    function executeBatch(
        address[] calldata targets,
        bytes[] calldata data
    ) external payable returns (bytes[] memory results) {
        require(targets.length == data.length, "Length mismatch");
        require(targets.length <= 50, "Max 50 calls"); // Rate limit for safety
        
        results = new bytes[](targets.length);
        
        for (uint256 i = 0; i < targets.length; i++) {
            (bool success, bytes memory result) = targets[i].call(data[i]);
            
            if (!success) {
                revert BatchFailed(i, result);
            }
            
            results[i] = result;
        }
        
        return results;
    }
    
    /**
     * @dev Execute calls with value (ETH transfers)
     */
    function executeBatchWithValue(
        address[] calldata targets,
        bytes[] calldata data,
        uint256[] calldata values
    ) external payable returns (bytes[] memory results) {
        require(targets.length == data.length, "Length mismatch");
        require(targets.length == values.length, "Values length mismatch");
        require(targets.length <= 50, "Max 50 calls");
        
        results = new bytes[](targets.length);
        
        uint256 totalValue = 0;
        for (uint256 i = 0; i < values.length; i++) {
            totalValue += values[i];
        }
        require(msg.value >= totalValue, "Insufficient ETH");
        
        for (uint256 i = 0; i < targets.length; i++) {
            (bool success, bytes memory result) = targets[i].call{value: values[i]}(data[i]);
            
            if (!success) {
                revert BatchFailed(i, result);
            }
            
            results[i] = result;
        }
        
        return results;
    }
}

/**
 * @title AgentSafety
 * @dev Wisdom layer for AI agents - rate limits, simulations, safety
 */
contract AgentSafety {
    // Rate limiting
    mapping(address => uint256) public lastTxTime;
    mapping(address => uint256) public txCount;
    uint256 public rateLimitPeriod = 60 seconds;
    uint256 public maxTxPerPeriod = 100;
    
    // Simulation results (for testing without gas burn)
    mapping(bytes32 => bool) public simulatedResults;
    
    // Events
    event RateLimited(address indexed agent, uint256 nextAvailable);
    event SimulationRequested(bytes32 indexed simId, address indexed agent);
    event SimulationResult(bytes32 indexed simId, bool success);
    
    /**
     * @dev Check if agent can transact
     */
    function checkRateLimit(address agent) external view returns (bool allowed, uint256 nextAvailable) {
        uint256 timeSinceLastTx = block.timestamp - lastTxTime[agent];
        
        if (timeSinceLastTx >= rateLimitPeriod) {
            return (true, 0);
        }
        
        if (txCount[agent] < maxTxPerPeriod) {
            return (true, 0);
        }
        
        return (false, lastTxTime[agent] + rateLimitPeriod);
    }
    
    /**
     * @dev Record transaction (should be called before any agent tx)
     */
    function recordTransaction(address agent) external {
        if (block.timestamp - lastTxTime[agent] >= rateLimitPeriod) {
            txCount[agent] = 0;
            lastTxTime[agent] = block.timestamp;
        }
        
        txCount[agent]++;
        
        if (txCount[agent] > maxTxPerPeriod) {
            emit RateLimited(agent, lastTxTime[agent] + rateLimitPeriod);
            revert("Rate limited");
        }
    }
    
    /**
     * @dev Simulate transaction without executing
     */
    function simulate(
        address target,
        bytes calldata data
    ) external returns (bytes32 simId) {
        simId = keccak256(abi.encode(target, data, block.timestamp));
        
        (bool success, ) = target.staticcall(data);
        
        simulatedResults[simId] = success;
        emit SimulationResult(simId, success);
        
        return simId;
    }
    
    /**
     * @dev Get simulation result
     */
    function getSimulationResult(bytes32 simId) external view returns (bool) {
        return simulatedResults[simId];
    }
}

/**
 * @title AgentIdentity
 * @dev Native agent identity using ERC-7231 concepts
 */
contract AgentIdentity {
    struct AgentProfile {
        string name;
        string metadata; // IPFS hash
        uint256 createdAt;
        uint256 reputation;
        bool active;
    }
    
    mapping(address => AgentProfile) public agents;
    mapping(address => bool) public registered;
    
    event AgentRegistered(address indexed agent, string name);
    event AgentUpdated(address indexed agent, string metadata);
    
    /**
     * @dev Register an agent identity
     */
    function registerAgent(string calldata name, string calldata metadata) external {
        require(!registered[msg.sender], "Already registered");
        
        agents[msg.sender] = AgentProfile({
            name: name,
            metadata: metadata,
            createdAt: block.timestamp,
            reputation: 100, // Start with good reputation
            active: true
        });
        
        registered[msg.sender] = true;
        emit AgentRegistered(msg.sender, name);
    }
    
    /**
     * @dev Update agent metadata
     */
    function updateMetadata(string calldata metadata) external {
        require(registered[msg.sender], "Not registered");
        agents[msg.sender].metadata = metadata;
        emit AgentUpdated(msg.sender, metadata);
    }
    
    /**
     * @dev Get agent profile
     */
    function getProfile(address agent) external view returns (AgentProfile memory) {
        return agents[agent];
    }
    
    /**
     * @dev Update reputation (called by other contracts)
     */
    function updateReputation(address agent, int256 delta) external {
        require(registered[agent], "Not registered");
        
        if (delta > 0) {
            agents[agent].reputation += uint256(delta);
        } else {
            if (agents[agent].reputation > uint256(-delta)) {
                agents[agent].reputation -= uint256(-delta);
            } else {
                agents[agent].reputation = 0;
            }
        }
    }
}
