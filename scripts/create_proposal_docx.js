// YieldFlow 项目方案文档生成脚本
const { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle, AlignmentType } = require('docx');
const fs = require('fs');

async function createProposalDocument() {
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        // 封面
        new Paragraph({ spacing: { before: 2000 } }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "YieldFlow", bold: true, size: 72, color: "6366F1" })]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "AI-Driven Intelligent Yield Optimization Agent", size: 36, color: "666666" })]
        }),
        new Paragraph({ spacing: { before: 500 } }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "Rebel in Paradise AI Hackathon", size: 28, bold: true })]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "Track: Agent-native Payments", size: 24, color: "666666" })]
        }),
        new Paragraph({ spacing: { before: 2000 } }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "Version 1.0", size: 22 })]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "February 17, 2026", size: 22 })]
        }),

        // 目录
        new Paragraph({ pageBreakBefore: true, children: [new TextRun({ text: "Table of Contents", heading: HeadingLevel.HEADING_1 })] }),
        ...generateTOC(),

        // 第一章：项目概述
        new Paragraph({ pageBreakBefore: true, children: [new TextRun({ text: "1. Project Overview", heading: HeadingLevel.HEADING_1 })] }),
        new Paragraph({ children: [new TextRun({ text: "1.1 Project Name & Slogan", heading: HeadingLevel.HEADING_2 })] }),
        new Paragraph({ children: [new TextRun({ text: "Project Name: ", bold: true }), new TextRun("YieldFlow")] }),
        new Paragraph({ children: [new TextRun({ text: "Slogan: ", bold: true }), new TextRun("\"Let AI Optimize Your Yield, Let Crypto Flow Freely\"")] }),
        new Paragraph({ children: [new TextRun({ text: "Chinese Slogan: ", bold: true }), new TextRun("\"让AI优化收益，让资产自由流动\"")] }),
        
        new Paragraph({ children: [new TextRun({ text: "1.2 Selected Track", heading: HeadingLevel.HEADING_2 })] }),
        new Paragraph({ children: [new TextRun("Track: Agent-native Payments")] }),
        new Paragraph({ children: [new TextRun("YieldFlow focuses on the Agent-native Payments track, building an AI-driven intelligent yield optimization platform on the Monad blockchain. The platform automatically manages user funds across multiple DeFi protocols to maximize returns while minimizing risks.")] }),

        new Paragraph({ children: [new TextRun({ text: "1.3 Core Innovation Points", heading: HeadingLevel.HEADING_2 })] }),
        ...generateBulletPoints([
          "First AI Yield Optimizer on Monad: Leveraging Monad's high-throughput, low-latency characteristics to enable real-time strategy adjustment and rapid fund rebalancing",
          "Multi-Protocol Yield Aggregation: Automatically scans and compares yields across multiple DeFi protocols, selecting optimal allocation strategies",
          "Transparent AI Decision-Making: AI Agent's decision process is fully transparent and explainable, users can understand every investment decision",
          "Streaming Payments Support: Supports micro-payments and streaming payments, enabling new DeFi use cases",
          "Risk-Aware Optimization: Real-time risk assessment ensures fund safety while maximizing returns"
        ]),

        // 第二章：问题与机会
        new Paragraph({ pageBreakBefore: true, children: [new TextRun({ text: "2. Problem & Opportunity", heading: HeadingLevel.HEADING_1 })] }),
        new Paragraph({ children: [new TextRun({ text: "2.1 Market Pain Points", heading: HeadingLevel.HEADING_2 })] }),
        ...generateBulletPoints([
          "Protocol Fragmentation: Users face dozens of DeFi protocols, each with different yields, risks, and complexity",
          "High Management Costs: Manually tracking and reallocating funds across protocols is time-consuming and error-prone",
          "Information Asymmetry: Average users lack professional knowledge to identify optimal yield opportunities",
          "Timing Challenges: Yield opportunities are time-sensitive, manual operations often miss optimal entry points",
          "Risk Management Complexity: Understanding and managing risks across multiple protocols requires expertise"
        ]),

        new Paragraph({ children: [new TextRun({ text: "2.2 Target Users", heading: HeadingLevel.HEADING_2 })] }),
        createTargetUsersTable(),

        new Paragraph({ children: [new TextRun({ text: "2.3 Market Opportunity", heading: HeadingLevel.HEADING_2 })] }),
        ...generateBulletPoints([
          "DeFi TVL exceeds $50 billion, with yield optimization as a core need",
          "Monad's high performance (10,000 TPS) enables new optimization strategies not possible on other chains",
          "AI Agent technology has matured, making autonomous financial decisions reliable",
          "Growing demand for automated financial management among crypto holders"
        ]),

        // 第三章：解决方案
        new Paragraph({ pageBreakBefore: true, children: [new TextRun({ text: "3. Solution", heading: HeadingLevel.HEADING_1 })] }),
        new Paragraph({ children: [new TextRun({ text: "3.1 Product Features", heading: HeadingLevel.HEADING_2 })] }),
        ...generateBulletPoints([
          "One-Click Yield Optimization: Users deposit funds, AI automatically optimizes allocation",
          "Real-Time Yield Monitoring: Dashboard shows current APY, historical returns, and risk metrics",
          "Smart Rebalancing: Automatic fund reallocation when better opportunities arise",
          "Risk Assessment: AI evaluates protocol risks and adjusts exposure accordingly",
          "Gas Optimization: Batch operations and timing strategies to minimize transaction costs",
          "Multi-Strategy Support: Conservative, balanced, and aggressive strategies for different risk profiles"
        ]),

        new Paragraph({ children: [new TextRun({ text: "3.2 Technical Architecture", heading: HeadingLevel.HEADING_2 })] }),
        new Paragraph({ children: [new TextRun("YieldFlow consists of three core layers:")] }),
        new Paragraph({ children: [new TextRun({ text: "Frontend Layer (React + wagmi): ", bold: true }), new TextRun("User interface for deposit/withdrawal, strategy selection, and portfolio monitoring")] }),
        new Paragraph({ children: [new TextRun({ text: "AI Agent Layer (LangChain + LLM): ", bold: true }), new TextRun("Intelligent decision engine for yield analysis, risk assessment, and strategy execution")] }),
        new Paragraph({ children: [new TextRun({ text: "Smart Contract Layer (Solidity): ", bold: true }), new TextRun("Fund custody, strategy execution, and protocol integration on Monad")] }),

        new Paragraph({ children: [new TextRun({ text: "3.3 AI Agent Design", heading: HeadingLevel.HEADING_2 })] }),
        ...generateBulletPoints([
          "Data Collector Agent: Gathers real-time data from multiple DeFi protocols (yields, TVL, risks)",
          "Analysis Agent: Processes data using ML models and LLM reasoning to identify opportunities",
          "Decision Agent: Makes allocation decisions based on user risk preferences",
          "Execution Agent: Executes transactions via smart contracts with gas optimization",
          "Monitor Agent: Continuously monitors positions and triggers rebalancing when needed"
        ]),

        // 第四章：技术实现
        new Paragraph({ pageBreakBefore: true, children: [new TextRun({ text: "4. Technical Implementation", heading: HeadingLevel.HEADING_1 })] }),
        new Paragraph({ children: [new TextRun({ text: "4.1 Monad Blockchain Integration", heading: HeadingLevel.HEADING_2 })] }),
        ...generateBulletPoints([
          "Leverage Monad's 10,000 TPS for high-frequency strategy adjustments",
          "Use parallel execution for batch operations across multiple protocols",
          "Low latency enables real-time response to market opportunities",
          "EVM compatibility allows easy integration with existing DeFi protocols"
        ]),

        new Paragraph({ children: [new TextRun({ text: "4.2 Smart Contract Architecture", heading: HeadingLevel.HEADING_2 })] }),
        new Paragraph({ children: [new TextRun("Core Contracts:")] }),
        ...generateBulletPoints([
          "YieldVault: Main vault contract for user deposits and withdrawals",
          "StrategyManager: Manages different yield strategies and their allocations",
          "ProtocolIntegrations: Interfaces with external DeFi protocols (lending, DEX, yield farms)",
          "RiskController: Monitors and enforces risk parameters",
          "AgentController: Authorized AI Agent operations with safety checks"
        ]),

        new Paragraph({ children: [new TextRun({ text: "4.3 Agent Technology Stack", heading: HeadingLevel.HEADING_2 })] }),
        createTechStackTable(),

        // 第五章：商业模式
        new Paragraph({ pageBreakBefore: true, children: [new TextRun({ text: "5. Business Model", heading: HeadingLevel.HEADING_1 })] }),
        new Paragraph({ children: [new TextRun({ text: "5.1 Revenue Streams", heading: HeadingLevel.HEADING_2 })] }),
        ...generateBulletPoints([
          "Performance Fee: 10% of generated yield (charged on profits only)",
          "Management Fee: 0.5% annual management fee on AUM",
          "Premium Features: Advanced analytics and custom strategies for premium users",
          "Protocol Incentives: Revenue sharing from integrated protocols"
        ]),

        new Paragraph({ children: [new TextRun({ text: "5.2 Competitive Advantages", heading: HeadingLevel.HEADING_2 })] }),
        ...generateBulletPoints([
          "First-mover advantage on Monad with AI-native design",
          "Transparent and explainable AI decisions build user trust",
          "Superior performance through real-time optimization",
          "Lower operational costs through full automation"
        ]),

        // 第六章：团队与路线图
        new Paragraph({ pageBreakBefore: true, children: [new TextRun({ text: "6. Team & Roadmap", heading: HeadingLevel.HEADING_1 })] }),
        new Paragraph({ children: [new TextRun({ text: "6.1 Team Introduction", heading: HeadingLevel.HEADING_2 })] }),
        new Paragraph({ children: [new TextRun("The YieldFlow team consists of experienced professionals from blockchain, AI, and fintech backgrounds, with expertise in DeFi protocol development, machine learning, and smart contract security.")] }),

        new Paragraph({ children: [new TextRun({ text: "6.2 Development Roadmap", heading: HeadingLevel.HEADING_2 })] }),
        createRoadmapTable(),

        // 第七章：总结
        new Paragraph({ pageBreakBefore: true, children: [new TextRun({ text: "7. Summary", heading: HeadingLevel.HEADING_1 })] }),
        new Paragraph({ children: [new TextRun("YieldFlow represents the next generation of DeFi yield optimization, combining the power of AI Agents with Monad's high-performance blockchain infrastructure. By automating complex yield strategies and providing transparent, explainable decision-making, YieldFlow makes sophisticated DeFi accessible to all users while maximizing returns and minimizing risks.")] }),
        new Paragraph({ spacing: { before: 200 }, children: [new TextRun("Our vision is to become the leading AI-powered yield optimization platform on Monad, setting new standards for automated DeFi management and helping users achieve optimal returns with minimal effort.")] }),
      ]
    }]
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync('c:/D/compet/dcic/rebel/output/docs/项目方案_YieldFlow_20260217.docx', buffer);
  console.log('Project proposal document created successfully!');
}

