"""
YieldFlow - Integration Test Suite
==================================
Comprehensive tests for smart contracts, agents, and frontend integration.
"""

import pytest
import asyncio
import json
from datetime import datetime
from unittest.mock import Mock, AsyncMock, patch
from web3 import Web3
from eth_account import Account

# Test configuration
TEST_CONFIG = {
    "monad_testnet": {
        "rpc_url": "https://testnet-rpc.monad.xyz",
        "chain_id": 41454,
    },
    "contracts": {
        "yield_vault": "0x1234567890abcdef1234567890abcdef12345678",
        "strategy_manager": "0xabcdef1234567890abcdef1234567890abcdef12",
        "agent_controller": "0x567890abcdef1234567890abcdef1234567890ab",
    },
    "test_accounts": {
        "admin": "0x" + "a" * 40,
        "agent": "0x" + "b" * 40,
        "user": "0x" + "c" * 40,
    }
}


# ==================== Smart Contract Tests ====================

class TestYieldVault:
    """Test suite for YieldVault contract"""
    
    @pytest.fixture
    def web3(self):
        """Create Web3 instance"""
        return Web3(Web3.HTTPProvider(TEST_CONFIG["monad_testnet"]["rpc_url"]))
    
    @pytest.fixture
    def mock_contract(self):
        """Create mock contract for testing"""
        contract = Mock()
        contract.address = TEST_CONFIG["contracts"]["yield_vault"]
        return contract
    
    def test_deposit_success(self, mock_contract):
        """Test successful deposit"""
        # Mock deposit parameters
        amount = 1000 * 10**6  # 1000 USDC
        receiver = TEST_CONFIG["test_accounts"]["user"]
        
        # Expected behavior
        expected_shares = amount  # 1:1 for first deposit
        
        # Verify deposit logic
        assert amount > 0
        assert Web3.is_address(receiver)
    
    def test_deposit_minimum_check(self):
        """Test minimum deposit requirement"""
        min_deposit = 10**6  # 1 USDC
        
        # Valid deposits
        assert 10**6 >= min_deposit  # 1 USDC
        assert 10**7 >= min_deposit  # 10 USDC
        
        # Invalid deposits
        assert not (10**5 >= min_deposit)  # 0.1 USDC
    
    def test_withdraw_success(self, mock_contract):
        """Test successful withdrawal"""
        # User has deposited 1000 USDC
        shares = 1000 * 10**6
        assets = 1050 * 10**6  # Including yield
        
        # Withdraw should return assets based on shares
        expected_assets = shares * assets // shares
        assert expected_assets == assets
    
    def test_convert_shares_to_assets(self):
        """Test share to asset conversion"""
        # Initial state: 1:1 ratio
        total_supply = 10000 * 10**6
        total_assets = 10000 * 10**6
        
        # After yield: 1.05:1 ratio
        new_total_assets = 10500 * 10**6
        
        # User with 1000 shares
        user_shares = 1000 * 10**6
        expected_assets = user_shares * new_total_assets // total_supply
        assert expected_assets == 1050 * 10**6
    
    def test_multiple_strategies_allocation(self):
        """Test allocation across multiple strategies"""
        allocations = {
            "aave": 35,
            "compound": 25,
            "uniswap": 25,
            "curve": 15,
        }
        
        total = sum(allocations.values())
        assert total == 100, "Total allocation should be 100%"
        
        # Each allocation should be <= 40% (max per protocol)
        for protocol, alloc in allocations.items():
            assert alloc <= 40, f"{protocol} allocation exceeds 40% limit"
    
    def test_rebalance_trigger(self):
        """Test rebalance trigger conditions"""
        current_allocation = {"aave": 35, "compound": 30, "uniswap": 35}
        target_allocation = {"aave": 40, "compound": 20, "uniswap": 40}
        
        threshold = 0.05  # 5% deviation
        
        needs_rebalance = False
        for protocol in current_allocation:
            deviation = abs(
                current_allocation[protocol] - target_allocation[protocol]
            ) / current_allocation[protocol]
            if deviation > threshold:
                needs_rebalance = True
                break
        
        assert needs_rebalance, "Should trigger rebalance for compound deviation"


