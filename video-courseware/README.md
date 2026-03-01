# 化学动态课件 - 原子结构

基于 Remotion 框架的初三化学教学动画视频课件。

## 课件内容

**知识点**：原子的结构（初三化学上册）

### 课程结构

| 场景 | 内容 | 时长 |
|------|------|------|
| 1. 标题页 | 课程标题和导言 | 5秒 |
| 2. 基本组成 | 原子由原子核和电子构成 | 8秒 |
| 3. 原子核 | 质子和中子的组成 | 8秒 |
| 4. 电子排布 | 电子分层排布规律 | 8秒 |
| 5. 原子对比 | 不同原子的结构对比 | 6秒 |
| 6. 相对原子质量 | 质量计算方法 | 6秒 |
| 7. 总结 | 课堂小结 | 8秒 |

**总时长**：约49秒

**渲染输出**：`out/atomic-structure.mp4` (约5.8MB)

## 项目结构

```
chemistry-courseware/
├── src/
│   ├── components/          # 可复用组件
│   │   ├── AtomModel.tsx        # 原子模型动画
│   │   ├── TitleSlide.tsx       # 标题页
│   │   └── ContentSlide.tsx     # 内容页
│   ├── compositions/        # 课件组合
│   │   └── AtomicStructure.tsx  # 原子结构课件
│   ├── utils/               # 工具函数
│   │   ├── animations.ts        # 动画工具
│   │   └── colors.ts            # 配色方案
│   ├── Root.tsx             # 入口文件
│   └── index.ts             # 导出索引
├── package.json
├── tsconfig.json
└── remotion.config.ts
```

## 快速开始

### 安装依赖

```bash
cd chemistry-courseware
npm install
```

### 本地预览

```bash
npm run dev
```

打开浏览器访问 Remotion Studio，可以实时预览和调试课件。

### 渲染视频

```bash
# 渲染原子结构课件
npm run render:atomic

# 输出位置
# out/atomic-structure.mp4
```

## 核心组件

### AtomModel - 原子模型

展示原子核和电子云的可视化动画：

```tsx
<AtomModel
  element="Na"           // 元素符号
  protons={11}           // 质子数
  neutrons={12}          // 中子数
  electronShells={[2, 8, 1]}  // 电子层配置
  size={300}             // 模型大小
  showLabels={true}      // 显示标签
/>
```

### TitleSlide - 标题页

课件开场标题展示：

```tsx
<TitleSlide
  title="原子的结构"
  subtitle="探索物质的最小单位"
  subject="初三化学"
  primaryColor="#00d4ff"
/>
```

### ContentSlide - 内容页

知识点内容展示：

```tsx
<ContentSlide
  title="原子的基本组成"
  content="概述文字..."
  keyPoints={['要点1', '要点2']}
  examples={['示例1', '示例2']}
  primaryColor="#00d4ff"
>
  {/* 子组件 */}
</ContentSlide>
```

## 动画原则

本项目严格遵循 Remotion 动画原则：

1. **帧驱动动画**：所有动画使用 `useCurrentFrame()` 驱动
2. **禁止 CSS 动画**：CSS transitions/animations 不会正确渲染
3. **使用 spring**：推荐使用 `spring()` 函数创建自然动画
4. **时间计算**：用秒计算时间，乘以 `fps` 转换为帧数

## 配色方案

### 元素配色（CPK 着色）

| 元素 | 颜色 | 说明 |
|------|------|------|
| H | #FFFFFF | 白色 |
| C | #909090 | 灰色 |
| N | #3050F8 | 蓝色 |
| O | #FF0D0D | 红色 |
| Na | #AB5CF2 | 紫色 |

### 粒子配色

| 粒子 | 颜色 |
|------|------|
| 质子 | #ff4444 |
| 中子 | #4488ff |
| 电子 | #ffff00 |

## 扩展开发

### 添加新的课件

1. 在 `src/compositions/` 创建新的课件组件
2. 在 `src/Root.tsx` 注册新的 Composition
3. 添加渲染脚本到 `package.json`

### 添加新的组件

1. 在 `src/components/` 创建组件文件
2. 在 `src/index.ts` 导出组件
3. 遵循 Remotion 动画原则

## 技术栈

- [Remotion](https://remotion.dev/) - React 视频框架
- [React 18](https://react.dev/) - UI 框架
- [TypeScript](https://www.typescriptlang.org/) - 类型支持
- [Three.js](https://threejs.org/) - 3D 渲染（可选）

## 参考资料

- [Remotion 官方文档](https://remotion.dev/docs)
- [初三化学人教版教材](../初三/化学/)
- [chemistry-courseware 技能说明](../chemistry-courseware.skill/SKILL.md)
