import React from 'react';

function Dashboard({ portfolioData, riskProfile, onRiskProfileChange }) {
  const riskProfiles = {
    conservative: { name: 'Conservative', maxRisk: 30, color: '#22c55e' },
    balanced: { name: 'Balanced', maxRisk: 50, color: '#eab308' },
    aggressive: { name: 'Aggressive', maxRisk: 70, color: '#ef4444' },
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Portfolio Overview</h2>
        <div className="risk-selector">
          <label>Risk Profile:</label>
          <select
            value={riskProfile}
            onChange={(e) => onRiskProfileChange(e.target.value)}
          >
            {Object.entries(riskProfiles).map(([key, profile]) => (
              <option key={key} value={key}>
                {profile.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <h3>Total Value</h3>
          <p className="metric-value">${portfolioData.totalValue.toLocaleString()}</p>
        </div>
        <div className="metric-card">
          <h3>Total Yield</h3>
          <p className="metric-value">${portfolioData.totalYield.toLocaleString()}</p>
        </div>
        <div className="metric-card">
          <h3>APY</h3>
          <p className="metric-value">{portfolioData.apy}%</p>
        </div>
      </div>

      <div className="allocations">
        <h3>Strategy Allocations</h3>
        <div className="allocation-list">
          {portfolioData.allocations.map((allocation, index) => (
            <div key={index} className="allocation-item">
              <div className="allocation-info">
                <span className="protocol">{allocation.protocol}</span>
                <span className="percentage">{allocation.percentage}%</span>
              </div>
              <div className="allocation-bar">
                <div
                  className="allocation-fill"
                  style={{ width: `${allocation.percentage}%` }}
                />
              </div>
              <div className="allocation-stats">
                <span>APY: {allocation.apy}%</span>
                <span>Risk: {allocation.risk}/100</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="ai-insights">
        <h3>🤖 AI Insights</h3>
        <div className="insight-card">
          <p>Based on current market conditions, AI recommends increasing allocation to Uniswap V3 LP for higher yields while maintaining risk within your {riskProfiles[riskProfile].name} profile.</p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