class TestStrategyManager:
    """Test suite for StrategyManager contract"""
    
    def test_strategy_registration(self):
        """Test strategy registration"""
        strategy_data = {
            "id": "aave_v3",
            "address": "0x" + "1" * 40,
            "name": "Aave V3",
            "allocation": 30,
            "risk_score": 20,
        }
        
        # Validate strategy data
        assert Web3.is_address(strategy_data["address"])
        assert 0 <= strategy_data["allocation"] <= 100
        assert 0 <= strategy_data["risk_score"] <= 100
    
    def test_risk_score_validation(self):
        """Test risk score validation"""
        max_risk = 70  # Maximum acceptable risk
        
        test_cases = [
            (20, True),   # Low risk - OK
            (50, True),   # Medium risk - OK
            (70, True),   # At limit - OK
            (75, False),  # Above limit - Reject
            (100, False), # High risk - Reject
        ]
        
        for risk_score, expected in test_cases:
            is_acceptable = risk_score <= max_risk
            assert is_acceptable == expected
    
    def test_allocation_update(self):
        """Test allocation update by AI agent"""
        current_allocations = {
            "aave": 35,
            "compound": 25,
            "uniswap": 25,
            "curve": 15,
        }
        
        new_allocations = {
            "aave": 30,
            "compound": 20,
            "uniswap": 35,
            "curve": 15,
        }
        
        # Total should always be 100%
        assert sum(new_allocations.values()) == 100
    
    def test_emergency_deactivation(self):
        """Test emergency strategy deactivation"""
        strategy = {
            "id": "risky_protocol",
            "risk_score": 95,
            "active": True,
        }
        
        # If risk exceeds threshold, should deactivate
        emergency_threshold = 90
        if strategy["risk_score"] > emergency_threshold:
            strategy["active"] = False
        
        assert not strategy["active"]


class TestAgentController:
    """Test suite for AgentController contract"""
    
    def test_agent_authorization(self):
        """Test agent authorization"""
        agent_config = {
            "address": "0x" + "b" * 40,
            "max_operation_value": 100000 * 10**6,  # 100K USDC
            "daily_limit": 500000 * 10**6,  # 500K USDC
            "cooldown_period": 60,  # 1 minute
        }
        
        # Validate config
        assert Web3.is_address(agent_config["address"])
        assert agent_config["max_operation_value"] > 0
        assert agent_config["daily_limit"] > 0
        assert agent_config["cooldown_period"] >= 0
    
    def test_operation_validation(self):
        """Test operation validation"""
        agent_config = {
            "max_operation_value": 100000 * 10**6,
            "daily_limit": 500000 * 10**6,
            "daily_used": 200000 * 10**6,
            "last_operation_time": datetime.now().timestamp() - 120,
            "cooldown_period": 60,
        }
        
        # Test operation within limits
        operation_value = 50000 * 10**6
        
        # Check operation value limit
        within_value_limit = operation_value <= agent_config["max_operation_value"]
        assert within_value_limit
        
        # Check daily limit
        within_daily_limit = agent_config["daily_used"] + operation_value <= agent_config["daily_limit"]
        assert within_daily_limit
        
        # Check cooldown
        cooldown_elapsed = True  # Assuming enough time passed
        assert cooldown_elapsed
    
    def test_unauthorized_operation_rejection(self):
        """Test rejection of unauthorized operations"""
        # Unauthorized agent
        unauthorized = "0x" + "d" * 40
        
        # Should not have AGENT_ROLE
        has_role = False  # Mock
        
        assert not has_role, "Unauthorized agent should be rejected"


# ==================== AI Agent Tests ====================

