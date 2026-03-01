// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title AgentController
 * @author YieldFlow Team
 * @notice Controls AI Agent permissions and validates operations
 */

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title AgentController
 * @dev Manages AI agent authorization and operation validation
 */
contract AgentController is AccessControl, ReentrancyGuard, Pausable {
    // Roles
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant AGENT_ROLE = keccak256("AGENT_ROLE");
    bytes32 public constant GUARDIAN_ROLE = keccak256("GUARDIAN_ROLE");

    // Agent configuration
    struct AgentConfig {
        bool isActive;
        uint256 maxOperationValue;  // Max value per operation
        uint256 dailyLimit;          // Daily operation limit
        uint256 cooldownPeriod;      // Cooldown between operations
        uint256 lastOperationTime;
        uint256 dailyUsed;
        uint256 lastResetDay;
        uint256 totalOperations;
        uint256 totalValueProcessed;
    }

    // Operation types
    enum OperationType {
        DEPOSIT,
        WITHDRAW,
        REBALANCE,
        HARVEST,
        EMERGENCY_EXIT
    }

    // Operation record
    struct Operation {
        bytes32 id;
        address agent;
        OperationType opType;
        uint256 value;
        uint256 timestamp;
        bytes data;
        bool executed;
        bool success;
    }

    // Mappings
    mapping(address => AgentConfig) public agentConfigs;
    mapping(bytes32 => Operation) public operations;
    mapping(address => bytes32[]) public agentOperations;

    // Global limits
    uint256 public globalDailyLimit = 1000000 * 1e6; // 1M USDC
    uint256 public globalDailyUsed;
    uint256 public globalLastResetDay;

    // Safety parameters
    uint256 public maxGasPrice = 100 gwei;
    uint256 public minTimeBetweenOps = 1 minutes;
    uint256 public maxPendingOps = 10;

    // Events
    event AgentAuthorized(address indexed agent, uint256 maxOperationValue, uint256 dailyLimit);
    event AgentDeauthorized(address indexed agent);
    event OperationProposed(bytes32 indexed opId, address indexed agent, OperationType opType);
    event OperationExecuted(bytes32 indexed opId, bool success);
    event SafetyParametersUpdated(uint256 maxGasPrice, uint256 minTimeBetweenOps);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(GUARDIAN_ROLE, msg.sender);
    }

    /**
     * @notice Authorize an AI agent
     * @param _agent Agent address
     * @param _maxOperationValue Max value per operation
     * @param _dailyLimit Daily operation limit
     * @param _cooldownPeriod Cooldown between operations
     */
    function authorizeAgent(
        address _agent,
        uint256 _maxOperationValue,
        uint256 _dailyLimit,
        uint256 _cooldownPeriod
    ) external onlyRole(ADMIN_ROLE) {
        require(_agent != address(0), "Invalid agent address");
        require(_maxOperationValue > 0, "Invalid max operation value");
        require(_dailyLimit > 0, "Invalid daily limit");

        agentConfigs[_agent] = AgentConfig({
            isActive: true,
            maxOperationValue: _maxOperationValue,
            dailyLimit: _dailyLimit,
            cooldownPeriod: _cooldownPeriod,
            lastOperationTime: 0,
            dailyUsed: 0,
            lastResetDay: block.timestamp / 1 days,
            totalOperations: 0,
            totalValueProcessed: 0
        });

        _grantRole(AGENT_ROLE, _agent);
        emit AgentAuthorized(_agent, _maxOperationValue, _dailyLimit);
    }

    /**
     * @notice Deauthorize an agent
     */
    function deauthorizeAgent(address _agent) external onlyRole(ADMIN_ROLE) {
        agentConfigs[_agent].isActive = false;
        _revokeRole(AGENT_ROLE, _agent);
        emit AgentDeauthorized(_agent);
    }

    /**
     * @notice Propose an operation for execution
     * @param _opType Operation type
     * @param _value Value involved in operation
     * @param _data Encoded operation data
     * @return opId Operation ID
     */
    function proposeOperation(
        OperationType _opType,
        uint256 _value,
        bytes calldata _data
    ) external onlyRole(AGENT_ROLE) nonReentrant whenNotPaused returns (bytes32) {
        AgentConfig storage config = agentConfigs[msg.sender];
        require(config.isActive, "Agent not active");

        // Reset daily counters if new day
        uint256 currentDay = block.timestamp / 1 days;
        if (currentDay > config.lastResetDay) {
            config.dailyUsed = 0;
            config.lastResetDay = currentDay;
        }
        if (currentDay > globalLastResetDay) {
            globalDailyUsed = 0;
            globalLastResetDay = currentDay;
        }

        // Validate operation
        _validateOperation(msg.sender, _value);

        // Generate operation ID
        bytes32 opId = keccak256(abi.encodePacked(
            msg.sender,
            _opType,
            _value,
            block.timestamp,
            config.totalOperations
        ));

        // Create operation record
        operations[opId] = Operation({
            id: opId,
            agent: msg.sender,
            opType: _opType,
            value: _value,
            timestamp: block.timestamp,
            data: _data,
            executed: false,
            success: false
        });

        agentOperations[msg.sender].push(opId);

        // Update agent state
        config.lastOperationTime = block.timestamp;
        config.dailyUsed += _value;
        config.totalOperations++;

        // Update global state
        globalDailyUsed += _value;

        emit OperationProposed(opId, msg.sender, _opType);

        return opId;
    }

    /**
     * @notice Execute a proposed operation
     * @param _opId Operation ID
     * @param _target Target contract
     * @param _callData Function call data
     */
    function executeOperation(
        bytes32 _opId,
        address _target,
        bytes calldata _callData
    ) external onlyRole(AGENT_ROLE) nonReentrant whenNotPaused returns (bool) {
        Operation storage op = operations[_opId];
        require(op.id == _opId, "Operation not found");
        require(!op.executed, "Already executed");
        require(op.agent == msg.sender, "Not operation owner");

        op.executed = true;

        // Execute the operation
        (bool success, ) = _target.call(_callData);
        op.success = success;

        // Update agent stats
        if (success) {
            agentConfigs[msg.sender].totalValueProcessed += op.value;
        }

        emit OperationExecuted(_opId, success);
        return success;
    }

    /**
     * @notice Validate operation parameters
     */
    function _validateOperation(
        address _agent,
        uint256 _value
    ) internal view {
        AgentConfig storage config = agentConfigs[_agent];

        // Check operation value limit
        require(
            _value <= config.maxOperationValue,
            "Operation value exceeds limit"
        );

        // Check daily limit
        require(
            config.dailyUsed + _value <= config.dailyLimit,
            "Daily limit exceeded"
        );

        // Check global daily limit
        require(
            globalDailyUsed + _value <= globalDailyLimit,
            "Global daily limit exceeded"
        );

        // Check cooldown
        require(
            block.timestamp >= config.lastOperationTime + config.cooldownPeriod,
            "Cooldown not elapsed"
        );

        // Check pending operations count
        uint256 pendingCount;
        bytes32[] storage agentOps = agentOperations[_agent];
        for (uint256 i = 0; i < agentOps.length && pendingCount < maxPendingOps + 1; i++) {
            if (!operations[agentOps[i]].executed) {
                pendingCount++;
            }
        }
        require(pendingCount < maxPendingOps, "Too many pending operations");
    }

    /**
     * @notice Update safety parameters
     */
    function updateSafetyParameters(
        uint256 _maxGasPrice,
        uint256 _minTimeBetweenOps,
        uint256 _maxPendingOps
    ) external onlyRole(ADMIN_ROLE) {
        maxGasPrice = _maxGasPrice;
        minTimeBetweenOps = _minTimeBetweenOps;
        maxPendingOps = _maxPendingOps;
        emit SafetyParametersUpdated(_maxGasPrice, _minTimeBetweenOps);
    }

    /**
     * @notice Update global daily limit
     */
    function updateGlobalDailyLimit(uint256 _limit) external onlyRole(ADMIN_ROLE) {
        globalDailyLimit = _limit;
    }

    /**
     * @notice Check if agent can perform operation
     */
    function canOperate(address _agent, uint256 _value) external view returns (bool, string memory) {
        AgentConfig storage config = agentConfigs[_agent];

        if (!config.isActive) {
            return (false, "Agent not active");
        }
        if (_value > config.maxOperationValue) {
            return (false, "Value exceeds limit");
        }

        uint256 currentDay = block.timestamp / 1 days;
        uint256 dailyUsed = config.dailyUsed;
        if (currentDay > config.lastResetDay) {
            dailyUsed = 0;
        }
        if (dailyUsed + _value > config.dailyLimit) {
            return (false, "Daily limit exceeded");
        }

        if (block.timestamp < config.lastOperationTime + config.cooldownPeriod) {
            return (false, "Cooldown not elapsed");
        }

        return (true, "");
    }

    /**
     * @notice Get agent statistics
     */
    function getAgentStats(address _agent) external view returns (
        bool isActive,
        uint256 totalOperations,
        uint256 totalValueProcessed,
        uint256 dailyUsed,
        uint256 dailyRemaining
    ) {
        AgentConfig storage config = agentConfigs[_agent];
        
        uint256 currentDay = block.timestamp / 1 days;
        uint256 used = config.dailyUsed;
        if (currentDay > config.lastResetDay) {
            used = 0;
        }

        return (
            config.isActive,
            config.totalOperations,
            config.totalValueProcessed,
            used,
            config.dailyLimit - used
        );
    }

    /**
     * @notice Get operation details
     */
    function getOperation(bytes32 _opId) external view returns (Operation memory) {
        return operations[_opId];
    }

    /**
     * @notice Emergency pause
     */
    function pause() external onlyRole(GUARDIAN_ROLE) {
        _pause();
    }

    /**
     * @notice Unpause
     */
    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }
}
