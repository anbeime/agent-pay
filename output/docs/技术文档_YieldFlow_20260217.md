# YieldFlow 技术文档

## 目录
1. [系统概述](#1-系统概述)
2. [智能合约架构](#2-智能合约架构)
3. [AI Agent设计](#3-ai-agent设计)
4. [API接口文档](#4-api接口文档)
5. [部署指南](#5-部署指南)
6. [安全考虑](#6-安全考虑)

---

## 1. 系统概述

### 1.1 项目简介

YieldFlow是一个基于Monad区块链的AI驱动收益优化平台，通过智能Agent自动管理用户的DeFi投资组合，实现最优收益与风险平衡。

### 1.2 核心特性

- **AI驱动决策**: 使用LangChain + LLM实现智能投资决策
- **多协议集成**: 支持Aave、Compound、Uniswap、Curve等主流协议
- **风险评估**: 实时风险监控与预警
- **自动化执行**: Gas优化策略执行
- **透明可解释**: Agent决策过程完全透明

### 1.3 技术栈

| 层级 | 技术 | 版本 |
|------|------|------|
| 区块链 | Monad | Testnet |
| 智能合约 | Solidity | ^0.8.19 |
| 合约框架 | Hardhat | ^2.19.0 |
| Agent框架 | LangChain | ^0.1.0 |
| LLM | Zhipu GLM-4 | Latest |
| 前端 | React + wagmi | ^18.2.0 |

---

## 2. 智能合约架构

### 2.1 核心合约

#### 2.1.1 YieldVault

主要的资金托管合约，实现ERC4626标准。

**核心功能**:
- 用户资金存取
- Share Token铸造/销毁
- 收益分配
- 紧急退出

**主要接口**:

```solidity
// 存款
function deposit(uint256 assets, address receiver) external returns (uint256 shares)

// 取款
function withdraw(uint256 assets, address receiver, address owner) external returns (uint256 shares)

// 查询总资产
function totalAssets() external view returns (uint256)

// 转换Share到Asset
function convertToAssets(uint256 shares) external view returns (uint256)

// 投资闲置资金
function investIdleFunds() external onlyRole(AGENT_ROLE)

// 再平衡
function rebalance(address[] calldata strategies, uint256[] calldata allocations) 
    external onlyRole(AGENT_ROLE)

// 收割收益
function harvest() external onlyRole(AGENT_ROLE) returns (uint256 totalYield)
```

#### 2.1.2 StrategyManager

管理多个收益策略及其配置。

**核心功能**:
- 策略注册/注销
- 配置比例管理
- 风险评分跟踪
- 再平衡执行

**主要接口**:

```solidity
// 注册策略
function registerStrategy(
    bytes32 _id,
    address _strategy,
    string calldata _name,
    uint256 _initialAllocation,
    uint256 _riskScore
) external onlyRole(DEFAULT_ADMIN_ROLE)

// 更新配置
function updateAllocation(bytes32 _id, uint256 _newAllocation) 
    external onlyRole(AGENT_ROLE)

// 执行再平衡
function executeRebalance(
    bytes32[] calldata _strategyIds,
    uint256[] calldata _allocations
) external onlyRole(AGENT_ROLE)

// 获取活跃策略
function getActiveStrategies() external view returns (
    bytes32[] memory ids,
    address[] memory addresses,
    uint256[] memory allocations,
    uint256[] memory riskScores
)
```

#### 2.1.3 AgentController

控制AI Agent的权限和操作验证。

**核心功能**:
- Agent授权/注销
- 操作验证
- 限额管理
- 冷却期控制

**主要接口**:

```solidity
// 授权Agent
function authorizeAgent(
    address _agent,
    uint256 _maxOperationValue,
    uint256 _dailyLimit,
    uint256 _cooldownPeriod
) external onlyRole(ADMIN_ROLE)

// 提议操作
function proposeOperation(
    OperationType _opType,
    uint256 _value,
    bytes calldata _data
) external onlyRole(AGENT_ROLE) returns (bytes32)

// 执行操作
function executeOperation(
    bytes32 _opId,
    address _target,
    bytes calldata _callData
) external onlyRole(AGENT_ROLE) returns (bool)

// 检查操作权限
function canOperate(address _agent, uint256 _value) 
    external view returns (bool, string memory)
```

### 2.2 合约交互流程

```
用户存款流程:
1. 用户调用 YieldVault.deposit(assets, receiver)
2. YieldVault 铸造 Share Token 给用户
3. AI Agent 调用 investIdleFunds()
4. 资金分配到各策略

再平衡流程:
1. AI Agent 分析市场数据
2. 调用 StrategyManager.executeRebalance()
3. StrategyManager 更新配置
4. YieldVault 执行资金调度
```

---

## 3. AI Agent设计

### 3.1 Agent架构

YieldFlow采用多Agent协作架构：

```
┌─────────────────────────────────────────┐
│           YieldFlowOrchestrator         │
├─────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐    │
│  │DataCollector │  │  Analysis    │    │
│  │    Agent     │  │    Agent     │    │
│  └──────────────┘  └──────────────┘    │
│  ┌──────────────┐  ┌──────────────┐    │
│  │  Decision    │  │  Execution   │    │
│  │    Agent     │  │    Agent     │    │
│  └──────────────┘  └──────────────┘    │
│  ┌──────────────────────────────────┐  │
│  │         Monitor Agent            │  │
│  └──────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

### 3.2 Agent职责

#### DataCollectorAgent
- 收集协议数据（TVL、APY、风险评分）
- 获取市场价格数据
- 监控链上事件
- 更新市场情绪指标

#### AnalysisAgent
- 分析协议风险
- 计算风险调整收益
- 预测趋势
- 生成投资建议

#### DecisionAgent
- 制定配置方案
- 平衡风险与收益
- 考虑用户偏好
- 触发再平衡决策

#### ExecutionAgent
- 构建交易
- 优化Gas成本
- 执行链上操作
- 处理执行结果

#### MonitorAgent
- 持续监控持仓
- 检测异常情况
- 生成预警
- 追踪收益表现

### 3.3 决策流程

```python
async def run_optimization_cycle(user_preference, total_assets):
    # 1. 收集数据
    protocols = await data_collector.fetch_all_protocols()
    market_sentiment = await data_collector.get_market_sentiment()
    
    # 2. 分析协议
    analyses = await analysis_agent.compare_protocols(protocols, market_sentiment)
    
    # 3. 制定配置
    allocations = await decision_agent.make_allocation_decision(
        analyses, user_preference, total_assets
    )
    
    # 4. 执行
    result = await execution_agent.execute_allocation(allocations, vault_address)
    
    # 5. 监控
    monitor_agent.add_positions(allocations)
    
    return result
```

---

## 4. API接口文档

### 4.1 智能合约ABI

#### YieldVault ABI (部分)

```json
[
  {
    "inputs": [
      {"name": "assets", "type": "uint256"},
      {"name": "receiver", "type": "address"}
    ],
    "name": "deposit",
    "outputs": [{"name": "shares", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "assets", "type": "uint256"},
      {"name": "receiver", "type": "address"},
      {"name": "owner", "type": "address"}
    ],
    "name": "withdraw",
    "outputs": [{"name": "shares", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  }
]
```

### 4.2 前端API (wagmi hooks)

```javascript
// 存款
const { write: deposit } = useContractWrite({
  address: VAULT_ADDRESS,
  abi: yieldVaultABI,
  functionName: 'deposit',
});

// 查询余额
const { data: balance } = useContractRead({
  address: VAULT_ADDRESS,
  abi: yieldVaultABI,
  functionName: 'balanceOf',
  args: [userAddress],
});

// 查询总资产
const { data: totalAssets } = useContractRead({
  address: VAULT_ADDRESS,
  abi: yieldVaultABI,
  functionName: 'totalAssets',
});
```

### 4.3 事件日志

```solidity
// 存款事件
event Deposit(address indexed sender, address indexed owner, uint256 assets, uint256 shares);

// 取款事件
event Withdraw(address indexed sender, address indexed receiver, address indexed owner, uint256 assets, uint256 shares);

// 再平衡事件
event Rebalanced(address[] strategies, uint256[] allocations);

// 收割事件
event Harvested(uint256 totalYield, uint256 fee);
```

---

## 5. 部署指南

### 5.1 环境准备

```bash
# 安装依赖
npm install

# 安装Hardhat
npm install --save-dev hardhat @openzeppelin/contracts

# 配置环境变量
cp .env.example .env
```

### 5.2 环境变量配置

```env
# Monad Testnet
MONAD_RPC_URL=https://testnet-rpc.monad.xyz
PRIVATE_KEY=your_private_key

# LLM API
ZHIPU_API_KEY=your_zhipu_api_key
OPENAI_API_KEY=your_openai_api_key

# 合约地址 (部署后填写)
VAULT_ADDRESS=
STRATEGY_MANAGER_ADDRESS=
AGENT_CONTROLLER_ADDRESS=
```

### 5.3 编译与部署

```bash
# 编译合约
npx hardhat compile

# 部署到Monad测试网
npx hardhat run scripts/deploy.js --network monad

# 验证合约
npx hardhat verify --network monad <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```

### 5.4 部署脚本

```javascript
// scripts/deploy.js
async function main() {
  const [deployer] = await ethers.getSigners();
  
  // 部署AgentController
  const AgentController = await ethers.getContractFactory("AgentController");
  const agentController = await AgentController.deploy();
  await agentController.deployed();
  
  // 部署StrategyManager
  const StrategyManager = await ethers.getContractFactory("StrategyManager");
  const strategyManager = await StrategyManager.deploy();
  await strategyManager.deployed();
  
  // 部署YieldVault
  const YieldVault = await ethers.getContractFactory("YieldVault");
  const vault = await YieldVault.deploy(
    USDC_ADDRESS,           // asset
    "YieldFlow USDC Vault", // name
    "yfUSDC",              // symbol
    agentController.address,
    deployer.address       // fee recipient
  );
  await vault.deployed();
  
  console.log("Deployed contracts:");
  console.log("  YieldVault:", vault.address);
  console.log("  StrategyManager:", strategyManager.address);
  console.log("  AgentController:", agentController.address);
}

main().catch(console.error);
```

---

## 6. 安全考虑

### 6.1 智能合约安全

| 风险 | 缓解措施 |
|------|----------|
| 重入攻击 | 使用ReentrancyGuard |
| 权限滥用 | 基于角色的访问控制 |
| 整数溢出 | Solidity 0.8+ 内置检查 |
| 预言机操纵 | 多源数据聚合 |
| 前端运行 | 滑点保护、延迟机制 |

### 6.2 Agent安全

| 风险 | 缓解措施 |
|------|----------|
| 未授权操作 | AgentController权限验证 |
| 恶意策略 | 风险评分限制 |
| 异常交易 | 日限额、冷却期 |
| 密钥泄露 | 环境变量存储、定期轮换 |

### 6.3 用户资金安全

- **非托管**: 用户随时可提取资金
- **透明**: 所有操作链上可查
- **紧急退出**: Guardian可触发紧急模式
- **审计**: 使用OpenZeppelin安全库

### 6.4 安全检查清单

- [ ] 使用OpenZeppelin标准库
- [ ] 实现访问控制
- [ ] 添加事件日志
- [ ] 设置操作限额
- [ ] 实现紧急暂停
- [ ] 完成单元测试
- [ ] 代码审计

---

## 附录

### A. 合约地址 (Monad Testnet)

| 合约 | 地址 |
|------|------|
| YieldVault | 0x... |
| StrategyManager | 0x... |
| AgentController | 0x... |
| USDC | 0x... |

### B. 参考资源

- [Monad文档](https://docs.monad.xyz/)
- [OpenZeppelin合约](https://docs.openzeppelin.com/contracts/)
- [LangChain文档](https://python.langchain.com/)
- [wagmi文档](https://wagmi.sh/)

---

**文档版本**: v1.0  
**更新日期**: 2026-02-17  
**作者**: YieldFlow Team
