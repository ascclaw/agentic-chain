// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title AgentGateway
 * @dev Smart contract for OpenClaw agent interactions
 * Allows autonomous agents to perform operations without private keys
 * Uses ERC-4337 account abstraction concepts
 */
contract AgentGateway is Ownable {
    // Agent registration
    mapping(address => bool) public authorizedAgents;
    mapping(address => uint256) public agentNonces;
    mapping(bytes32 => bool) public executedTasks;
    
    // Events for agents to subscribe to
    event AgentRegistered(address indexed agent, string metadata);
    event TaskSubmitted(bytes32 indexed taskId, address indexed agent, string action);
    event TaskCompleted(bytes32 indexed taskId, bool success);
    event BridgeRequest(bytes32 indexed taskId, address indexed agent, uint256 amount);
    
    // Whitelisted contracts
    mapping(address => bool) public whitelistedContracts;
    
    constructor() Ownable(msg.sender) {
        // Whitelist common contracts
        whitelistedContracts[address(this)] = true;
    }
    
    /**
     * @dev Register an OpenClaw agent
     */
    function registerAgent(address agent, string calldata metadata) external onlyOwner {
        authorizedAgents[agent] = true;
        emit AgentRegistered(agent, metadata);
    }
    
    /**
     * @dev Deregister an agent
     */
    function deregisterAgent(address agent) external onlyOwner {
        authorizedAgents[agent] = false;
    }
    
    /**
     * @dev Execute a task (called by authorized agent)
     */
    function executeTask(
        address target,
        bytes calldata data,
        string calldata taskDescription
    ) external returns (bytes32) {
        require(authorizedAgents[msg.sender], "Not authorized");
        require(whitelistedContracts[target], "Contract not whitelisted");
        
        // Generate unique task ID
        bytes32 taskId = keccak256(
            abi.encode(msg.sender, target, data, agentNonces[msg.sender]++)
        );
        
        emit TaskSubmitted(taskId, msg.sender, taskDescription);
        
        // Execute the call
        (bool success, ) = target.call(data);
        
        emit TaskCompleted(taskId, success);
        executedTasks[taskId] = true;
        
        return taskId;
    }
    
    /**
     * @dev Bridge tokens (simplified - would integrate with actual bridge)
     */
    function requestBridge(address token, uint256 amount) external returns (bytes32) {
        require(authorizedAgents[msg.sender], "Not authorized");
        
        bytes32 taskId = keccak256(
            abi.encode("bridge", msg.sender, token, amount, agentNonces[msg.sender]++)
        );
        
        emit BridgeRequest(taskId, msg.sender, amount);
        
        return taskId;
    }
    
    /**
     * @dev Check if task was executed
     */
    function isTaskExecuted(bytes32 taskId) external view returns (bool) {
        return executedTasks[taskId];
    }
    
    /**
     * @dev Get agent nonce
     */
    function getAgentNonce(address agent) external view returns (uint256) {
        return agentNonces[agent];
    }
    
    /**
     * @dev Whitelist a contract
     */
    function whitelistContract(address contractAddress) external onlyOwner {
        whitelistedContracts[contractAddress] = true;
    }
    
    /**
     * @dev Remove contract from whitelist
     */
    function removeWhitelist(address contractAddress) external onlyOwner {
        whitelistedContracts[contractAddress] = false;
    }
}
