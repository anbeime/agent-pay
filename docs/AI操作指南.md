# Rebel AI Hackathon - AI操作指南

## 快速开始

### 1. 全自动开发模式

直接发送以下指令：

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

### 2. 分步开发模式

#### 步骤1: 赛事分析
```markdown
请分析Rebel AI Hackathon赛事：
1. 读取 skills-config.yaml 了解三大赛道
2. 分析各赛道特点和创新方向
3. 推荐最适合的参赛方向
4. 生成赛道分析报告
```

#### 步骤2: 方案设计
```markdown
请设计参赛方案：
1. 确定参赛赛道
2. 构思创新项目想法
3. 设计系统架构
4. 生成项目方案文档
```

#### 步骤3: 智能合约开发
```markdown
请开发Monad智能合约：
1. 设计合约架构
2. 编写Solidity代码
3. 编写测试脚本
4. 生成合约文档
```

#### 步骤4: Agent开发
```markdown
请开发AI Agent：
1. 设计Agent架构
2. 集成LLM API
3. 实现核心功能
4. 编写Agent代码
```

#### 步骤5: 前端开发
```markdown
请开发前端应用：
1. 设计UI界面
2. 集成Web3连接
3. 实现交互功能
4. 编写前端代码
```

#### 步骤6: 测试优化
```markdown
请进行测试和优化：
1. 编写测试用例
2. 进行集成测试
3. 性能优化
4. 生成测试报告
```

#### 步骤7: 文档编写
```markdown
请编写项目文档：
1. 使用docx技能生成技术文档
2. 编写API文档
3. 编写部署指南
4. 保存到output/docs/
```

#### 步骤8: 演示材料
```markdown
请制作演示材料：
1. 使用pptx技能生成路演PPT
2. 生成系统架构图
3. 准备演示脚本
4. 保存到output/ppt/
```

#### 步骤9: 成果提交
```markdown
请整理提交材料：
1. 检查代码完整性
2. 整理文档材料
3. 创建提交清单
4. 准备README
```

## 常用指令

### 生成文档
```markdown
使用docx技能生成项目方案文档，包含：
1. 项目概述
2. 问题与解决方案
3. 技术架构
4. 商业模式
5. 团队介绍

保存到：output/docs/项目方案_Rebel_20260217.docx
```

### 生成PPT
```markdown
使用pptx技能生成路演PPT：
- 主题：AI + Blockchain创新应用
- 页数：12-15页
- 包含：问题、方案、产品、技术、市场、团队

保存到：output/ppt/路演PPT_Rebel_20260217.pptx
```

### 生成架构图
```markdown
使用hand-drawn-infographic技能生成系统架构图：
- 展示智能合约、Agent、前端的关系
- 展示数据流
- 手绘风格

保存到：output/assets/diagrams/系统架构图.png
```

## 技能配置

### 内置技能
- **docx**: Word文档创建
- **pptx**: PPT演示文稿
- **xlsx**: Excel数据处理
- **python**: Python代码开发
- **pdf**: PDF文档处理

### 本地技能
- **hand-drawn-infographic**: 手绘风格信息图
- **business-story-interview**: 商业故事包装

## 文件结构

```
rebel/
├── skills-config.yaml      # 技能配置
├── project.md              # 项目说明
├── CLAUDE.md              # 自动化指导
├── task-status.json       # 任务状态
├── progress.txt           # 进度记录
├── output/                # 输出目录
│   ├── docs/             # 文档
│   ├── ppt/              # PPT
│   ├── code/             # 代码
│   └── assets/           # 资源
└── scripts/              # 脚本
```

## 注意事项

1. **自动模式**: 全自动开发时无需反复确认
2. **进度记录**: 所有操作自动记录到progress.txt
3. **任务状态**: 自动更新task-status.json
4. **输出目录**: 所有成果保存到output/目录
5. **错误处理**: 遇到错误会尝试自动修复

## 参考文档

- [项目启动指南](项目启动指南.md)
- [CLAUDE.md](CLAUDE.md)
- [赛事资料汇总](docs/赛事资料汇总.md)

---

*最后更新: 2026-02-17*