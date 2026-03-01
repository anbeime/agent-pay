#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Rebel AI Hackathon - AI Agent核心模块
Rebel in Paradise AI Hackathon Agent Framework

提供基础的Agent功能和示例实现
"""

import os
import json
import asyncio
from typing import Dict, List, Any, Optional, Callable
from datetime import datetime
from dataclasses import dataclass, field
from abc import ABC, abstractmethod
import logging

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@dataclass
class AgentMemory:
    """Agent记忆数据结构"""
    timestamp: str
    content: str
    memory_type: str = "short_term"  # short_term / long_term
    importance: float = 0.5  # 0-1
    
    def to_dict(self) -> Dict:
        return {
            "timestamp": self.timestamp,
            "content": self.content,
            "memory_type": self.memory_type,
            "importance": self.importance
        }


@dataclass
class AgentAction:
    """Agent动作数据结构"""
    action_type: str
    params: Dict[str, Any] = field(default_factory=dict)
    timestamp: str = field(default_factory=lambda: datetime.now().isoformat())
    result: Any = None
    success: bool = False


class BaseTool(ABC):
    """工具基类"""
    
    def __init__(self, name: str, description: str):
        self.name = name
        self.description = description
    
    @abstractmethod
    async def execute(self, **kwargs) -> Any:
        """执行工具"""
        pass


class WebSearchTool(BaseTool):
    """网页搜索工具"""
    
    def __init__(self):
        super().__init__("web_search", "搜索网页信息")
    
    async def execute(self, query: str, topk: int = 5) -> List[Dict]:
        """执行搜索"""
        # 这里集成实际的搜索API
        logger.info(f"搜索: {query}")
        return [{"title": "示例结果", "url": "https://example.com"}]


class BlockchainTool(BaseTool):
    """区块链交互工具"""
    
    def __init__(self, rpc_url: str = ""):
        super().__init__("blockchain", "与区块链交互")
        self.rpc_url = rpc_url
    
    async def execute(self, method: str, **params) -> Any:
        """执行区块链操作"""
        logger.info(f"区块链操作: {method}")
        return {"status": "success", "tx_hash": "0x..."}


class RebelAgent:
    """
    Rebel AI Agent 基类
    
    提供Agent的核心功能：
    - 记忆管理
    - 工具调用
    - 推理能力
    - 动作执行
    """
    
    def __init__(
        self,
        name: str,
        role: str,
        llm_provider: str = "openai",  # openai / kimi / zhipu / doubao / stepfun
        api_key: Optional[str] = None
    ):
        self.name = name
        self.role = role
        self.llm_provider = llm_provider
        self.api_key = api_key or os.getenv(f"{llm_provider.upper()}_API_KEY")
        
        # 记忆系统
        self.short_term_memory: List[AgentMemory] = []
        self.long_term_memory: List[AgentMemory] = []
        self.max_short_term = 10
        
        # 工具注册
        self.tools: Dict[str, BaseTool] = {}
        
        # 动作历史
        self.action_history: List[AgentAction] = []
        
        # 初始化默认工具
        self._init_default_tools()
        
        logger.info(f"Agent {name} ({role}) 初始化完成")
    
    def _init_default_tools(self):
        """初始化默认工具"""
        self.register_tool(WebSearchTool())
        self.register_tool(BlockchainTool())
    
    def register_tool(self, tool: BaseTool):
        """注册工具"""
        self.tools[tool.name] = tool
        logger.info(f"注册工具: {tool.name}")
    
    def remember(
        self, 
        content: str, 
        memory_type: str = "short_term",
        importance: float = 0.5
    ):
        """
        记忆信息
        
        Args:
            content: 记忆内容
            memory_type: 记忆类型 (short_term / long_term)
            importance: 重要程度 0-1
        """
        memory = AgentMemory(
            timestamp=datetime.now().isoformat(),
            content=content,
            memory_type=memory_type,
            importance=importance
        )
        
        if memory_type == "short_term":
            self.short_term_memory.append(memory)
            # 保持短期记忆在限制内
            if len(self.short_term_memory) > self.max_short_term:
                self.short_term_memory.pop(0)
        else:
            self.long_term_memory.append(memory)
        
        logger.info(f"记忆: {content[:50]}...")
    
    def get_relevant_memories(self, query: str, limit: int = 5) -> List[AgentMemory]:
        """获取相关记忆"""
        all_memories = self.short_term_memory + self.long_term_memory
        # 简单实现：返回最近的记忆
        return sorted(
            all_memories,
            key=lambda m: m.timestamp,
            reverse=True
        )[:limit]
    
    async def think(self, input_data: str, context: Dict = None) -> str:
        """
        思考并生成响应
        
        Args:
            input_data: 输入数据
            context: 上下文信息
            
        Returns:
            生成的响应
        """
        # 获取相关记忆
        memories = self.get_relevant_memories(input_data)
        memory_context = "\n".join([m.content for m in memories])
        
        # 构建提示词
        prompt = f"""你是{self.name}，一个{self.role}。

