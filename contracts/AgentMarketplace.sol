// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title AgentNFT
 * @dev NFT representing agent capabilities/skills
 * Agents can mint NFTs representing their capabilities
 */
contract AgentNFT is ERC721, Ownable {
    uint256 public nextTokenId;
    
    struct AgentCapability {
        string name;
        string description;
        string metadata; // IPFS
        uint256 price; // Price in AGENTIC
        bool forSale;
    }
    
    mapping(uint256 => AgentCapability) public capabilities;
    mapping(address => uint256[]) public agentCapabilities; // agent => tokenIds
    
    event CapabilityMinted(uint256 tokenId, address indexed agent, string name);
    event CapabilityListed(uint256 tokenId, uint256 price);
    event CapabilitySold(uint256 tokenId, address buyer, uint256 price);
    
    constructor() ERC721("Agent Capabilities", "AGENTCAP") Ownable(msg.sender) {}
    
    /**
     * @dev Mint a capability NFT
     */
    function mintCapability(
        string calldata name,
        string calldata description,
        string calldata metadata,
        uint256 price
    ) external returns (uint256 tokenId) {
        tokenId = nextTokenId++;
        
        _mint(msg.sender, tokenId);
        
        capabilities[tokenId] = AgentCapability({
            name: name,
            description: description,
            metadata: metadata,
            price: price,
            forSale: true
        });
        
        agentCapabilities[msg.sender].push(tokenId);
        
        emit CapabilityMinted(tokenId, msg.sender, name);
        
        return tokenId;
    }
    
    /**
     * @dev List capability for sale
     */
    function listForSale(uint256 tokenId, uint256 price) external {
        require(ownerOf(tokenId) == msg.sender, "Not owner");
        capabilities[tokenId].price = price;
        capabilities[tokenId].forSale = true;
        emit CapabilityListed(tokenId, price);
    }
    
    /**
     * @dev Buy capability
     */
    function buyCapability(uint256 tokenId) external payable {
        AgentCapability memory cap = capabilities[tokenId];
        require(cap.forSale, "Not for sale");
        require(msg.value >= cap.price, "Insufficient payment");
        
        address seller = ownerOf(tokenId);
        
        // Transfer payment to seller
        (bool success, ) = seller.call{value: msg.value}("");
        require(success, "Transfer failed");
        
        // Transfer NFT
        _transfer(seller, msg.sender, tokenId);
        
        capabilities[tokenId].forSale = false;
        
        emit CapabilitySold(tokenId, msg.sender, cap.price);
    }
    
    /**
     * @dev Get agent's capabilities
     */
    function getAgentCapabilities(address agent) external view returns (uint256[] memory) {
        return agentCapabilities[agent];
    }
}

/**
 * @title AgentMarketplace
 * @dev Marketplace for agents to trade, rent, and collaborate
 */
contract AgentMarketplace is Ownable {
    // Listing fees
    uint256 public listingFee = 0.001 ether;
    
    struct Listing {
        address owner;
        string serviceName;
        string description;
        uint256 pricePerUse;
        uint256 pricePerMonth;
        bool active;
    }
    
    mapping(bytes32 => Listing) public listings;
    bytes32[] public listingIds;
    
    // Reputation
    mapping(address => uint256) public reputation;
    mapping(bytes32 => address[]) public serviceProviders;
    
    event ListingCreated(bytes32 indexed id, address indexed owner, string serviceName);
    event ServicePurchased(bytes32 indexed id, address indexed buyer);
    event ReputationUpdated(address indexed agent, uint256 newReputation);
    
    constructor() Ownable(msg.sender) {}
    
    /**
     * @dev Create a service listing
     */
    function createListing(
        string calldata serviceName,
        string calldata description,
        uint256 pricePerUse,
        uint256 pricePerMonth
    ) external payable returns (bytes32 listingId) {
        require(msg.value >= listingFee, "Insufficient listing fee");
        
        listingId = keccak256(abi.encode(
            msg.sender,
            serviceName,
            block.timestamp
        ));
        
        listings[listingId] = Listing({
            owner: msg.sender,
            serviceName: serviceName,
            description: description,
            pricePerUse: pricePerUse,
            pricePerMonth: pricePerMonth,
            active: true
        });
        
        listingIds.push(listingId);
        
        emit ListingCreated(listingId, msg.sender, serviceName);
    }
    
    /**
     * @dev Purchase a service (one-time use)
     */
    function purchaseService(bytes32 listingId) external payable {
        Listing memory listing = listings[listingId];
        require(listing.active, "Not active");
        require(msg.value >= listing.pricePerUse, "Insufficient payment");
        
        (bool success, ) = listing.owner.call{value: msg.value}("");
        require(success, "Transfer failed");
        
        // Increase reputation
        reputation[listing.owner] += 1;
        emit ReputationUpdated(listing.owner, reputation[listing.owner]);
        
        emit ServicePurchased(listingId, msg.sender);
    }
    
    /**
     * @dev Subscribe to a service (monthly)
     */
    function subscribeService(bytes32 listingId) external payable {
        Listing memory listing = listings[listingId];
        require(listing.active, "Not active");
        require(msg.value >= listing.pricePerMonth, "Insufficient payment");
        
        (bool success, ) = listing.owner.call{value: msg.value}("");
        require(success, "Transfer failed");
        
        emit ServicePurchased(listingId, msg.sender);
    }
    
    /**
     * @dev Get all listings
     */
    function getAllListings() external view returns (Listing[] memory) {
        Listing[] memory result = new Listing[](listingIds.length);
        
        for (uint256 i = 0; i < listingIds.length; i++) {
            result[i] = listings[listingIds[i]];
        }
        
        return result;
    }
    
    /**
     * @dev Get agent reputation
     */
    function getReputation(address agent) external view returns (uint256) {
        return reputation[agent];
    }
}
