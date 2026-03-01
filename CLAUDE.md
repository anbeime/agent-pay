# CLAUDE.md - Rebel in Paradise AI Hackathon 自动化开发指导

> **赛事**: Rebel in Paradise AI Hackathon  
> **主办方**: OpenBuild & Monad  
> **官网**: https://rebel.openbuild.xyz/  
> **开发模式**: 🚀 全自动持续开发（无需反复确认）

---

## 🎯 核心原则

**本项目的开发采用全自动模式，AI助手应：**

1. **自主决策**: 根据配置和上下文自主决定下一步行动
2. **持续执行**: 完成一个任务后立即开始下一个，无需等待确认
3. **自我验证**: 自动检查结果是否符合要求
4. **自动修复**: 发现问题时尝试自动修复，无法修复才报告
5. **完整记录**: 所有操作记录到 progress.txt

---

## 🚀 自动化开发工作流

### 启动开发（只需一次人工指令）

```markdown
请为"Rebel in Paradise AI Hackathon"进行全自动开发。

操作要求：
1. 读取 skills-config.yaml 了解项目配置
2. 读取 task-status.json 了解当前任务状态
3. 按照任务清单持续开发，无需等待确认
4. 所有输出保存到 output/ 目录
5. 记录进度到 progress.txt
6. 直到所有任务完成或遇到无法解决的问题

开始执行。
```

---

## 📋 任务清单（开发路线图）

### Task 1: 赛事分析与赛道选择
**状态**: pending → 开发中 → completed  
**预计耗时**: 60分钟

```yaml
title: "赛事分析与赛道选择"
description: "深入理解Rebel赛事要求，选择适合的赛道方向"
steps:
  1: "赛事理解"
     - 理解三大赛道特点
     - 分析各赛道创新方向
     - 评估团队技术匹配度
     
  2: "赛道选择"
     - Agent-native Payments: 支付创新
     - Intelligent Markets: 市场智能
     - Agent-powered Apps: Agent应用
     
  3: "技术路线确定"
     - Monad区块链集成方案
     - AI Agent技术选型
     - 前后端技术栈选择
```

---

### Task 2: 创意构思与方案设计
**状态**: pending → 开发中 → completed  
**预计耗时**: 120分钟

```yaml
title: "创意构思与方案设计"
description: "构思创新项目方案，设计系统架构"
steps:
  1: "创意构思"
     - 头脑风暴创新点
     - 分析竞品与差异化
     - 确定核心价值主张
     
  2: "方案设计"
     - 产品功能规划
     - 用户流程设计
     - 商业模式设计（如适用）
     
  3: "架构设计"
     - 系统架构图
     - 智能合约设计
     - Agent架构设计
     - 数据流设计
```

---

### Task 3: 智能合约开发
**状态**: pending → 开发中 → completed  
**预计耗时**: 180分钟

```yaml
title: "智能合约开发"
description: "开发Monad链上智能合约"
steps:
  1: "合约设计"
     - 定义合约接口
     - 设计数据结构
     - 安全考量
     
  2: "合约实现"
     - 使用Solidity编写合约
     - 实现核心功能逻辑
     - 添加事件与错误处理
     
  3: "合约测试"
     - 编写单元测试
     - 进行安全审计检查
     - 部署到测试网
     
  4: "文档编写"
     - 合约接口文档
     - 部署指南
```

---

### Task 4: AI Agent开发
**状态**: pending → 开发中 → completed  
**预计耗时**: 240分钟

```yaml
title: "AI Agent开发"
description: "开发核心AI Agent逻辑"
steps:
  1: "Agent设计"
     - 定义Agent角色与能力
     - 设计Agent工作流
     - 确定知识库与工具
     
  2: "核心逻辑开发"
     - 实现Agent推理引擎
     - 集成LLM API (KIMI/智谱/豆包)
     - 实现工具调用
     
  3: "多Agent协作（如适用）"
     - 设计Agent通信协议
     - 实现任务分配
     - 协调决策机制
     
  4: "记忆与学习"
     - 实现短期记忆
     - 设计长期记忆存储
     - 反馈学习机制
```

---

### Task 5: 前端应用开发
**状态**: pending → 开发中 → completed  
**预计耗时**: 180分钟

```yaml
title: "前端应用开发"
description: "开发用户交互界面"
steps:
  1: "UI/UX设计"
     - 设计用户界面
     - 制作原型图
     - 确定设计系统
     
  2: "前端实现"
     - 搭建React/Vue项目
     - 集成Web3连接 (wagmi/viem)
     - 实现核心页面
     
  3: "功能集成"
     - 集成智能合约调用
     - 集成Agent交互
     - 实现实时数据展示
     
  4: "优化与测试"
     - 响应式适配
     - 性能优化
     - 用户体验测试
```

---

### Task 6: 集成测试与优化
**状态**: pending → 开发中 → completed  
**预计耗时**: 120分钟

