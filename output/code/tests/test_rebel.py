#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Rebel AI Hackathon - 测试套件
Test Suite for Rebel AI Hackathon Project

运行测试:
    python -m pytest test_rebel.py -v
    或
    python test_rebel.py
"""

import unittest
import asyncio
import sys
import os
from pathlib import Path

# 添加父目录到路径
sys.path.insert(0, str(Path(__file__).parent.parent / "agent"))

# 导入被测试模块
from rebel_agent import (
    RebelAgent, 
    PaymentAgent, 
    TradingAgent,
    MultiAgentSystem,
    AgentMemory,
    AgentAction,
    BaseTool,
    WebSearchTool,
    BlockchainTool
)


class TestAgentMemory(unittest.TestCase):
    """测试Agent记忆功能"""
    
    def test_memory_creation(self):
        """测试记忆创建"""
        memory = AgentMemory(
            timestamp="2026-02-17T10:00:00",
            content="测试记忆内容",
            memory_type="short_term",
            importance=0.8
        )
        
        self.assertEqual(memory.content, "测试记忆内容")
        self.assertEqual(memory.memory_type, "short_term")
        self.assertEqual(memory.importance, 0.8)
    
    def test_memory_to_dict(self):
        """测试记忆转换为字典"""
        memory = AgentMemory(
            timestamp="2026-02-17T10:00:00",
            content="测试内容",
            memory_type="long_term",
            importance=0.9
        )
        
        data = memory.to_dict()
        self.assertEqual(data["content"], "测试内容")
        self.assertEqual(data["memory_type"], "long_term")


class TestBaseTools(unittest.TestCase):
    """测试基础工具"""
    
    def test_web_search_tool_creation(self):
        """测试搜索工具创建"""
        tool = WebSearchTool()
        self.assertEqual(tool.name, "web_search")
        self.assertEqual(tool.description, "搜索网页信息")
    
    def test_blockchain_tool_creation(self):
        """测试区块链工具创建"""
        tool = BlockchainTool("https://rpc.monad.xyz")
        self.assertEqual(tool.name, "blockchain")
        self.assertEqual(tool.rpc_url, "https://rpc.monad.xyz")


class TestRebelAgent(unittest.TestCase):
    """测试Rebel Agent核心功能"""
    
    def setUp(self):
        """测试前准备"""
        self.agent = RebelAgent(
            name="TestAgent",
            role="测试Agent",
            llm_provider="openai"
        )
    
    def test_agent_initialization(self):
        """测试Agent初始化"""
        self.assertEqual(self.agent.name, "TestAgent")
        self.assertEqual(self.agent.role, "测试Agent")
        self.assertEqual(self.agent.llm_provider, "openai")
        self.assertEqual(len(self.agent.short_term_memory), 0)
        self.assertEqual(len(self.agent.tools), 2)  # 默认2个工具
    
    def test_remember_short_term(self):
        """测试短期记忆"""
        self.agent.remember("测试短期记忆", "short_term", 0.7)
        self.assertEqual(len(self.agent.short_term_memory), 1)
        self.assertEqual(self.agent.short_term_memory[0].content, "测试短期记忆")
    
    def test_remember_long_term(self):
        """测试长期记忆"""
        self.agent.remember("测试长期记忆", "long_term", 0.9)
        self.assertEqual(len(self.agent.long_term_memory), 1)
        self.assertEqual(self.agent.long_term_memory[0].memory_type, "long_term")
    
    def test_short_term_memory_limit(self):
        """测试短期记忆限制"""
        # 添加超过限制的记忆
        for i in range(15):
            self.agent.remember(f"记忆{i}", "short_term")
        
        # 应该只保留最新的10个
        self.assertEqual(len(self.agent.short_term_memory), 10)
        self.assertEqual(self.agent.short_term_memory[-1].content, "记忆14")
    
    def test_get_relevant_memories(self):
        """测试获取相关记忆"""
        self.agent.remember("记忆1", "short_term")
        self.agent.remember("记忆2", "short_term")
        self.agent.remember("记忆3", "long_term")
        
        memories = self.agent.get_relevant_memories("查询", 2)
        self.assertEqual(len(memories), 2)
    
    def test_register_tool(self):
        """测试注册工具"""
        custom_tool = WebSearchTool()
        self.agent.register_tool(custom_tool)
        
        self.assertIn("web_search", self.agent.tools)
    
    def test_to_dict(self):
        """测试导出为字典"""
        data = self.agent.to_dict()
        
        self.assertEqual(data["name"], "TestAgent")
        self.assertEqual(data["role"], "测试Agent")
        self.assertIn("web_search", data["tools"])
        self.assertIn("blockchain", data["tools"])


class TestPaymentAgent(unittest.TestCase):
    """测试支付Agent"""
    
    def setUp(self):
        self.agent = PaymentAgent()
    
    def test_payment_agent_initialization(self):
        """测试支付Agent初始化"""
        self.assertEqual(self.agent.name, "PaymentAgent")
        self.assertEqual(self.agent.role, "智能支付处理Agent")
        self.assertEqual(len(self.agent.payment_history), 0)
    
    def test_process_payment(self):
        """测试处理支付"""
        async def async_test():
            result = await self.agent.process_payment(
                amount=100.0,
                recipient="0x123...",
                description="测试支付"
            )
            
            self.assertEqual(result["amount"], 100.0)
            self.assertEqual(result["recipient"], "0x123...")
            self.assertEqual(result["status"], "success")
            self.assertIn("tx_hash", result)
        
        asyncio.run(async_test())
    
    def test_analyze_spending(self):
        """测试支出分析"""
        async def async_test():
            # 先添加一些支付记录
            await self.agent.process_payment(100.0, "0x1")
            await self.agent.process_payment(200.0, "0x2")
            
            analysis = await self.agent.analyze_spending()
            
            self.assertEqual(analysis["total_payments"], 2)
            self.assertEqual(analysis["total_amount"], 300.0)
            self.assertEqual(analysis["average_amount"], 150.0)
        
        asyncio.run(async_test())


class TestTradingAgent(unittest.TestCase):
    """测试交易Agent"""
    
    def setUp(self):
        self.agent = TradingAgent()
    
    def test_trading_agent_initialization(self):
        """测试交易Agent初始化"""
        self.assertEqual(self.agent.name, "TradingAgent")
        self.assertEqual(self.agent.role, "智能交易Agent")
        self.assertEqual(len(self.agent.positions), 0)
    
    def test_analyze_market(self):
        """测试市场分析"""
        async def async_test():
            result = await self.agent.analyze_market("ETH")
            
            self.assertEqual(result["symbol"], "ETH")
            self.assertIn("price", result)
            self.assertIn("trend", result)
            self.assertIn("confidence", result)
        
        asyncio.run(async_test())
    
    def test_execute_trade_buy(self):
        """测试执行买入交易"""
        async def async_test():
            result = await self.agent.execute_trade("ETH", "buy", 10.0)
            
            self.assertEqual(result["symbol"], "ETH")
            self.assertEqual(result["side"], "buy")
            self.assertEqual(result["amount"], 10.0)
            self.assertEqual(result["status"], "success")
            
            # 检查持仓
            self.assertEqual(self.agent.positions["ETH"], 10.0)
        
        asyncio.run(async_test())
    
    def test_execute_trade_sell(self):
        """测试执行卖出交易"""
        async def async_test():
            # 先买入
            await self.agent.execute_trade("ETH", "buy", 10.0)
            # 再卖出
            result = await self.agent.execute_trade("ETH", "sell", 5.0)
            
            self.assertEqual(result["side"], "sell")
            self.assertEqual(self.agent.positions["ETH"], 5.0)
        
        asyncio.run(async_test())
    
    def test_get_portfolio(self):
        """测试获取投资组合"""
        async def async_test():
            await self.agent.execute_trade("ETH", "buy", 10.0)
            await self.agent.execute_trade("BTC", "buy", 5.0)
            
            portfolio = await self.agent.get_portfolio()
            
            self.assertEqual(portfolio["positions"]["ETH"], 10.0)
            self.assertEqual(portfolio["positions"]["BTC"], 5.0)
            self.assertEqual(portfolio["trade_count"], 2)
        
        asyncio.run(async_test())


class TestMultiAgentSystem(unittest.TestCase):
    """测试多Agent系统"""
    
    def setUp(self):
        self.system = MultiAgentSystem()
        self.agent1 = RebelAgent("Agent1", "角色1")
        self.agent2 = RebelAgent("Agent2", "角色2")
    
    def test_register_agent(self):
        """测试注册Agent"""
        self.system.register_agent(self.agent1)
        self.assertIn("Agent1", self.system.agents)
    
    def test_set_coordinator(self):
        """测试设置协调Agent"""
        coordinator = RebelAgent("Coordinator", "协调者")
        self.system.set_coordinator(coordinator)
        self.assertEqual(self.system.coordinator.name, "Coordinator")
    
    def test_delegate_task(self):
        """测试委派任务"""
        async def async_test():
            self.system.register_agent(self.agent1)
            self.system.register_agent(self.agent2)
            
            results = await self.system.delegate_task(
                "测试任务",
                ["Agent1", "Agent2"]
            )
            
            self.assertEqual(len(results), 2)
            self.assertEqual(results[0]["agent"], "Agent1")
            self.assertEqual(results[1]["agent"], "Agent2")
        
        asyncio.run(async_test())


class TestAgentIntegration(unittest.TestCase):
    """集成测试"""
    
    def test_full_workflow(self):
        """测试完整工作流程"""
        async def async_test():
            # 创建Agent
            payment_agent = PaymentAgent()
            trading_agent = TradingAgent()
            
            # 创建多Agent系统
            multi_system = MultiAgentSystem()
            multi_system.register_agent(payment_agent)
            multi_system.register_agent(trading_agent)
            
            # 执行交易
            trade_result = await trading_agent.execute_trade("ETH", "buy", 10.0)
            self.assertTrue(trade_result["status"], "success")
            
            # 执行支付
            payment_result = await payment_agent.process_payment(
                100.0, "0x123", "交易费用"
            )
            self.assertTrue(payment_result["status"], "success")
            
            # 验证状态
            portfolio = await trading_agent.get_portfolio()
            self.assertEqual(portfolio["positions"]["ETH"], 10.0)
            
            spending = await payment_agent.analyze_spending()
            self.assertEqual(spending["total_amount"], 100.0)
        
        asyncio.run(async_test())
    
    def test_memory_persistence(self):
        """测试记忆持久性"""
        agent = RebelAgent("MemoryTest", "测试")
        
        # 添加记忆
        agent.remember("重要信息", "long_term", 0.9)
        agent.remember("临时信息", "short_term", 0.3)
        
        # 验证记忆存在
        self.assertEqual(len(agent.long_term_memory), 1)
        self.assertEqual(len(agent.short_term_memory), 1)
        
        # 验证记忆内容
        long_term = agent.get_relevant_memories("重要", 1)
        self.assertEqual(long_term[0].importance, 0.9)


class TestAgentPerformance(unittest.TestCase):
    """性能测试"""
    
    def test_memory_performance(self):
        """测试记忆性能"""
        agent = RebelAgent("PerfTest", "性能测试")
        
        # 批量添加记忆
        import time
        start = time.time()
        
        for i in range(100):
            agent.remember(f"记忆{i}", "short_term")
        
        elapsed = time.time() - start
        
        # 应该在合理时间内完成
        self.assertLess(elapsed, 1.0)
        self.assertEqual(len(agent.short_term_memory), 10)  # 限制为10
    
    def test_concurrent_actions(self):
        """测试并发动作"""
        async def async_test():
            agent = RebelAgent("Concurrent", "并发测试")
            
            # 并发执行多个动作
            tasks = [
                agent.act("web_search", query="test1"),
                agent.act("web_search", query="test2"),
                agent.act("web_search", query="test3"),
            ]
            
            results = await asyncio.gather(*tasks)
            
            self.assertEqual(len(results), 3)
            for result in results:
                self.assertIsInstance(result, AgentAction)
        
        asyncio.run(async_test())


def run_tests():
    """运行所有测试"""
    # 创建测试套件
    loader = unittest.TestLoader()
    suite = unittest.TestSuite()
    
    # 添加测试类
    suite.addTests(loader.loadTestsFromTestCase(TestAgentMemory))
    suite.addTests(loader.loadTestsFromTestCase(TestBaseTools))
    suite.addTests(loader.loadTestsFromTestCase(TestRebelAgent))
    suite.addTests(loader.loadTestsFromTestCase(TestPaymentAgent))
    suite.addTests(loader.loadTestsFromTestCase(TestTradingAgent))
    suite.addTests(loader.loadTestsFromTestCase(TestMultiAgentSystem))
    suite.addTests(loader.loadTestsFromTestCase(TestAgentIntegration))
    suite.addTests(loader.loadTestsFromTestCase(TestAgentPerformance))
    
    # 运行测试
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    
    return result.wasSuccessful()


if __name__ == '__main__':
    success = run_tests()
    sys.exit(0 if success else 1)