// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title RebelAgentContract
 * @dev Rebel AI Hackathon - AI Agent智能合约模板
 * @notice 这是一个基础的Agent智能合约模板，可根据具体需求扩展
 */

contract RebelAgentContract {
    // ============ 状态变量 ============
    
    address public owner;
    string public agentName;
    string public agentRole;
    
    // 授权的Agent地址映射
    mapping(address => bool) public authorizedAgents;
    
    // Agent执行记录
    struct ActionRecord {
        address agent;
        string action;
        bytes data;
        uint256 timestamp;
        bool success;
    }
    
    ActionRecord[] public actionHistory;
    
    // ============ 事件 ============
    
    event AgentRegistered(address indexed agent, string role);
    event AgentRemoved(address indexed agent);
    event AgentActionExecuted(
        address indexed agent, 
        string action, 
        bytes data,
        uint256 timestamp,
        bool success
    );
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    
    // ============ 修饰器 ============
    
    modifier onlyOwner() {
        require(msg.sender == owner, "RebelAgent: Not owner");
        _;
    }
    
    modifier onlyAuthorized() {
        require(
            authorizedAgents[msg.sender] || msg.sender == owner, 
            "RebelAgent: Not authorized"
        );
        _;
    }
    
    // ============ 构造函数 ============
    
    constructor(string memory _name, string memory _role) {
        owner = msg.sender;
        agentName = _name;
        agentRole = _role;
    }
    
    // ============ 管理函数 ============
    
    /**
     * @dev 注册新的Agent
     * @param agent Agent地址
     * @param role Agent角色描述
     */
    function registerAgent(address agent, string calldata role) external onlyOwner {
        require(agent != address(0), "RebelAgent: Invalid address");
        authorizedAgents[agent] = true;
        emit AgentRegistered(agent, role);
    }
    
    /**
     * @dev 移除Agent授权
     * @param agent Agent地址
     */
    function removeAgent(address agent) external onlyOwner {
        authorizedAgents[agent] = false;
        emit AgentRemoved(agent);
    }
    
    /**
     * @dev 转移合约所有权
     * @param newOwner 新所有者地址
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "RebelAgent: Invalid address");
        address oldOwner = owner;
        owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
    
    // ============ Agent动作函数 ============
    
    /**
     * @dev 执行Agent动作
     * @param action 动作名称
     * @param data 动作数据
     * @return success 是否执行成功
     */
    function executeAction(
        string calldata action, 
        bytes calldata data
    ) external onlyAuthorized returns (bool success) {
        // 这里实现具体的动作逻辑
        // 子合约可以重写此函数
        
        success = _processAction(action, data);
        
        // 记录动作
        actionHistory.push(ActionRecord({
            agent: msg.sender,
            action: action,
            data: data,
            timestamp: block.timestamp,
            success: success
        }));
        
        emit AgentActionExecuted(
            msg.sender, 
            action, 
            data, 
            block.timestamp, 
            success
        );
        
        return success;
    }
    
    /**
     * @dev 内部动作处理函数，子合约可重写
     */
    function _processAction(
        string calldata action, 
        bytes calldata data
    ) internal virtual returns (bool) {
        // 基础实现，子合约应重写此函数
        // 根据action类型执行不同逻辑
        
        bytes32 actionHash = keccak256(abi.encodePacked(action));
        
        if (actionHash == keccak256("ping")) {
            return true;
        }
        
        // 其他动作处理...
        
        return true;
    }
    
    // ============ 查询函数 ============
    
    /**
     * @dev 获取动作历史记录数量
     */
    function getActionHistoryCount() external view returns (uint256) {
        return actionHistory.length;
    }
    
    /**
     * @dev 获取指定范围的Action记录
     */
    function getActionHistory(
        uint256 start, 
        uint256 limit
    ) external view returns (ActionRecord[] memory) {
        require(start < actionHistory.length, "RebelAgent: Start out of bounds");
        
        uint256 end = start + limit;
        if (end > actionHistory.length) {
            end = actionHistory.length;
        }
        
        ActionRecord[] memory records = new ActionRecord[](end - start);
        for (uint256 i = start; i < end; i++) {
            records[i - start] = actionHistory[i];
        }
        
        return records;
    }
    
    /**
     * @dev 检查地址是否已授权
     */
    function isAuthorized(address agent) external view returns (bool) {
        return authorizedAgents[agent] || agent == owner;
    }
}

/**
 * @title PaymentAgent
 * @dev 支付Agent示例合约
 */
