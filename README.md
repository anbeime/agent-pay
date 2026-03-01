# YieldFlow - AI-Powered Yield Optimization

<p align="center">
  <strong>AI-Driven Intelligent Yield Optimization on Monad Blockchain</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#documentation">Documentation</a> •
  <a href="#license">License</a>
</p>

---

## Overview

YieldFlow is an AI-powered yield optimization platform built on Monad blockchain. It automatically manages user funds across multiple DeFi protocols to maximize returns while minimizing risks through intelligent AI agents.

### Track: Agent-native Payments
**Competition**: Rebel in Paradise AI Hackathon 2026

## Features

- **AI-Driven Decisions**: LangChain + LLM powered investment decisions
- **Multi-Protocol Integration**: Aave, Compound, Uniswap, Curve support
- **Risk-Aware Optimization**: Real-time risk assessment and alerts
- **Monad Native**: Leverage 10,000 TPS for instant rebalancing
- **Transparent AI**: Explainable investment decisions
- **Non-Custodial**: Users control their funds at all times

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    YieldFlow System                     │
├─────────────────────────────────────────────────────────┤
│  Frontend (React + wagmi)                               │
│    ├── Dashboard                                        │
│    ├── Deposit/Withdraw                                 │
│    └── Analytics                                        │
├─────────────────────────────────────────────────────────┤
│  AI Agent Layer (LangChain + Python)                    │
│    ├── DataCollectorAgent                               │
│    ├── AnalysisAgent                                    │
│    ├── DecisionAgent                                    │
│    ├── ExecutionAgent                                   │
│    └── MonitorAgent                                     │
├─────────────────────────────────────────────────────────┤
│  Smart Contracts (Solidity)                             │
│    ├── YieldVault (ERC4626)                             │
│    ├── StrategyManager                                  │
│    └── AgentController                                  │
├─────────────────────────────────────────────────────────┤
│  Monad Blockchain (10,000 TPS)                          │
└─────────────────────────────────────────────────────────┘
```

## Quick Start

### Prerequisites

- Node.js >= 18
- Python >= 3.10
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/anbeime/agent-pay.git
cd agent-pay

# Install dependencies
npm install

# Install Python dependencies
pip install -r requirements.txt

# Copy environment variables
cp .env.example .env
```

### Run Frontend

```bash
npm run dev
```

### Run AI Agent

```bash
python src/agent/yieldflow_agent.py
```

### Deploy Contracts

```bash
npx hardhat compile
npx hardhat run scripts/deploy.js --network monad
```

## Project Structure

```
yieldflow/
├── src/
│   ├── frontend/           # React frontend
│   │   ├── App.jsx
│   │   ├── Dashboard.jsx
│   │   └── main.css
│   ├── agent/              # AI Agent
│   │   └── yieldflow_agent.py
│   └── contracts/          # Smart contracts
│       ├── YieldVault.sol
│       ├── StrategyManager.sol
│       └── AgentController.sol
├── docs/                   # Documentation
├── tests/                  # Test suite
├── scripts/                # Deploy scripts
└── output/                 # Build output
```

## Smart Contracts

### YieldVault
- ERC4626 compliant vault
- Multi-strategy support
- Auto-rebalancing
- Yield distribution

### StrategyManager
- Strategy registration
- Allocation management
- Risk score tracking

### AgentController
- AI agent authorization
- Operation validation
- Safety limits

## AI Agent

The AI Agent system consists of 5 collaborative agents:

1. **DataCollectorAgent**: Gathers protocol data, prices, TVL
2. **AnalysisAgent**: Calculates risk-adjusted yields, predicts trends
3. **DecisionAgent**: Makes allocation decisions based on user profile
4. **ExecutionAgent**: Executes on-chain with gas optimization
5. **MonitorAgent**: 24/7 position monitoring and alerts

## Documentation

- [Project Proposal](docs/项目方案_YieldFlow_20260217.docx)
- [Technical Documentation](docs/技术文档_YieldFlow_20260217.md)
- [System Architecture](docs/系统架构图.md)
- [Track Analysis](docs/赛道分析报告.md)

## Tech Stack

| Layer | Technology |
|-------|------------|
| Blockchain | Monad |
| Smart Contracts | Solidity, Hardhat, OpenZeppelin |
| AI Agent | LangChain, Zhipu GLM-4 |
| Frontend | React, wagmi, viem |
| Data | Zilliz Milvus |

## License

MIT License - see [LICENSE](LICENSE) for details.

## Contact

- **Email**: team@yieldflow.io
- **GitHub**: https://github.com/anbeime/agent-pay
- **Discord**: https://discord.gg/yieldflow

---

<p align="center">
  Built with ❤️ for Rebel in Paradise AI Hackathon 2026
</p>
