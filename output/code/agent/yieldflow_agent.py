"""
YieldFlow AI Agent - Core Module
===============================
Main AI Agent for intelligent yield optimization on Monad blockchain.

Features:
- Multi-protocol yield scanning
- Risk-aware decision making
- Automated rebalancing
- Real-time monitoring
"""

import os
import json
import asyncio
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple, Any
from dataclasses import dataclass, field
from enum import Enum
import aiohttp
import numpy as np
from web3 import Web3
from eth_account import Account

# LangChain imports
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from langchain_core.runnables import RunnablePassthrough
from langchain_openai import ChatOpenAI
from langchain_community.chat_models import ChatZhipuAI

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("YieldFlow-Agent")


class RiskLevel(Enum):
    """Risk level enumeration"""
    LOW = 1
    MEDIUM = 2
    HIGH = 3
    CRITICAL = 4


class StrategyType(Enum):
    """Supported strategy types"""
    LENDING = "lending"
    LIQUIDITY_MINING = "liquidity_mining"
    YIELD_FARMING = "yield_farming"
    STAKING = "staking"


@dataclass
class ProtocolInfo:
    """Protocol information structure"""
    name: str
    address: str
    type: StrategyType
    tvl: float
    apy: float
    risk_score: int  # 0-100
    chain: str = "monad"
    last_updated: datetime = field(default_factory=datetime.now)


@dataclass
class Allocation:
    """Strategy allocation"""
    protocol: str
    percentage: float  # 0-100
    amount: float
    expected_apy: float
    risk_score: int


@dataclass
class UserPreference:
    """User investment preferences"""
    risk_tolerance: str  # conservative, balanced, aggressive
    min_investment: float
    max_investment: float
    preferred_protocols: List[str]
    excluded_protocols: List[str]
    target_apy: Optional[float] = None
    investment_period: str = "flexible"


class DataCollectorAgent:
    """Agent responsible for collecting market data"""
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.protocols_cache: Dict[str, ProtocolInfo] = {}
        self.session: Optional[aiohttp.ClientSession] = None
        
    async def initialize(self):
        """Initialize the data collector"""
        self.session = aiohttp.ClientSession()
        logger.info("DataCollectorAgent initialized")
    
    async def close(self):
        """Close resources"""
        if self.session:
            await self.session.close()
    
    async def fetch_protocol_data(self, protocol_name: str) -> ProtocolInfo:
        """Fetch protocol data from multiple sources"""
        # In production, this would fetch from real APIs
        # For demo, return mock data
        mock_data = {
            "aave": ProtocolInfo(
                name="Aave V3",
                address="0x1234567890abcdef1234567890abcdef12345678",
                type=StrategyType.LENDING,
                tvl=500000000,
                apy=5.2,
                risk_score=20
            ),
            "compound": ProtocolInfo(
                name="Compound V3",
                address="0xabcdef1234567890abcdef1234567890abcdef12",
                type=StrategyType.LENDING,
                tvl=300000000,
                apy=4.8,
                risk_score=25
            ),
            "uniswap": ProtocolInfo(
                name="Uniswap V3",
                address="0x567890abcdef1234567890abcdef1234567890ab",
                type=StrategyType.LIQUIDITY_MINING,
                tvl=800000000,
                apy=12.5,
                risk_score=45
            ),
            "curve": ProtocolInfo(
                name="Curve Finance",
                address="0x90abcdef1234567890abcdef1234567890abcdef",
                type=StrategyType.LIQUIDITY_MINING,
                tvl=400000000,
                apy=8.3,
                risk_score=35
            )
        }
        
        protocol_data = mock_data.get(protocol_name.lower())
        if protocol_data:
            self.protocols_cache[protocol_name.lower()] = protocol_data
            
        return protocol_data
    
    async def fetch_all_protocols(self) -> List[ProtocolInfo]:
        """Fetch data for all supported protocols"""
        protocols = ["aave", "compound", "uniswap", "curve"]
        tasks = [self.fetch_protocol_data(p) for p in protocols]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        return [r for r in results if isinstance(r, ProtocolInfo)]
    
    async def get_market_sentiment(self) -> Dict[str, Any]:
        """Get overall market sentiment"""
        return {
            "fear_greed_index": 65,
            "market_trend": "bullish",
            "volatility": "medium",
            "defi_tvl_change_24h": 2.5,
            "timestamp": datetime.now().isoformat()
        }
    
    async def get_gas_price(self) -> int:
        """Get current gas price"""
        # Mock gas price in gwei
        return 15


