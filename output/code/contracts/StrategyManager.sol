// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title StrategyManager
 * @author YieldFlow Team
 * @notice Manages multiple yield strategies and their allocations
 */

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title StrategyManager
 * @dev Manages yield strategies with risk-aware allocation
 */
contract StrategyManager is AccessControl, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // Roles
    bytes32 public constant AGENT_ROLE = keccak256("AGENT_ROLE");
    bytes32 public constant RISK_MANAGER_ROLE = keccak256("RISK_MANAGER_ROLE");

    // Strategy info
    struct Strategy {
        address strategyAddress;
        string name;
        uint256 allocation; // Basis points
        uint256 riskScore; // 0-100
        uint256 lastHarvest;
        uint256 totalInvested;
        uint256 totalYield;
        bool active;
    }

    // Asset info
    struct AssetConfig {
        address assetAddress;
        uint256 maxAllocation;
        uint256 minInvestment;
        bool enabled;
    }

    // Mappings
    mapping(bytes32 => Strategy) public strategies;
    mapping(address => bytes32[]) public assetStrategies;
    mapping(address => AssetConfig) public assetConfigs;
    
    bytes32[] public strategyIds;
    address[] public supportedAssets;

    // Risk parameters
    uint256 public maxRiskScore = 70; // Max acceptable risk score
    uint256 public rebalanceThreshold = 500; // 5% deviation triggers rebalance
    uint256 public emergencyThreshold = 90; // Emergency if risk exceeds this

    // Events
    event StrategyRegistered(bytes32 indexed id, address strategy, string name);
    event StrategyDeactivated(bytes32 indexed id);
    event AllocationUpdated(bytes32 indexed id, uint256 newAllocation);
    event RiskParametersUpdated(uint256 maxRisk, uint256 rebalanceThreshold);
    event RebalanceExecuted(bytes32[] strategyIds, uint256[] allocations);
    event YieldHarvested(bytes32 indexed strategyId, uint256 amount);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(RISK_MANAGER_ROLE, msg.sender);
    }

    /**
     * @notice Register a new strategy
     * @param _id Unique strategy identifier
     * @param _strategy Strategy contract address
     * @param _name Strategy name
     * @param _initialAllocation Initial allocation in basis points
     * @param _riskScore Initial risk assessment (0-100)
     */
    function registerStrategy(
        bytes32 _id,
        address _strategy,
        string calldata _name,
        uint256 _initialAllocation,
        uint256 _riskScore
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_strategy != address(0), "Invalid strategy address");
        require(strategies[_id].strategyAddress == address(0), "Strategy exists");
        require(_riskScore <= 100, "Invalid risk score");
        require(_initialAllocation <= 10000, "Invalid allocation");

        strategies[_id] = Strategy({
            strategyAddress: _strategy,
            name: _name,
            allocation: _initialAllocation,
            riskScore: _riskScore,
            lastHarvest: 0,
            totalInvested: 0,
            totalYield: 0,
            active: true
        });

        strategyIds.push(_id);
        emit StrategyRegistered(_id, _strategy, _name);
    }

    /**
     * @notice Update strategy allocation
     * @dev Only callable by AGENT_ROLE (AI Agent)
     */
    function updateAllocation(
        bytes32 _id,
        uint256 _newAllocation
    ) external onlyRole(AGENT_ROLE) whenNotPaused {
        require(strategies[_id].active, "Strategy not active");
        require(_newAllocation <= 10000, "Invalid allocation");

        // Check risk score
        require(
            strategies[_id].riskScore <= maxRiskScore,
            "Risk score too high"
        );

        strategies[_id].allocation = _newAllocation;
        emit AllocationUpdated(_id, _newAllocation);
    }

    /**
     * @notice Update risk score for a strategy
     * @dev Only callable by RISK_MANAGER_ROLE
     */
    function updateRiskScore(
        bytes32 _id,
        uint256 _newRiskScore
    ) external onlyRole(RISK_MANAGER_ROLE) {
        require(strategies[_id].strategyAddress != address(0), "Strategy not found");
        require(_newRiskScore <= 100, "Invalid risk score");

        strategies[_id].riskScore = _newRiskScore;

        // Auto-deactivate if risk too high
        if (_newRiskScore > emergencyThreshold) {
            strategies[_id].active = false;
            emit StrategyDeactivated(_id);
        }
    }

    /**
     * @notice Execute rebalance across strategies
     * @dev Only callable by AGENT_ROLE
     * @param _strategyIds Array of strategy IDs to rebalance
     * @param _allocations New allocations for each strategy
     */
    function executeRebalance(
        bytes32[] calldata _strategyIds,
        uint256[] calldata _allocations
    ) external onlyRole(AGENT_ROLE) nonReentrant whenNotPaused {
        require(_strategyIds.length == _allocations.length, "Length mismatch");

        uint256 totalAllocation;
        for (uint256 i = 0; i < _strategyIds.length; i++) {
            bytes32 id = _strategyIds[i];
            require(strategies[id].active, "Strategy not active");
            require(
                strategies[id].riskScore <= maxRiskScore,
                "Risk exceeds limit"
            );
            
            strategies[id].allocation = _allocations[i];
            totalAllocation += _allocations[i];
        }

        require(totalAllocation <= 10000, "Allocation exceeds 100%");

        emit RebalanceExecuted(_strategyIds, _allocations);
    }

    /**
     * @notice Record yield harvest
     */
    function recordHarvest(
        bytes32 _id,
        uint256 _yieldAmount
    ) external onlyRole(AGENT_ROLE) {
        require(strategies[_id].active, "Strategy not active");

        strategies[_id].totalYield += _yieldAmount;
        strategies[_id].lastHarvest = block.timestamp;

        emit YieldHarvested(_id, _yieldAmount);
    }

    /**
     * @notice Deactivate a strategy
     */
    function deactivateStrategy(
        bytes32 _id
    ) external onlyRole(RISK_MANAGER_ROLE) {
        strategies[_id].active = false;
        strategies[_id].allocation = 0;
        emit StrategyDeactivated(_id);
    }

    /**
     * @notice Reactivate a strategy
     */
    function reactivateStrategy(
        bytes32 _id
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(
            strategies[_id].riskScore <= maxRiskScore,
            "Risk too high to reactivate"
        );
        strategies[_id].active = true;
    }

    /**
     * @notice Update risk parameters
     */
    function updateRiskParameters(
        uint256 _maxRiskScore,
        uint256 _rebalanceThreshold,
        uint256 _emergencyThreshold
    ) external onlyRole(RISK_MANAGER_ROLE) {
        require(_maxRiskScore <= 100, "Invalid max risk");
        require(_rebalanceThreshold <= 10000, "Invalid threshold");
        require(_emergencyThreshold <= 100, "Invalid emergency threshold");

        maxRiskScore = _maxRiskScore;
        rebalanceThreshold = _rebalanceThreshold;
        emergencyThreshold = _emergencyThreshold;

        emit RiskParametersUpdated(_maxRiskScore, _rebalanceThreshold);
    }

    /**
     * @notice Get all active strategies
     */
    function getActiveStrategies() external view returns (
        bytes32[] memory ids,
        address[] memory addresses,
        uint256[] memory allocations,
        uint256[] memory riskScores
    ) {
        uint256 activeCount;
        for (uint256 i = 0; i < strategyIds.length; i++) {
            if (strategies[strategyIds[i]].active) {
                activeCount++;
            }
        }

        ids = new bytes32[](activeCount);
        addresses = new address[](activeCount);
        allocations = new uint256[](activeCount);
        riskScores = new uint256[](activeCount);

        uint256 index;
        for (uint256 i = 0; i < strategyIds.length; i++) {
            Strategy storage s = strategies[strategyIds[i]];
            if (s.active) {
                ids[index] = strategyIds[i];
                addresses[index] = s.strategyAddress;
                allocations[index] = s.allocation;
                riskScores[index] = s.riskScore;
                index++;
            }
        }
    }

    /**
     * @notice Get strategy details
     */
    function getStrategy(bytes32 _id) external view returns (Strategy memory) {
        return strategies[_id];
    }

    /**
     * @notice Check if rebalance is needed
     */
    function needsRebalance() external view returns (bool) {
        // Check if any strategy allocation deviates beyond threshold
        for (uint256 i = 0; i < strategyIds.length; i++) {
            Strategy storage s = strategies[strategyIds[i]];
            if (s.active) {
                // This would compare current vs target allocation
                // Implementation depends on actual protocol integration
            }
        }
        return false;
    }

    /**
     * @notice Get total risk-weighted allocation
     */
    function getRiskWeightedAllocation() external view returns (uint256) {
        uint256 totalRiskWeighted;
        uint256 totalAllocation;

        for (uint256 i = 0; i < strategyIds.length; i++) {
            Strategy storage s = strategies[strategyIds[i]];
            if (s.active) {
                totalRiskWeighted += s.allocation * s.riskScore;
                totalAllocation += s.allocation;
            }
        }

        if (totalAllocation == 0) return 0;
        return totalRiskWeighted / totalAllocation;
    }

    // Pause functions
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }
}