相关记忆:
{memory_context}

用户输入: {input_data}

请给出专业的回复:"""
        
        # 这里应该调用实际的LLM API
        # 示例使用模拟响应
        response = f"[{self.name}] 收到您的请求: {input_data[:50]}..."
        
        # 记录思考过程
        self.remember(f"思考: {input_data} -> {response[:100]}")
        
        return response
    
    async def act(self, action_type: str, **params) -> AgentAction:
        """
        执行动作
        
        Args:
            action_type: 动作类型
            **params: 动作参数
            
        Returns:
            AgentAction对象
        """
        action = AgentAction(action_type=action_type, params=params)
        
        try:
            if action_type in self.tools:
                tool = self.tools[action_type]
                result = await tool.execute(**params)
                action.result = result
                action.success = True
                logger.info(f"动作执行成功: {action_type}")
            else:
                action.result = f"未知动作: {action_type}"
                action.success = False
                logger.warning(f"未知动作: {action_type}")
        except Exception as e:
            action.result = str(e)
            action.success = False
            logger.error(f"动作执行失败: {action_type}, 错误: {e}")
        
        self.action_history.append(action)
        return action
    
    async def run(self, input_data: str) -> Dict:
        """
        运行Agent完整流程
        
        Args:
            input_data: 输入数据
            
        Returns:
            包含思考和动作的结果
        """
        # 思考
        thought = await self.think(input_data)
        
        # 根据思考结果决定动作（简化示例）
        action_result = None
        if "搜索" in input_data or "search" in input_data.lower():
            action_result = await self.act("web_search", query=input_data)
        elif "区块链" in input_data or "blockchain" in input_data.lower():
            action_result = await self.act("blockchain", method="query")
        
        return {
            "thought": thought,
            "action": action_result.to_dict() if action_result else None,
            "agent_name": self.name,
            "timestamp": datetime.now().isoformat()
        }
    
    def to_dict(self) -> Dict:
        """导出Agent状态"""
        return {
            "name": self.name,
            "role": self.role,
            "llm_provider": self.llm_provider,
            "short_term_memory_count": len(self.short_term_memory),
            "long_term_memory_count": len(self.long_term_memory),
            "tools": list(self.tools.keys()),
            "action_history_count": len(self.action_history)
        }


class PaymentAgent(RebelAgent):
    """支付Agent示例"""
    
    def __init__(self, api_key: Optional[str] = None):
        super().__init__(
            name="PaymentAgent",
            role="智能支付处理Agent",
            llm_provider="openai",
            api_key=api_key
        )
        self.payment_history: List[Dict] = []
    
    async def process_payment(
        self, 
        amount: float, 
        recipient: str,
        description: str = ""
    ) -> Dict:
        """处理支付"""
        self.remember(f"处理支付: {amount} 给 {recipient}")
        
        # 这里集成实际的支付API
        payment_record = {
            "amount": amount,
            "recipient": recipient,
            "description": description,
            "timestamp": datetime.now().isoformat(),
            "status": "success",
            "tx_hash": "0x" + "a" * 64  # 模拟交易哈希
        }
        
        self.payment_history.append(payment_record)
        
        return payment_record
    
    async def analyze_spending(self) -> Dict:
        """分析支出"""
        total = sum(p["amount"] for p in self.payment_history)
        return {
            "total_payments": len(self.payment_history),
            "total_amount": total,
            "average_amount": total / len(self.payment_history) if self.payment_history else 0
        }


class TradingAgent(RebelAgent):
    """交易Agent示例"""
    
    def __init__(self, api_key: Optional[str] = None):
        super().__init__(
            name="TradingAgent",
            role="智能交易Agent",
            llm_provider="openai",
            api_key=api_key
        )
        self.positions: Dict[str, float] = {}
        self.trade_history: List[Dict] = []
    
    async def analyze_market(self, symbol: str) -> Dict:
        """分析市场"""
        # 这里集成实际的市场数据API
        self.remember(f"分析市场: {symbol}")
        
        return {
            "symbol": symbol,
            "price": 100.0,  # 模拟价格
            "trend": "up",
            "confidence": 0.75
        }
    
    async def execute_trade(
        self, 
        symbol: str, 
        side: str,  # buy / sell
        amount: float
    ) -> Dict:
        """执行交易"""
        self.remember(f"执行交易: {side} {amount} {symbol}")
        
        trade = {
            "symbol": symbol,
            "side": side,
            "amount": amount,
            "timestamp": datetime.now().isoformat(),
            "status": "success",
            "tx_hash": "0x" + "b" * 64
        }
        
        self.trade_history.append(trade)
        
        # 更新持仓
        if side == "buy":
            self.positions[symbol] = self.positions.get(symbol, 0) + amount
        else:
            self.positions[symbol] = self.positions.get(symbol, 0) - amount
        
        return trade
    
    async def get_portfolio(self) -> Dict:
        """获取投资组合"""
        return {
            "positions": self.positions,
            "trade_count": len(self.trade_history),
            "last_updated": datetime.now().isoformat()
        }


class MultiAgentSystem:
    """多Agent协作系统"""
    
    def __init__(self):
        self.agents: Dict[str, RebelAgent] = {}
        self.coordinator: Optional[RebelAgent] = None
    
    def register_agent(self, agent: RebelAgent):
        """注册Agent"""
        self.agents[agent.name] = agent
        logger.info(f"注册Agent: {agent.name}")
    
    def set_coordinator(self, agent: RebelAgent):
        """设置协调Agent"""
        self.coordinator = agent
        logger.info(f"设置协调Agent: {agent.name}")
    
    async def delegate_task(
        self, 
        task: str, 
        agent_names: List[str]
    ) -> List[Dict]:
        """委派任务给多个Agent"""
        results = []
        
        for name in agent_names:
            if name in self.agents:
                agent = self.agents[name]
                result = await agent.run(task)
                results.append({
                    "agent": name,
                    "result": result
                })
        
        return results
    
    async def collaborative_solve(self, problem: str) -> Dict:
        """协作解决问题"""
        # 协调Agent分析问题
        if self.coordinator:
            analysis = await self.coordinator.think(problem)
            
            # 根据分析结果分配任务
            # 简化示例：让所有Agent参与
            results = await self.delegate_task(problem, list(self.agents.keys()))
            
            return {
                "analysis": analysis,
                "collaborative_results": results,
                "timestamp": datetime.now().isoformat()
            }
        
        return {"error": "No coordinator set"}


# ============ 使用示例 ============

async def main():
    """主函数示例"""
    
    # 创建单个Agent
    agent = RebelAgent(
        name="RebelAssistant",
        role="通用AI助手",
        llm_provider="openai"
    )
    
    # 运行Agent
    result = await agent.run("帮我搜索Monad区块链的最新信息")
    print(json.dumps(result, ensure_ascii=False, indent=2))
    
    # 创建支付Agent
    payment_agent = PaymentAgent()
    payment_result = await payment_agent.process_payment(
        amount=100.0,
        recipient="0x123...",
        description="测试支付"
    )
    print("支付结果:", json.dumps(payment_result, ensure_ascii=False, indent=2))
    
    # 创建交易Agent
    trading_agent = TradingAgent()
    market_data = await trading_agent.analyze_market("ETH")
    print("市场分析:", json.dumps(market_data, ensure_ascii=False, indent=2))
    
    # 创建多Agent系统
    multi_agent = MultiAgentSystem()
    multi_agent.register_agent(payment_agent)
    multi_agent.register_agent(trading_agent)
    multi_agent.set_coordinator(agent)
    
    # 协作解决问题
    collaborative_result = await multi_agent.collaborative_solve(
        "分析当前市场并执行最优投资策略"
    )
    print("协作结果:", json.dumps(collaborative_result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    # 运行示例
    asyncio.run(main())