// YieldFlow 路演PPT生成脚本
const { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle, AlignmentType } = require('docx');
const fs = require('fs');

async function createPitchDeck() {
  const slides = [
    // Slide 1: Cover
    {
      title: "YieldFlow",
      subtitle: "AI-Powered Yield Optimization on Monad",
      content: [
        "Rebel in Paradise AI Hackathon",
        "Track: Agent-native Payments",
        "February 2026"
      ]
    },
    // Slide 2: Problem
    {
      title: "The Problem",
      subtitle: "DeFi Yield Management is Complex",
      content: [
        "Protocol Fragmentation: 50+ DeFi protocols, each with different yields",
        "Manual Management: Time-consuming and error-prone",
        "Information Asymmetry: Average users can't identify best opportunities",
        "Timing Issues: Yield opportunities are time-sensitive",
        "Risk Blindness: Difficulty assessing cross-protocol risks"
      ]
    },
    // Slide 3: Solution
    {
      title: "Our Solution",
      subtitle: "AI Agent + Monad Blockchain",
      content: [
        "One-Click Optimization: Deposit and let AI handle the rest",
        "Multi-Protocol Aggregation: Automatic best-yield selection",
        "Risk-Aware Decisions: Real-time risk assessment",
        "Transparent AI: Explainable investment decisions",
        "Monad-Native: Leverage 10,000 TPS for instant rebalancing"
      ]
    },
    // Slide 4: Product Demo
    {
      title: "Product Demo",
      subtitle: "Simple, Intuitive, Powerful",
      content: [
        "Dashboard: Real-time portfolio overview",
        "Deposit: One-click fund deployment",
        "Strategies: Choose risk profile (Conservative/Balanced/Aggressive)",
        "Analytics: Track yield performance",
        "AI Insights: Market analysis and recommendations"
      ]
    },
    // Slide 5: Technical Architecture
    {
      title: "Technical Architecture",
      subtitle: "Three-Layer Design",
      content: [
        "Frontend: React + wagmi + viem (Web3 Integration)",
        "AI Agent: LangChain + Zhipu GLM-4 (Intelligent Decisions)",
        "Smart Contracts: Solidity + OpenZeppelin (Secure Execution)",
        "Blockchain: Monad (10,000 TPS, 1s Block Time)",
        "Data: Zilliz Milvus (Vector Knowledge Base)"
      ]
    },
    // Slide 6: AI Agent Design
    {
      title: "AI Agent Architecture",
      subtitle: "Multi-Agent Collaboration",
      content: [
        "Data Collector Agent: Gathers protocol data, prices, TVL",
        "Analysis Agent: Calculates risk-adjusted yields, predicts trends",
        "Decision Agent: Makes allocation decisions based on user profile",
        "Execution Agent: Executes on-chain with gas optimization",
        "Monitor Agent: 24/7 position monitoring and alerts"
      ]
    },
    // Slide 7: Smart Contracts
    {
      title: "Smart Contract Design",
      subtitle: "Secure, Modular, Upgradeable",
      content: [
        "YieldVault: ERC4626-compliant fund management",
        "StrategyManager: Multi-strategy allocation",
        "AgentController: AI agent authorization & safety",
        "RiskController: Real-time risk monitoring",
        "Features: Emergency pause, multi-sig, time-locked ops"
      ]
    },
    // Slide 8: Market Analysis
    {
      title: "Market Opportunity",
      subtitle: "$50B+ DeFi TVL, Growing Need",
      content: [
        "Total DeFi TVL: $50+ Billion globally",
        "Active DeFi Users: 5+ Million worldwide",
        "Yield Optimization Market: Underserved, fragmented",
        "Monad Opportunity: First high-performance yield optimizer",
        "AI + Blockchain: Perfect timing with mature tech stack"
      ]
    },
    // Slide 9: Competitive Advantage
    {
      title: "Why YieldFlow?",
      subtitle: "Our Competitive Edge",
      content: [
        "First on Monad: Native design for high-performance chain",
        "AI Transparency: Explainable decisions, not black box",
        "Risk Intelligence: Real-time, multi-factor risk assessment",
        "User Experience: Simple interface, complex AI underneath",
        "Non-Custodial: Users control their funds at all times"
      ]
    },
    // Slide 10: Business Model
    {
      title: "Business Model",
      subtitle: "Sustainable Revenue Streams",
      content: [
        "Performance Fee: 10% of generated yield",
        "Management Fee: 0.5% annual on AUM",
        "Premium Features: Advanced analytics, custom strategies",
        "Protocol Incentives: Revenue sharing from partners",
        "Projected: $500K ARR with $10M AUM"
      ]
    },
    // Slide 11: Roadmap
    {
      title: "Development Roadmap",
      subtitle: "Q1-Q2 2026",
      content: [
        "February 2026: MVP with core vault, basic strategies",
        "March 2026: Alpha with multi-protocol, AI optimization",
        "April 2026: Beta with full features, security audit",
        "Q2 2026: Mainnet launch on Monad",
        "Q3 2026: Cross-chain expansion, more protocols"
      ]
    },
    // Slide 12: Team
    {
      title: "Team",
      subtitle: "Blockchain + AI Expertise",
      content: [
        "DeFi Development: Smart contract architecture",
        "AI/ML: LangChain, LLM integration",
        "Frontend: React, Web3 development",
        "Security: Smart contract auditing background",
        "Advisors: Monad ecosystem partners"
      ]
    },
    // Slide 13: Ask
    {
      title: "What We're Looking For",
      subtitle: "Partnership & Growth",
      content: [
        "Monad Ecosystem Support: Integration resources",
        "Protocol Partnerships: Aave, Compound, Uniswap",
        "Community Building: User acquisition channels",
        "Strategic Investment: Seed round for expansion",
        "Technical Mentorship: Optimization guidance"
      ]
    },
    // Slide 14: Closing
    {
      title: "YieldFlow",
      subtitle: "Let AI Optimize Your Yield",
      content: [
        "Making DeFi Simple",
        "Making Yield Automatic",
        "Making Finance Intelligent",
        "",
        "Contact: team@yieldflow.io",
        "GitHub: github.com/yieldflow"
      ]
    }
  ];

  const doc = new Document({
    sections: [{
      properties: {},
      children: slides.map((slide, index) => [
        // Page break for all except first
        ...(index > 0 ? [new Paragraph({ pageBreakBefore: true })] : []),
        
        // Title
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 600, after: 200 },
          children: [new TextRun({ 
            text: slide.title, 
            bold: true, 
            size: 56,
            color: "6366F1"
          })]
        }),
        
        // Subtitle
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
          children: [new TextRun({ 
            text: slide.subtitle, 
            size: 28,
            color: "666666"
          })]
        }),
        
        // Content
        ...slide.content.map(item => 
          new Paragraph({
            spacing: { before: 200 },
            indent: { left: 720 },
            children: item ? [
              new TextRun({ text: "• ", size: 24 }),
              new TextRun({ text: item, size: 24 })
            ] : []
          })
        ),
        
        // Slide number
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          spacing: { before: 600 },
          children: [new TextRun({ 
            text: `${index + 1} / ${slides.length}`,
            size: 20,
            color: "999999"
          })]
        })
      ]).flat()
    }]
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync('c:/D/compet/dcic/rebel/output/ppt/路演PPT_YieldFlow_20260217.docx', buffer);
  console.log('Pitch deck created successfully!');
}

createPitchDeck().catch(console.error);