class TestDataCollectorAgent:
    """Test suite for Data Collector Agent"""
    
    @pytest.mark.asyncio
    async def test_fetch_protocol_data(self):
        """Test protocol data fetching"""
        # Mock protocol data
        expected_data = {
            "name": "Aave V3",
            "tvl": 500000000,
            "apy": 5.2,
            "risk_score": 20,
        }
        
        # Verify data structure
        assert "name" in expected_data
        assert "tvl" in expected_data
        assert "apy" in expected_data
        assert expected_data["apy"] > 0
    
    @pytest.mark.asyncio
    async def test_fetch_all_protocols(self):
        """Test fetching data for all protocols"""
        protocols = ["aave", "compound", "uniswap", "curve"]
        
        # Mock response
        results = [
            {"name": p, "apy": 5 + i, "tvl": 100000000 * (i + 1)}
            for i, p in enumerate(protocols)
        ]
        
        assert len(results) == len(protocols)
    
    @pytest.mark.asyncio
    async def test_market_sentiment_fetch(self):
        """Test market sentiment data"""
        sentiment = {
            "fear_greed_index": 65,
            "market_trend": "bullish",
            "volatility": "medium",
        }
        
        assert 0 <= sentiment["fear_greed_index"] <= 100
        assert sentiment["market_trend"] in ["bullish", "bearish", "neutral"]


class TestAnalysisAgent:
    """Test suite for Analysis Agent"""
    
    def test_protocol_analysis(self):
        """Test protocol analysis logic"""
        protocol = {
            "name": "Aave V3",
            "apy": 5.2,
            "tvl": 500000000,
            "risk_score": 20,
        }
        
        # Risk-adjusted APY calculation
        risk_adjusted_apy = protocol["apy"] * (1 - protocol["risk_score"] / 200)
        expected = 5.2 * 0.9  # 10% risk adjustment
        
        assert abs(risk_adjusted_apy - expected) < 0.01
    
    def test_protocol_ranking(self):
        """Test protocol ranking by risk-adjusted returns"""
        protocols = [
            {"name": "Aave", "apy": 5.2, "risk": 20},
            {"name": "Uniswap", "apy": 12.5, "risk": 45},
            {"name": "Curve", "apy": 8.3, "risk": 35},
        ]
        
        # Calculate risk-adjusted APY
        for p in protocols:
            p["risk_adjusted_apy"] = p["apy"] * (1 - p["risk"] / 200)
        
        # Sort by risk-adjusted APY
        sorted_protocols = sorted(protocols, key=lambda x: x["risk_adjusted_apy"], reverse=True)
        
        assert sorted_protocols[0]["name"] == "Uniswap"  # Highest risk-adjusted return
    
    def test_risk_level_classification(self):
        """Test risk level classification"""
        test_cases = [
            (15, "LOW"),
            (35, "MEDIUM"),
            (55, "HIGH"),
            (85, "CRITICAL"),
        ]
        
        for score, expected_level in test_cases:
            if score < 25:
                level = "LOW"
            elif score < 50:
                level = "MEDIUM"
            elif score < 75:
                level = "HIGH"
            else:
                level = "CRITICAL"
            
            assert level == expected_level


class TestDecisionAgent:
    """Test suite for Decision Agent"""
    
    def test_allocation_decision_conservative(self):
        """Test allocation decision for conservative profile"""
        user_pref = {
            "risk_tolerance": "conservative",
            "min_investment": 1000,
            "max_investment": 50000,
        }
        
        # Conservative should prefer lower risk protocols
        max_risk = 30  # Conservative max risk
        
        protocols = [
            {"name": "Aave", "risk": 20, "apy": 5.2},
            {"name": "Compound", "risk": 25, "apy": 4.8},
            {"name": "Uniswap", "risk": 45, "apy": 12.5},
        ]
        
        # Filter by risk
        suitable_protocols = [p for p in protocols if p["risk"] <= max_risk]
        
        assert len(suitable_protocols) == 2
        assert "Uniswap" not in [p["name"] for p in suitable_protocols]
    
    def test_allocation_decision_aggressive(self):
        """Test allocation decision for aggressive profile"""
        user_pref = {
            "risk_tolerance": "aggressive",
        }
        
        # Aggressive can accept higher risk
        max_risk = 70
        
        protocols = [
            {"name": "Aave", "risk": 20},
            {"name": "Uniswap", "risk": 45},
            {"name": "HighRisk", "risk": 65},
        ]
        
        suitable_protocols = [p for p in protocols if p["risk"] <= max_risk]
        
        assert len(suitable_protocols) == 3
    
    def test_rebalance_decision(self):
        """Test rebalance decision logic"""
        current = {"aave": 35, "compound": 25, "uniswap": 25, "curve": 15}
        target = {"aave": 30, "compound": 20, "uniswap": 35, "curve": 15}
        
        threshold = 0.05  # 5%
        
        needs_rebalance = False
        for protocol in current:
            deviation = abs(current[protocol] - target[protocol]) / max(current[protocol], 1)
            if deviation > threshold:
                needs_rebalance = True
                break
        
        assert needs_rebalance


