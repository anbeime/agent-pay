/**
 * YieldFlow - AI-Powered Yield Optimization Dashboard
 * Main Application Component
 */

import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import './main.css';

// Contract addresses (Monad Testnet)
const CONTRACTS = {
  yieldVault: '0x1234567890abcdef1234567890abcdef12345678',
  strategyManager: '0xabcdef1234567890abcdef1234567890abcdef12',
  agentController: '0x567890abcdef1234567890abcdef1234567890ab',
};

// Risk profiles
const RISK_PROFILES = {
  conservative: { name: 'Conservative', maxRisk: 30, color: '#22c55e' },
  balanced: { name: 'Balanced', maxRisk: 50, color: '#eab308' },
  aggressive: { name: 'Aggressive', maxRisk: 70, color: '#ef4444' },
};

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [riskProfile, setRiskProfile] = useState('balanced');
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [portfolioData, setPortfolioData] = useState({
    totalValue: 10520.50,
    totalYield: 520.50,
    apy: 8.5,
    allocations: [
      { protocol: 'Aave V3', percentage: 35, apy: 5.2, risk: 20 },
      { protocol: 'Compound V3', percentage: 25, apy: 4.8, risk: 25 },
      { protocol: 'Uniswap V3', percentage: 25, apy: 12.5, risk: 45 },
      { protocol: 'Curve Finance', percentage: 15, apy: 8.3, risk: 35 },
    ],
  });

  const strategyData = [
    { id: 'aave', name: 'Aave V3', apy: 5.2, tvl: 500000000, risk: 20, type: 'lending' },
    { id: 'compound', name: 'Compound V3', apy: 4.8, tvl: 300000000, risk: 25, type: 'lending' },
    { id: 'uniswap', name: 'Uniswap V3 LP', apy: 12.5, tvl: 800000000, risk: 45, type: 'liquidity' },
    { id: 'curve', name: 'Curve Finance', apy: 8.3, tvl: 400000000, risk: 35, type: 'liquidity' },
    { id: 'lido', name: 'Lido Staking', apy: 4.5, tvl: 2000000000, risk: 15, type: 'staking' },
  ];

  const handleConnect = () => {
    setIsConnected(true);
    setAddress('0x1234...5678');
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setAddress('');
  };

  const handleDeposit = () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setDepositAmount('');
      alert('Deposit successful!');
    }, 1000);
  };

  const handleWithdraw = () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setWithdrawAmount('');
      alert('Withdrawal successful!');
    }, 1000);
  };

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

  return (
    <div className="app">
      <header className="header">
        <div className="header-brand">
          <h1>YieldFlow</h1>
          <span className="badge">AI-Powered</span>
        </div>
        <div className="header-wallet">
          <span className="address">{address}</span>
          <button className="btn-secondary" onClick={handleDisconnect}>
            Disconnect
          </button>
        </div>
      </header>

      <main className="main-content">
        <nav className="nav-tabs">
          {['dashboard', 'deposit', 'withdraw', 'strategies', 'analytics'].map((tab) => (
            <button
              key={tab}
              className={`nav-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>

        {error && (
          <div className="error-banner">
            <span>{error}</span>
            <button onClick={() => setError('')}>x</button>
          </div>
        )}

        <div className="content-panel">
          {activeTab === 'dashboard' && (
            <Dashboard
              portfolioData={portfolioData}
              riskProfile={riskProfile}
              onRiskProfileChange={setRiskProfile}
            />
          )}

          {activeTab === 'deposit' && (
            <div className="panel">
              <h2>Deposit</h2>
              <div className="form-group">
                <label>Amount (USDC)</label>
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <button
                className="btn-primary"
                onClick={handleDeposit}
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : 'Deposit'}
              </button>
            </div>
          )}

          {activeTab === 'withdraw' && (
            <div className="panel">
              <h2>Withdraw</h2>
              <div className="form-group">
                <label>Amount (USDC)</label>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <button
                className="btn-primary"
                onClick={handleWithdraw}
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : 'Withdraw'}
              </button>
            </div>
          )}

          {activeTab === 'strategies' && (
            <div className="panel">
              <h2>Active Strategies</h2>
              <div className="strategy-list">
                {strategyData.map((strategy) => (
                  <div key={strategy.id} className="strategy-card">
                    <div className="strategy-header">
                      <h3>{strategy.name}</h3>
                      <span className={`risk-badge risk-${strategy.risk < 30 ? 'low' : strategy.risk < 50 ? 'medium' : 'high'}`}>
                        {strategy.risk < 30 ? 'Low' : strategy.risk < 50 ? 'Medium' : 'High'} Risk
                      </span>
                    </div>
                    <div className="strategy-stats">
                      <div className="stat">
                        <label>APY</label>
                        <value>{strategy.apy}%</value>
                      </div>
                      <div className="stat">
                        <label>TVL</label>
                        <value>${(strategy.tvl / 1e6).toFixed(1)}M</value>
                      </div>
                      <div className="stat">
                        <label>Type</label>
                        <value>{strategy.type}</value>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="panel">
              <h2>Analytics</h2>
              <div className="analytics-grid">
                <div className="analytics-card">
                  <h3>Total Value Locked</h3>
                  <p className="metric">$10,520.50</p>
                  <span className="change positive">+5.2%</span>
                </div>
                <div className="analytics-card">
                  <h3>Total Yield Earned</h3>
                  <p className="metric">$520.50</p>
                  <span className="change positive">+8.5% APY</span>
                </div>
                <div className="analytics-card">
                  <h3>Active Strategies</h3>
                  <p className="metric">4</p>
                  <span className="info">Optimized by AI</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="footer">
        <p>YieldFlow - AI-Powered Yield Optimization on Monad</p>
      </footer>
    </div>
  );
}

export default App;