contract PaymentAgent is RebelAgentContract {
    
    // 支付记录
    struct Payment {
        address from;
        address to;
        uint256 amount;
        string description;
        uint256 timestamp;
    }
    
    Payment[] public payments;
    mapping(address => uint256) public balances;
    
    event PaymentExecuted(
        address indexed from,
        address indexed to,
        uint256 amount,
        string description
    );
    event Deposit(address indexed user, uint256 amount);
    event Withdrawal(address indexed user, uint256 amount);
    
    constructor() RebelAgentContract("PaymentAgent", "payment") {}
    
    /**
     * @dev 存款
     */
    function deposit() external payable {
        balances[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value);
    }
    
    /**
     * @dev 提款
     */
    function withdraw(uint256 amount) external {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        balances[msg.sender] -= amount;
        payable(msg.sender).transfer(amount);
        emit Withdrawal(msg.sender, amount);
    }
    
    /**
     * @dev 重写动作处理函数
     */
    function _processAction(
        string calldata action, 
        bytes calldata data
    ) internal override returns (bool) {
        bytes32 actionHash = keccak256(abi.encodePacked(action));
        
        if (actionHash == keccak256("payment")) {
            // 解码支付数据
            (address to, uint256 amount, string memory description) = abi.decode(
                data, 
                (address, uint256, string)
            );
            return _executePayment(to, amount, description);
        }
        
        return super._processAction(action, data);
    }
    
    /**
     * @dev 执行支付
     */
    function _executePayment(
        address to, 
        uint256 amount, 
        string memory description
    ) internal returns (bool) {
        require(to != address(0), "Invalid recipient");
        require(amount > 0, "Invalid amount");
        require(balances[address(this)] >= amount, "Insufficient contract balance");
        
        balances[address(this)] -= amount;
        balances[to] += amount;
        
        payments.push(Payment({
            from: address(this),
            to: to,
            amount: amount,
            description: description,
            timestamp: block.timestamp
        }));
        
        emit PaymentExecuted(address(this), to, amount, description);
        return true;
    }
    
    /**
     * @dev 获取合约余额
     */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
}

/**
 * @title PredictionMarketAgent
 * @dev 预测市场Agent示例合约
 */
contract PredictionMarketAgent is RebelAgentContract {
    
    struct Market {
        string question;
        uint256 endTime;
        bool resolved;
        bool outcome;
        uint256 yesShares;
        uint256 noShares;
        mapping(address => uint256) yesBalances;
        mapping(address => uint256) noBalances;
    }
    
    Market[] public markets;
    
    event MarketCreated(uint256 indexed marketId, string question, uint256 endTime);
    event SharesPurchased(uint256 indexed marketId, address indexed buyer, bool isYes, uint256 amount);
    event MarketResolved(uint256 indexed marketId, bool outcome);
    
    constructor() RebelAgentContract("PredictionMarketAgent", "prediction") {}
    
    /**
     * @dev 创建预测市场
     */
    function createMarket(string calldata question, uint256 duration) external onlyOwner {
        uint256 marketId = markets.length;
        Market storage market = markets.push();
        market.question = question;
        market.endTime = block.timestamp + duration;
        market.resolved = false;
        
        emit MarketCreated(marketId, question, market.endTime);
    }
    
    /**
     * @dev 购买份额
     */
    function buyShares(
        uint256 marketId, 
        bool isYes, 
        uint256 amount
    ) external payable {
        require(marketId < markets.length, "Invalid market");
        Market storage market = markets[marketId];
        require(block.timestamp < market.endTime, "Market ended");
        require(!market.resolved, "Market resolved");
        require(msg.value >= amount, "Insufficient payment");
        
        if (isYes) {
            market.yesBalances[msg.sender] += amount;
            market.yesShares += amount;
        } else {
            market.noBalances[msg.sender] += amount;
            market.noShares += amount;
        }
        
        emit SharesPurchased(marketId, msg.sender, isYes, amount);
    }
    
    /**
     * @dev 解决市场
     */
    function resolveMarket(uint256 marketId, bool outcome) external onlyOwner {
        require(marketId < markets.length, "Invalid market");
        Market storage market = markets[marketId];
        require(block.timestamp >= market.endTime, "Market not ended");
        require(!market.resolved, "Already resolved");
        
        market.resolved = true;
        market.outcome = outcome;
        
        emit MarketResolved(marketId, outcome);
    }
    
    /**
     * @dev 获取市场信息
     */
    function getMarketInfo(uint256 marketId) external view returns (
        string memory question,
        uint256 endTime,
        bool resolved,
        bool outcome,
        uint256 yesShares,
        uint256 noShares
    ) {
        require(marketId < markets.length, "Invalid market");
        Market storage market = markets[marketId];
        return (
            market.question,
            market.endTime,
            market.resolved,
            market.outcome,
            market.yesShares,
            market.noShares
        );
    }
}