class AnalysisAgent:
    """Agent responsible for analyzing yield opportunities"""
    
    def __init__(self, config: Dict[str, Any], llm):
        self.config = config
        self.llm = llm
        self.analysis_prompt = ChatPromptTemplate.from_messages([
            ("system", """You are an expert DeFi yield analyst. Analyze the following protocol data and provide:
1. Risk assessment (0-100 score)
2. Yield sustainability analysis
3. Recommended allocation percentage
4. Any warnings or concerns

Output in JSON format."""),
            ("user", "Protocol data: {protocol_data}\nMarket context: {market_context}")
        ])
        
    async def analyze_protocol(
        self, 
        protocol: ProtocolInfo,
        market_sentiment: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Analyze a single protocol"""
        
        analysis = {
            "protocol": protocol.name,
            "risk_score": protocol.risk_score,
            "risk_level": self._get_risk_level(protocol.risk_score),
            "apy_adjusted": protocol.apy * (1 - protocol.risk_score / 200),
            "recommended_allocation": self._calculate_allocation(protocol),
            "concerns": [],
            "opportunities": []
        }
        
        # Add risk-based concerns
        if protocol.risk_score > 50:
            analysis["concerns"].append("Higher risk protocol, monitor closely")
        if protocol.apy > 15:
            analysis["concerns"].append("Unsustainably high APY, possible risk")
            
        # Add opportunities
        if protocol.apy > 10 and protocol.risk_score < 40:
            analysis["opportunities"].append("Good risk-adjusted return")
        if protocol.tvl > 500000000:
            analysis["opportunities"].append("High liquidity, lower slippage risk")
            
        return analysis
    
    def _get_risk_level(self, score: int) -> RiskLevel:
        """Convert risk score to level"""
        if score < 25:
            return RiskLevel.LOW
        elif score < 50:
            return RiskLevel.MEDIUM
        elif score < 75:
            return RiskLevel.HIGH
        return RiskLevel.CRITICAL
    
    def _calculate_allocation(self, protocol: ProtocolInfo) -> float:
        """Calculate recommended allocation percentage"""
        # Higher APY and lower risk = higher allocation
        risk_factor = (100 - protocol.risk_score) / 100
        apy_factor = min(protocol.apy / 20, 1)  # Normalize APY
        
        return risk_factor * apy_factor * 30  # Max 30% for single protocol
    
    async def compare_protocols(
        self, 
        protocols: List[ProtocolInfo],
        market_sentiment: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Compare multiple protocols and rank them"""
        analyses = []
        for protocol in protocols:
            analysis = await self.analyze_protocol(protocol, market_sentiment)
            analyses.append(analysis)
        
        # Sort by risk-adjusted return
        analyses.sort(key=lambda x: x["apy_adjusted"], reverse=True)
        return analyses


class DecisionAgent:
    """Agent responsible for making investment decisions"""
    
    def __init__(self, config: Dict[str, Any], llm):
        self.config = config
        self.llm = llm
        
    async def make_allocation_decision(
        self,
        protocol_analyses: List[Dict[str, Any]],
        user_preference: UserPreference,
        total_assets: float
    ) -> List[Allocation]:
        """Make allocation decision based on analysis and user preference"""
        
        allocations = []
        total_allocation = 0
        
        # Filter protocols based on user preference
        filtered_analyses = [
            a for a in protocol_analyses
            if a["protocol"].lower() not in [p.lower() for p in user_preference.excluded_protocols]
        ]
        
        # Risk tolerance factor
        risk_factor = {
            "conservative": 0.5,
            "balanced": 1.0,
            "aggressive": 1.5
        }.get(user_preference.risk_tolerance, 1.0)
        
        for analysis in filtered_analyses:
            # Adjust allocation based on risk tolerance
            base_allocation = analysis["recommended_allocation"]
            adjusted_allocation = base_allocation * risk_factor
            
            # Ensure we don't exceed 100% total
            remaining = 100 - total_allocation
            final_allocation = min(adjusted_allocation, remaining, 40)  # Max 40% per protocol
            
            if final_allocation > 0:
                allocation = Allocation(
                    protocol=analysis["protocol"],
                    percentage=final_allocation,
                    amount=total_assets * final_allocation / 100,
                    expected_apy=analysis["apy_adjusted"],
                    risk_score=analysis["risk_score"]
                )
                allocations.append(allocation)
                total_allocation += final_allocation
        
        # Normalize to 100%
        if total_allocation > 0:
            for alloc in allocations:
                alloc.percentage = alloc.percentage * 100 / total_allocation
                alloc.amount = total_assets * alloc.percentage / 100
        
        return allocations
    
    async def should_rebalance(
        self,
        current_allocations: List[Allocation],
        target_allocations: List[Allocation],
        threshold: float = 0.05  # 5% deviation
    ) -> Tuple[bool, str]:
        """Determine if rebalancing is needed"""
        
        if len(current_allocations) != len(target_allocations):
            return True, "Allocation structure changed"
        
        for current, target in zip(current_allocations, target_allocations):
            deviation = abs(current.percentage - target.percentage) / max(current.percentage, 0.01)
            if deviation > threshold:
                return True, f"Deviation of {deviation*100:.1f}% detected for {current.protocol}"
        
        return False, "Within threshold"


class ExecutionAgent:
    """Agent responsible for executing on-chain operations"""
    
    def __init__(self, config: Dict[str, Any], web3: Web3, account: Account):
        self.config = config
        self.web3 = web3
        self.account = account
        self.nonce_counter = 0
        
    async def execute_allocation(
        self, 
        allocations: List[Allocation],
        vault_address: str
    ) -> Dict[str, Any]:
        """Execute allocation on-chain"""
        
        results = {
            "success": True,
            "transactions": [],
            "gas_used": 0,
            "errors": []
        }
        
        for allocation in allocations:
            try:
                # Build transaction
                tx = await self._build_allocation_tx(allocation, vault_address)
                
                # Sign and send
                signed_tx = self.account.sign_transaction(tx)
                tx_hash = self.web3.eth.send_raw_transaction(signed_tx.rawTransaction)
                
                # Wait for confirmation
                receipt = self.web3.eth.wait_for_transaction_receipt(tx_hash)
                
                results["transactions"].append({
                    "protocol": allocation.protocol,
                    "amount": allocation.amount,
                    "tx_hash": tx_hash.hex(),
                    "status": "success" if receipt["status"] else "failed"
                })
                results["gas_used"] += receipt["gasUsed"]
                
                if receipt["status"] == 0:
                    results["success"] = False
                    results["errors"].append(f"Transaction failed for {allocation.protocol}")
                    
            except Exception as e:
                results["success"] = False
                results["errors"].append(str(e))
                logger.error(f"Execution error for {allocation.protocol}: {e}")
        
        return results
    
    async def _build_allocation_tx(
        self, 
        allocation: Allocation,
        vault_address: str
    ) -> Dict[str, Any]:
        """Build transaction for allocation"""
        
        gas_price = await self._get_optimal_gas_price()
        
        return {
            "from": self.account.address,
            "to": vault_address,
            "value": 0,
            "gas": 500000,
            "gasPrice": gas_price,
            "nonce": self.web3.eth.get_transaction_count(self.account.address),
            "data": self._encode_allocation_data(allocation)
        }
    
    async def _get_optimal_gas_price(self) -> int:
        """Get optimal gas price for transaction"""
        base_price = self.web3.eth.gas_price
        # Add 10% buffer for faster inclusion
        return int(base_price * 1.1)
    
    def _encode_allocation_data(self, allocation: Allocation) -> str:
        """Encode allocation data for contract call"""
        # Simplified encoding
        return "0x"  # Actual implementation would use contract ABI


class MonitorAgent:
    """Agent responsible for monitoring positions"""
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.positions: Dict[str, Dict] = {}
        self.alerts: List[Dict] = []
        
    async def monitor_positions(self) -> Dict[str, Any]:
        """Monitor all positions and generate alerts"""
        
        status = {
            "positions": [],
            "alerts": [],
            "recommendations": []
        }
        
        for position_id, position in self.positions.items():
            pos_status = await self._check_position(position)
            status["positions"].append(pos_status)
            
            # Generate alerts
            if pos_status.get("health_factor", 1) < 1.1:
                status["alerts"].append({
                    "type": "WARNING",
                    "message": f"Low health factor for {position_id}",
                    "action": "Consider reducing exposure"
                })
        
        return status
    
    async def _check_position(self, position: Dict) -> Dict[str, Any]:
        """Check individual position health"""
        return {
            "position_id": position.get("id"),
            "health_factor": 1.5,  # Mock value
            "current_value": position.get("initial_value", 0) * 1.05,
            "apy_realized": 5.2,
            "days_active": 7
        }
    
    def add_position(self, position: Dict):
        """Add position to monitoring"""
        self.positions[position["id"]] = position
    
    def remove_position(self, position_id: str):
        """Remove position from monitoring"""
        self.positions.pop(position_id, None)


class YieldFlowOrchestrator:
    """Main orchestrator for YieldFlow AI Agent system"""
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        
        # Initialize LLM
        self.llm = self._init_llm()
        
        # Initialize agents
        self.data_collector = DataCollectorAgent(config)
        self.analysis_agent = AnalysisAgent(config, self.llm)
        self.decision_agent = DecisionAgent(config, self.llm)
        self.execution_agent = None  # Initialize with web3
        self.monitor_agent = MonitorAgent(config)
        
        self.is_running = False
        
    def _init_llm(self):
        """Initialize language model"""
        # Use Zhipu GLM for Chinese optimization
        api_key = os.getenv("ZHIPU_API_KEY", "")
        if api_key:
            return ChatZhipuAI(
                model="glm-4",
                temperature=0.1,
                zhipuai_api_key=api_key
            )
        else:
            # Fallback to OpenAI-compatible API
            return ChatOpenAI(
                model="gpt-4",
                temperature=0.1
            )
    
    async def initialize(self):
        """Initialize the orchestrator"""
        await self.data_collector.initialize()
        logger.info("YieldFlow Orchestrator initialized")
    
    async def close(self):
        """Close all resources"""
        await self.data_collector.close()
        logger.info("YieldFlow Orchestrator closed")
    
    async def run_optimization_cycle(
        self,
        user_preference: UserPreference,
        total_assets: float
    ) -> Dict[str, Any]:
        """Run a complete optimization cycle"""
        
        result = {
            "timestamp": datetime.now().isoformat(),
            "success": True,
            "allocations": [],
            "analysis": {},
            "execution": {},
            "errors": []
        }
        
        try:
            # Step 1: Collect data
            logger.info("Step 1: Collecting protocol data...")
            protocols = await self.data_collector.fetch_all_protocols()
            market_sentiment = await self.data_collector.get_market_sentiment()
            
            # Step 2: Analyze protocols
            logger.info("Step 2: Analyzing protocols...")
            analyses = await self.analysis_agent.compare_protocols(
                protocols, 
                market_sentiment
            )
            result["analysis"] = {
                "protocol_analyses": analyses,
                "market_sentiment": market_sentiment
            }
            
            # Step 3: Make allocation decision
            logger.info("Step 3: Making allocation decision...")
            allocations = await self.decision_agent.make_allocation_decision(
                analyses,
                user_preference,
                total_assets
            )
            result["allocations"] = [
                {
                    "protocol": a.protocol,
                    "percentage": a.percentage,
                    "amount": a.amount,
                    "expected_apy": a.expected_apy,
                    "risk_score": a.risk_score
                }
                for a in allocations
            ]
            
            # Step 4: Execute (if enabled)
            if self.config.get("auto_execute", False) and self.execution_agent:
                logger.info("Step 4: Executing allocations...")
                execution_result = await self.execution_agent.execute_allocation(
                    allocations,
                    self.config.get("vault_address", "")
                )
                result["execution"] = execution_result
                
                if execution_result["success"]:
                    # Add to monitoring
                    for alloc in allocations:
                        self.monitor_agent.add_position({
                            "id": f"{alloc.protocol}_{datetime.now().strftime('%Y%m%d%H%M%S')}",
                            "protocol": alloc.protocol,
                            "initial_value": alloc.amount,
                            "allocation": alloc.percentage
                        })
            
            logger.info("Optimization cycle completed successfully")
            
        except Exception as e:
            result["success"] = False
            result["errors"].append(str(e))
            logger.error(f"Optimization cycle failed: {e}")
        
        return result
    
    async def start_monitoring(self, interval_seconds: int = 300):
        """Start continuous monitoring"""
        self.is_running = True
        
        while self.is_running:
            try:
                status = await self.monitor_agent.monitor_positions()
                
                if status["alerts"]:
                    logger.warning(f"Alerts generated: {status['alerts']}")
                    # Handle alerts (send notifications, trigger rebalance, etc.)
                
                await asyncio.sleep(interval_seconds)
                
            except Exception as e:
                logger.error(f"Monitoring error: {e}")
                await asyncio.sleep(60)
    
    def stop_monitoring(self):
        """Stop continuous monitoring"""
        self.is_running = False


# Main entry point
async def main():
    """Main function for testing"""
    config = {
        "auto_execute": False,
        "vault_address": "0x...",
        "risk_threshold": 50
    }
    
    orchestrator = YieldFlowOrchestrator(config)
    await orchestrator.initialize()
    
    # Test with user preference
    user_pref = UserPreference(
        risk_tolerance="balanced",
        min_investment=1000,
        max_investment=100000,
        preferred_protocols=["aave", "compound", "uniswap"],
        excluded_protocols=[]
    )
    
    result = await orchestrator.run_optimization_cycle(user_pref, 10000)
    print(json.dumps(result, indent=2, default=str))
    
    await orchestrator.close()


if __name__ == "__main__":
    asyncio.run(main())