function generateTOC() {
  const items = [
    "1. Project Overview",
    "2. Problem & Opportunity", 
    "3. Solution",
    "4. Technical Implementation",
    "5. Business Model",
    "6. Team & Roadmap",
    "7. Summary"
  ];
  return items.map(item => new Paragraph({ children: [new TextRun({ text: item, size: 22 })] }));
}

function generateBulletPoints(points) {
  return points.map(point => 
    new Paragraph({ 
      indent: { left: 360 },
      children: [new TextRun({ text: "• " + point })] 
    })
  );
}

function createTargetUsersTable() {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "User Type", bold: true })] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Description", bold: true })] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Needs", bold: true })] })] })
        ]
      }),
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ children: [new TextRun("Crypto Holders")] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun("Users holding crypto assets")] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun("Passive income from holdings")] })] })
        ]
      }),
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ children: [new TextRun("DeFi Enthusiasts")] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun("Active DeFi participants")] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun("Yield optimization tools")] })] })
        ]
      }),
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ children: [new TextRun("DAO Treasuries")] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun("Decentralized organizations")] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun("Treasury management")] })] })
        ]
      })
    ]
  });
}

function createTechStackTable() {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Component", bold: true })] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Technology", bold: true })] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Purpose", bold: true })] })] })
        ]
      }),
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ children: [new TextRun("Agent Framework")] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun("LangChain + AutoGen")] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun("Multi-agent orchestration")] })] })
        ]
      }),
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ children: [new TextRun("LLM Provider")] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun("Zhipu GLM-4 / KIMI")] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun("Reasoning & analysis")] })] })
        ]
      }),
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ children: [new TextRun("Data Processing")] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun("Pandas + NumPy")] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun("Yield calculations")] })] })
        ]
      }),
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ children: [new TextRun("Vector Store")] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun("Zilliz Milvus")] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun("Protocol knowledge base")] })] })
        ]
      })
    ]
  });
}

function createRoadmapTable() {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Phase", bold: true })] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Timeline", bold: true })] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Deliverables", bold: true })] })] })
        ]
      }),
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ children: [new TextRun("MVP")] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun("Feb 2026")] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun("Core vault, basic strategies")] })] })
        ]
      }),
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ children: [new TextRun("Alpha")] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun("Mar 2026")] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun("Multi-protocol, AI optimization")] })] })
        ]
      }),
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ children: [new TextRun("Beta")] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun("Apr 2026")] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun("Full features, security audit")] })] })
        ]
      }),
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ children: [new TextRun("Mainnet")] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun("Q2 2026")] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun("Production launch on Monad")] })] })
        ]
      })
    ]
  });
}

createProposalDocument().catch(console.error);