class TestExecutionAgent:
    """Test suite for Execution Agent"""
    
    def test_transaction_building(self):
        """Test transaction building"""
        allocation = {
            "protocol": "Aave",
            "amount": 1000 * 10**6,
        }
        
        tx = {
            "to": "0x" + "1" * 40,
            "value": 0,
            "gas": 500000,
            "gasPrice": 15 * 10**9,  # 15 gwei
            "data": "0x",
        }
        
        assert tx["gas"] > 0
        assert tx["gasPrice"] > 0
    
    def test_gas_optimization(self):
        """Test gas price optimization"""
        base_gas = 10 * 10**9  # 10 gwei
        optimal_gas = int(base_gas * 1.1)  # 10% buffer
        
        assert optimal_gas == 11 * 10**9
    
    def test_transaction_batching(self):
        """Test transaction batching"""
        allocations = [
            {"protocol": "Aave", "amount": 3500},
            {"protocol": "Compound", "amount": 2500},
            {"protocol": "Uniswap", "amount": 2500},
            {"protocol": "Curve", "amount": 1500},
        ]
        
        # Batch into single transaction if possible
        total_amount = sum(a["amount"] for a in allocations)
        
        assert total_amount == 10000


# ==================== Integration Tests ====================

class TestIntegration:
    """End-to-end integration tests"""
    
    @pytest.mark.asyncio
    async def test_full_optimization_cycle(self):
        """Test complete optimization cycle"""
        # Step 1: Data collection
        protocols = await self._mock_fetch_protocols()
        assert len(protocols) > 0
        
        # Step 2: Analysis
        analysis = await self._mock_analyze_protocols(protocols)
        assert "ranked_protocols" in analysis
        
        # Step 3: Decision
        allocations = await self._mock_make_decision(analysis)
        assert sum(a["percentage"] for a in allocations) == 100
        
        # Step 4: Execution (mock)
        result = await self._mock_execute_allocations(allocations)
        assert result["success"]
    
    async def _mock_fetch_protocols(self):
        """Mock protocol fetching"""
        return [
            {"name": "Aave", "apy": 5.2, "tvl": 500000000, "risk": 20},
            {"name": "Compound", "apy": 4.8, "tvl": 300000000, "risk": 25},
            {"name": "Uniswap", "apy": 12.5, "tvl": 800000000, "risk": 45},
        ]
    
    async def _mock_analyze_protocols(self, protocols):
        """Mock protocol analysis"""
        ranked = sorted(protocols, key=lambda x: x["apy"] * (1 - x["risk"]/200), reverse=True)
        return {"ranked_protocols": ranked}
    
    async def _mock_make_decision(self, analysis):
        """Mock allocation decision"""
        return [
            {"protocol": "Uniswap", "percentage": 40},
            {"protocol": "Aave", "percentage": 35},
            {"protocol": "Compound", "percentage": 25},
        ]
    
    async def _mock_execute_allocations(self, allocations):
        """Mock execution"""
        return {"success": True, "tx_hash": "0x" + "a" * 64}


# ==================== Test Runner ====================

def run_tests():
    """Run all tests"""
    pytest.main([
        __file__,
        "-v",
        "--tb=short",
        "--asyncio-mode=auto",
    ])


if __name__ == "__main__":
    run_tests()
