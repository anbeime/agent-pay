/**
 * YieldFlow Dashboard Component
 * Displays portfolio overview, allocation chart, and key metrics
 */

import React from 'react';
import { formatUnits } from 'viem';

// Chart component (simplified)
const AllocationChart = ({ allocations }) => {
  const colors = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'];
  
  return (
    <div className="allocation-chart">
      <div className="chart-container">
        {allocations.map((alloc, index) => (
          <div
            key={alloc.protocol}
            className="chart-bar"
            style={{
              width: `${alloc.percentage}%`,
              backgroundColor: colors[index % colors.length],
            }}
          >
            <span className="bar-label">{alloc.protocol}</span>
          </div>
        ))}
      </div>
      <div className="chart-legend">
        {allocations.map((alloc, index) => (
          <div key={alloc.protocol} className="legend-item">
            <span
              className="legend-color"
              style={{ backgroundColor: colors[index % colors.length] }}
            />
            <span className="legend-label">{alloc.protocol}</span>
            <span className="legend-value">{alloc.percentage.toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Metric card component
const MetricCard = ({ title, value, subtitle, trend, color }) => (
  <div className="metric-card">
    <h3 className="metric-title">{title}</h3>
    <div className="metric-value" style={{ color: color || 'inherit' }}>
      {value}
    </div>
    {subtitle && <div className="metric-subtitle">{subtitle}</div>}
    {trend && (
      <div className={`metric-trend ${trend > 0 ? 'positive' : 'negative'}`}>
        {trend > 0 ? '+' : ''}{trend.toFixed(2)}%
      </div>
    )}
  </div>
);

// Risk profile selector
const RiskProfileSelector = ({ currentProfile, onChange }) => {
  const profiles = [
    { id: 'conservative', name: 'Conservative', icon: '🛡️', color: '#22c55e' },
    { id: 'balanced', name: 'Balanced', icon: '⚖️', color: '#eab308' },
    { id: 'aggressive', name: 'Aggressive', icon: '🚀', color: '#ef4444' },
  ];

  return (
    <div className="risk-profile-selector">
      <h3>Risk Profile</h3>
      <div className="profile-options">
        {profiles.map((profile) => (
          <button
            key={profile.id}
            className={`profile-option ${currentProfile === profile.id ? 'active' : ''}`}
            onClick={() => onChange(profile.id)}
            style={{
              borderColor: currentProfile === profile.id ? profile.color : 'transparent',
            }}
          >
            <span className="profile-icon">{profile.icon}</span>
            <span className="profile-name">{profile.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

function Dashboard({
  portfolioData,
  userShare,
  totalAssets,
  riskProfile,
  onRiskProfileChange,
}) {
  // Format values
  const formatValue = (value) => {
    if (!value) return '0.00';
    return parseFloat(value).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Calculate metrics
  const metrics = {
    totalValue: formatValue(portfolioData.totalValue),
    totalYield: formatValue(portfolioData.totalYield),
    apy: portfolioData.apy?.toFixed(2) || '0.00',
    dailyYield: portfolioData.totalValue > 0 
      ? ((portfolioData.totalValue * portfolioData.apy / 100) / 365).toFixed(2)
      : '0.00',
  };

  return (
    <div className="dashboard">
      {/* Header section */}
      <div className="dashboard-header">
        <h1>Portfolio Overview</h1>
        <div className="header-actions">
          <RiskProfileSelector
            currentProfile={riskProfile}
            onChange={onRiskProfileChange}
          />
        </div>
      </div>

      {/* Metrics grid */}
      <div className="metrics-grid">
        <MetricCard
          title="Total Value"
          value={`$${metrics.totalValue}`}
          subtitle="Current portfolio value"
          trend={5.2}
          color="#6366f1"
        />
        <MetricCard
          title="Total Yield"
          value={`$${metrics.totalYield}`}
          subtitle="All-time yield earned"
          trend={12.5}
          color="#22c55e"
        />
        <MetricCard
          title="Current APY"
          value={`${metrics.apy}%`}
          subtitle="Annual percentage yield"
          trend={0.8}
          color="#8b5cf6"
        />
        <MetricCard
          title="Daily Earnings"
          value={`$${metrics.dailyYield}`}
          subtitle="Estimated daily yield"
          color="#f59e0b"
        />
      </div>

      {/* Allocation section */}
      <div className="allocation-section">
        <h2>Portfolio Allocation</h2>
        <AllocationChart allocations={portfolioData.allocations} />
      </div>

      {/* Strategy details */}
      <div className="strategy-details">
        <h2>Strategy Performance</h2>
        <div className="strategy-table">
          <table>
            <thead>
              <tr>
                <th>Protocol</th>
                <th>Allocation</th>
                <th>APY</th>
                <th>Risk Score</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {portfolioData.allocations.map((alloc, index) => (
                <tr key={alloc.protocol}>
                  <td>
                    <div className="protocol-cell">
                      <span className="protocol-icon">
                        {alloc.protocol.charAt(0)}
                      </span>
                      <span>{alloc.protocol}</span>
                    </div>
                  </td>
                  <td>{alloc.percentage.toFixed(1)}%</td>
                  <td className="apy-cell">{alloc.apy.toFixed(2)}%</td>
                  <td>
                    <div className="risk-cell">
                      <div
                        className="risk-bar"
                        style={{ width: `${alloc.risk}%` }}
                      />
                      <span>{alloc.risk}</span>
                    </div>
                  </td>
                  <td>
                    <span className="status-badge active">Active</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Insights */}
      <div className="ai-insights">
        <h2>AI Insights</h2>
        <div className="insights-grid">
          <div className="insight-card">
            <div className="insight-icon">📊</div>
            <div className="insight-content">
              <h4>Market Analysis</h4>
              <p>Current DeFi market conditions are favorable for yield farming. 
                 TVL across major protocols remains stable.</p>
            </div>
          </div>
          <div className="insight-card">
            <div className="insight-icon">⚡</div>
            <div className="insight-content">
              <h4>Optimization Suggestion</h4>
              <p>Consider increasing allocation to Uniswap V3 for higher yield 
                 potential based on current market volatility.</p>
            </div>
          </div>
          <div className="insight-card">
            <div className="insight-icon">⚠️</div>
            <div className="insight-content">
              <h4>Risk Alert</h4>
              <p>Monitor gas prices before executing rebalance operations. 
                 Current gas price is moderate.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
