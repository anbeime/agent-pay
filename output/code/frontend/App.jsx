/**
 * YieldFlow - AI-Powered Yield Optimization Dashboard
 * Main Application Component
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useAccount, useConnect, useDisconnect, useBalance, useContractRead, useContractWrite } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';

// Contract ABIs
import { yieldVaultABI } from './abis/YieldVault';
import { strategyManagerABI } from './abis/StrategyManager';

// Components
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import DepositPanel from './components/DepositPanel';
import WithdrawPanel from './components/WithdrawPanel';
import StrategySelector from './components/StrategySelector';
import Analytics from './components/Analytics';
import TransactionHistory from './components/TransactionHistory';

// Styles
import './styles/main.css';

// Contract addresses (Monad Testnet)
const CONTRACTS = {
  yieldVault: '0x1234567890abcdef1234567890abcdef12345678',
  strategyManager: '0xabcdef1234567890abcdef1234567890abcdef12',
  agentController: '0x567890abcdef1234567890abcdef1234567890ab',
};

// Asset configuration
const ASSET = {
  address: '0x1234567890abcdef1234567890abcdef12345678', // USDC on Monad
  symbol: 'USDC',
  decimals: 6,
  name: 'USD Coin',
};

// Risk profiles
const RISK_PROFILES = {
  conservative: { name: 'Conservative', maxRisk: 30, color: '#22c55e' },
  balanced: { name: 'Balanced', maxRisk: 50, color: '#eab308' },
  aggressive: { name: 'Aggressive', maxRisk: 70, color: '#ef4444' },
};

function App() {
  // State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [riskProfile, setRiskProfile] = useState('balanced');
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [selectedStrategies, setSelectedStrategies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [error, setError] = useState('');
  const [portfolioData, setPortfolioData] = useState({
    totalValue: 0,
    totalYield: 0,
    apy: 0,
    allocations: [],
  });
  const [strategyData, setStrategyData] = useState([]);

  // Wagmi hooks
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: balance } = useBalance({
    address: address,
    token: ASSET.address,
  });

  // Contract reads
  const { data: vaultBalance } = useContractRead({
    address: CONTRACTS.yieldVault,
    abi: yieldVaultABI,
    functionName: 'balanceOf',
    args: [address],
    watch: true,
    enabled: isConnected,
  });

  const { data: totalAssets } = useContractRead({
    address: CONTRACTS.yieldVault,
    abi: yieldVaultABI,
    functionName: 'totalAssets',
    watch: true,
    enabled: isConnected,
  });

  const { data: userShare } = useContractRead({
    address: CONTRACTS.yieldVault,
    abi: yieldVaultABI,
    functionName: 'convertToAssets',
    args: [vaultBalance || 0n],
    watch: true,
    enabled: isConnected && vaultBalance,
  });

  const { data: strategies } = useContractRead({
    address: CONTRACTS.strategyManager,
    abi: strategyManagerABI,
    functionName: 'getActiveStrategies',
    watch: true,
    enabled: isConnected,
  });

  // Contract writes
  const { write: deposit, isLoading: isDepositing } = useContractWrite({
    address: CONTRACTS.yieldVault,
    abi: yieldVaultABI,
    functionName: 'deposit',
  });

  const { write: withdraw, isLoading: isWithdrawing } = useContractWrite({
    address: CONTRACTS.yieldVault,
    abi: yieldVaultABI,
    functionName: 'withdraw',
  });

  // Fetch portfolio data
  const fetchPortfolioData = useCallback(async () => {
    if (!isConnected) return;

    try {
      // Mock data for demo
      const mockPortfolio = {
        totalValue: 10520.50,
        totalYield: 520.50,
        apy: 8.5,
        allocations: [
          { protocol: 'Aave V3', percentage: 35, apy: 5.2, risk: 20 },
          { protocol: 'Compound V3', percentage: 25, apy: 4.8, risk: 25 },
          { protocol: 'Uniswap V3', percentage: 25, apy: 12.5, risk: 45 },
          { protocol: 'Curve Finance', percentage: 15, apy: 8.3, risk: 35 },
        ],
      };
      setPortfolioData(mockPortfolio);
    } catch (err) {
      console.error('Failed to fetch portfolio data:', err);
    }
  }, [isConnected]);

  // Fetch strategy data
  const fetchStrategyData = useCallback(async () => {
    try {
      // Mock strategy data
      const mockStrategies = [
        { id: 'aave', name: 'Aave V3', apy: 5.2, tvl: 500000000, risk: 20, type: 'lending' },
        { id: 'compound', name: 'Compound V3', apy: 4.8, tvl: 300000000, risk: 25, type: 'lending' },
        { id: 'uniswap', name: 'Uniswap V3 LP', apy: 12.5, tvl: 800000000, risk: 45, type: 'liquidity' },
        { id: 'curve', name: 'Curve Finance', apy: 8.3, tvl: 400000000, risk: 35, type: 'liquidity' },
        { id: 'lido', name: 'Lido Staking', apy: 4.5, tvl: 2000000000, risk: 15, type: 'staking' },
      ];
      setStrategyData(mockStrategies);
    } catch (err) {
      console.error('Failed to fetch strategy data:', err);
    }
  }, []);

  useEffect(() => {
    fetchPortfolioData();
    fetchStrategyData();
  }, [fetchPortfolioData, fetchStrategyData]);

  // Handle deposit
  const handleDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const amount = parseUnits(depositAmount, ASSET.decimals);
      await deposit({ args: [amount, address] });
      setDepositAmount('');
    } catch (err) {
      setError(err.message || 'Deposit failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle withdraw
  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const amount = parseUnits(withdrawAmount, ASSET.decimals);
      await withdraw({ args: [amount, address, address] });
      setWithdrawAmount('');
    } catch (err) {
      setError(err.message || 'Withdrawal failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle connect wallet
  const handleConnect = async () => {
    try {
      const connector = connectors[0];
      if (connector) {
        await connect({ connector });
      }
    } catch (err) {
      setError(err.message || 'Connection failed');
    }
  };

  // Render connect screen
  if (!isConnected) {
    return (
      <div className="app connect-screen">
        <div className="connect-container">
          <div className="logo">
            <h1>YieldFlow</h1>
            <p className="tagline">AI-Powered Yield Optimization</p>
          </div>
          <div className="connect-box">
            <h2>Welcome to YieldFlow</h2>
            <p>Connect your wallet to start optimizing your DeFi yields</p>
            <button className="btn-primary connect-btn" onClick={handleConnect}>
              Connect Wallet
            </button>
            <div className="features">
              <div className="feature">
                <span className="feature-icon">🤖</span>
                <span>AI-Driven Strategy</span>
              </div>
              <div className="feature">
                <span className="feature-icon">⚡</span>
                <span>Monad Powered</span>
              </div>
              <div className="feature">
                <span className="feature-icon">🔒</span>
                <span>Non-Custodial</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render main app
  return (
    <div className="app">
      <Header
        address={address}
        balance={balance}
        onDisconnect={disconnect}
      />

      <main className="main-content">
        {/* Navigation */}
        <nav className="nav-tabs">
          <button
            className={`nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
          <button
            className={`nav-tab ${activeTab === 'deposit' ? 'active' : ''}`}
            onClick={() => setActiveTab('deposit')}
          >
            Deposit
          </button>
          <button
            className={`nav-tab ${activeTab === 'withdraw' ? 'active' : ''}`}
            onClick={() => setActiveTab('withdraw')}
          >
            Withdraw
          </button>
          <button
            className={`nav-tab ${activeTab === 'strategies' ? 'active' : ''}`}
            onClick={() => setActiveTab('strategies')}
          >
            Strategies
          </button>
          <button
            className={`nav-tab ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            Analytics
          </button>
        </nav>

        {/* Error display */}
        {error && (
          <div className="error-banner">
            <span>{error}</span>
            <button onClick={() => setError('')}>x</button>
          </div>
        )}

        {/* Content panels */}
        <div className="content-panel">
          {activeTab === 'dashboard' && (
            <Dashboard
              portfolioData={portfolioData}
              userShare={userShare}
              totalAssets={totalAssets}
              riskProfile={riskProfile}
              onRiskProfileChange={setRiskProfile}
            />
          )}

          {activeTab === 'deposit' && (
            <DepositPanel
              amount={depositAmount}
              onAmountChange={setDepositAmount}
              onDeposit={handleDeposit}
              isLoading={isLoading || isDepositing}
              balance={balance}
              asset={ASSET}
              selectedStrategies={selectedStrategies}
              onStrategyChange={setSelectedStrategies}
              strategyData={strategyData}
              riskProfile={riskProfile}
              onRiskProfileChange={setRiskProfile}
            />
          )}

          {activeTab === 'withdraw' && (
            <WithdrawPanel
              amount={withdrawAmount}
              onAmountChange={setWithdrawAmount}
              onWithdraw={handleWithdraw}
              isLoading={isLoading || isWithdrawing}
              userShare={userShare}
              asset={ASSET}
            />
          )}

          {activeTab === 'strategies' && (
            <StrategySelector
              strategies={strategyData}
              selectedStrategies={selectedStrategies}
              onStrategyChange={setSelectedStrategies}
              riskProfile={riskProfile}
            />
          )}

          {activeTab === 'analytics' && (
            <Analytics
              portfolioData={portfolioData}
              strategyData={strategyData}
              address={address}
            />
          )}
        </div>

        {/* Transaction history */}
        <TransactionHistory address={address} />
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <h3>YieldFlow</h3>
            <p>AI-Powered Yield Optimization on Monad</p>
          </div>
          <div className="footer-links">
            <a href="https://docs.yieldflow.io" target="_blank" rel="noopener noreferrer">Documentation</a>
            <a href="https://github.com/yieldflow" target="_blank" rel="noopener noreferrer">GitHub</a>
            <a href="https://discord.gg/yieldflow" target="_blank" rel="noopener noreferrer">Discord</a>
          </div>
          <div className="footer-disclaimer">
            <p>Disclaimer: DeFi investments carry risks. Past performance does not guarantee future results.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