```yaml
title: "集成测试与优化"
description: "进行系统集成测试和性能优化"
steps:
  1: "功能测试"
     - 端到端流程测试
     - 边界条件测试
     - 异常处理测试
     
  2: "智能合约测试"
     - 合约功能验证
     - 安全测试
     - Gas优化
     
  3: "Agent测试"
     - 行为一致性测试
     - 响应质量评估
     - 错误恢复测试
     
  4: "性能优化"
     - 加载速度优化
     - 交互响应优化
     - 资源使用优化
```

---

### Task 7: 项目文档编写
**状态**: pending → 开发中 → completed  
**预计耗时**: 90分钟

```yaml
title: "项目文档编写"
description: "编写完整的项目文档"
steps:
  1: "白皮书编写"
     - 项目概述
     - 问题与解决方案
     - 技术架构
     - 商业模式
     - 团队介绍
     
  2: "技术文档"
     - 系统架构说明
     - API接口文档
     - 部署指南
     - 使用说明
     
  3: "使用 docx 技能生成"
     - 生成项目方案文档
     - 生成技术文档
     - 保存到 output/docs/
```

---

### Task 8: 演示材料制作
**状态**: pending → 开发中 → completed  
**预计耗时**: 120分钟

```yaml
title: "演示材料制作"
description: "制作路演PPT和演示视频"
steps:
  1: "路演PPT制作"
     - 使用 pptx 技能生成
     - 包含12-15页内容
     - 涵盖所有必要章节
     - 保存到 output/ppt/
     
  2: "演示视频脚本"
     - 编写功能演示脚本
     - 设计场景展示
     - 准备旁白文案
     
  3: "支撑材料"
     - 系统架构图
     - 产品截图
     - 演示视频录制
```

---

### Task 9: 成果整理与提交
**状态**: pending → 开发中 → completed  
**预计耗时**: 60分钟

```yaml
title: "成果整理与提交"
description: "整理所有成果并准备提交"
steps:
  1: "材料检查"
     - 检查代码完整性
     - 验证文档准确性
     - 确认演示材料齐全
     
  2: "生成提交清单"
     - 创建 提交材料清单.md
     - 核对提交要求
     - 准备README
     
  3: "最终打包"
     - 整理代码仓库
     - 打包文档材料
     - 准备演示链接
```

---

## 🤖 AI自主决策规则

### 自动确认（无需人工干预）

- 文件保存成功 → 自动继续
- 技能调用成功 → 自动继续
- 格式符合要求 → 自动继续
- 任务步骤完成 → 自动开始下一任务

### 需要报告的情况

- 技能调用失败（重试3次后）
- 文件保存失败
- 任务描述不明确
- 需要人工决策

---

## 📝 进度记录规范

### progress.txt 格式

```markdown
## [日期时间] - Task [ID]: [任务标题]

### 状态: [completed / in-progress / failed]

### 已完成:
- [具体完成的内容]

### 遇到的问题:
- [问题描述]

### 下一步:
- [下一步计划]
```

---

## 🎨 输出规范

### 文件命名

```
项目方案:      项目方案_Rebel_20260217.docx
技术文档:      技术文档_Rebel_20260217.docx
演示PPT:       路演PPT_Rebel_20260217.pptx
提交清单:      提交材料清单.md
进度记录:      progress.txt
```

### 目录结构

```
output/
├── docs/
│   ├── 项目方案_Rebel_20260217.docx
│   └── 技术文档_Rebel_20260217.docx
├── ppt/
│   └── 路演PPT_Rebel_20260217.pptx
├── code/
│   ├── contracts/        # 智能合约
│   ├── agent/           # Agent代码
│   ├── frontend/        # 前端代码
│   └── tests/           # 测试代码
└── assets/
    ├── screenshots/     # 系统截图
    ├── diagrams/       # 架构图
    └── demo/          # 演示视频
```

---

## 🛠️ 推荐技能使用

### 文档编写
- **docx技能**: 编写项目方案、技术文档
- **pptx技能**: 制作路演PPT

### 代码开发
- **Python技能**: Agent开发、数据分析
- **JavaScript/TypeScript技能**: 前端开发

### 可视化
- **hand-drawn-infographic技能**: 系统架构图、流程图

### 辅助工具
- **WebSearch**: 技术调研、框架文档查询
- **WebFetch**: 获取技术文档

---

## 📊 评审维度对应

| 评审维度 | 权重 | 关键内容 |
|---------|------|---------|
| 技术创新性 | 30% | AI Agent创新、区块链集成、架构先进性 |
| 产品完整性 | 25% | 功能完整、用户体验、代码质量 |
| 商业潜力 | 25% | 市场机会、商业模式、竞争优势 |
| 演示效果 | 20% | 路演表现、演示清晰度、问题回答 |

---

## 📚 参考资源

### 赛事信息
- 官网：https://rebel.openbuild.xyz/
- 报名：https://mojo.devnads.com/events/10

### 技术资源
- Monad文档：https://docs.monad.xyz/
- Hardhat：https://hardhat.org/
- Foundry：https://book.getfoundry.sh/
- wagmi：https://wagmi.sh/

### AI平台
- KIMI：https://kimi.moonshot.cn/
- 智谱AI：https://open.bigmodel.cn/
- 阶跃星辰：https://platform.stepfun.com/

---

**最后更新**：2026-02-17  
**版本**：v1.0 - 全自动开发模式