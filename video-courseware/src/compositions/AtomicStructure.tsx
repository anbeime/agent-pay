/**
 * 原子结构课件主组件
 * 
 * 知识点：初三化学 - 原子的结构
 * - 原子由原子核和核外电子构成
 * - 原子核由质子和中子构成
 * - 电子在核外分层排布
 * - 相对原子质量 = 质子数 + 中子数
 */

import React from 'react';
import {
  AbsoluteFill,
  Sequence,
  Series,
  useVideoConfig,
  interpolate,
  spring,
  useCurrentFrame,
} from 'remotion';
import { TitleSlide } from '../components/TitleSlide';
import { ContentSlide } from '../components/ContentSlide';
import { AtomModel, AtomComparison } from '../components/AtomModel';
import { themeColors } from '../utils/colors';

/**
 * 场景1：标题页
 */
const Scene1_Title: React.FC = () => {
  return (
    <TitleSlide
      title="原子的结构"
      subtitle="探索物质的最小单位"
      subject="初三化学"
      primaryColor="#00d4ff"
    />
  );
};

/**
 * 场景2：原子基本组成
 */
const Scene2_BasicStructure: React.FC = () => {
  const keyPoints = [
    '原子是构成物质的一种微粒',
    '原子由原子核和核外电子构成',
    '原子核位于原子中心，体积很小',
    '电子在核外空间作高速运动',
  ];

  return (
    <ContentSlide
      title="原子的基本组成"
      content="原子虽然很小，但也有一定的结构。原子是由居于原子中心的带正电的原子核和核外带负电的电子构成的。"
      keyPoints={keyPoints}
      primaryColor="#00d4ff"
    >
      {/* 钠原子模型作为示例 */}
      <AtomModel
        element="Na"
        protons={11}
        neutrons={12}
        electronShells={[2, 8, 1]}
        size={200}
      />
    </ContentSlide>
  );
};

/**
 * 场景3：原子核的组成
 */
const Scene3_Nucleus: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const theme = themeColors.education;

  const keyPoints = [
    '原子核由质子和中子构成',
    '质子带正电，中子不带电',
    '原子核所带正电荷数（核电荷数）= 质子数',
    '在原子中：质子数 = 核电荷数 = 核外电子数',
  ];

  // 粒子表格动画
  const tableOpacity = interpolate(
    frame,
    [60, 80],
    [0, 1],
    { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
  );

  return (
    <ContentSlide
      title="原子核的组成"
      content="原子核虽小，但它还可以再分。科学实验证明，原子核是由质子和中子构成的。"
      keyPoints={keyPoints}
      primaryColor="#ff6b6b"
    >
      {/* 粒子对比表格 */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          opacity: tableOpacity,
        }}
      >
        {/* 表头 */}
        <div
          style={{
            display: 'flex',
            gap: 20,
            padding: '12px 20px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: 8,
          }}
        >
          <div style={{ width: 100, fontSize: 20, color: '#fff', fontWeight: 600 }}>粒子</div>
          <div style={{ width: 100, fontSize: 20, color: '#fff', fontWeight: 600 }}>电性</div>
          <div style={{ width: 100, fontSize: 20, color: '#fff', fontWeight: 600 }}>位置</div>
        </div>

        {/* 质子 */}
        <ParticleRow
          name="质子"
          symbol="p+"
          charge="+1"
          location="原子核内"
          color="#ff4444"
          delay={80}
        />

        {/* 中子 */}
        <ParticleRow
          name="中子"
          symbol="n"
          charge="0"
          location="原子核内"
          color="#4488ff"
          delay={100}
        />

        {/* 电子 */}
        <ParticleRow
          name="电子"
          symbol="e-"
          charge="-1"
          location="核外"
          color="#ffff00"
          delay={120}
        />
      </div>
    </ContentSlide>
  );
};

/**
 * 粒子行组件
 */
const ParticleRow: React.FC<{
  name: string;
  symbol: string;
  charge: string;
  location: string;
  color: string;
  delay: number;
}> = ({ name, symbol, charge, location, color, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 200 },
  });

  const x = interpolate(progress, [0, 1], [30, 0]);

  return (
    <div
      style={{
        display: 'flex',
        gap: 20,
        padding: '12px 20px',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 8,
        borderLeft: `3px solid ${color}`,
        opacity: progress,
        transform: `translateX(${x}px)`,
      }}
    >
      <div style={{ width: 100, display: 'flex', alignItems: 'center', gap: 8 }}>
        <div
          style={{
            width: 16,
            height: 16,
            borderRadius: '50%',
            backgroundColor: color,
            boxShadow: `0 0 10px ${color}`,
          }}
        />
        <span style={{ fontSize: 18, color: '#fff' }}>{name}</span>
      </div>
      <div style={{ width: 100, fontSize: 18, color: '#888' }}>{charge}</div>
      <div style={{ width: 100, fontSize: 18, color: '#888' }}>{location}</div>
    </div>
  );
};

/**
 * 场景4：电子分层排布
 */
const Scene4_ElectronShells: React.FC = () => {
  const keyPoints = [
    '电子在原子核外分层排布',
    '第一层最多容纳2个电子',
    '第二层最多容纳8个电子',
    '最外层电子数决定元素化学性质',
  ];

  const examples = [
    'He (2)',
    'Ne (2,8)',
    'Ar (2,8,8)',
    'Na (2,8,1)',
  ];

  return (
    <ContentSlide
      title="电子的分层排布"
      content="电子在原子核外是分层排布的。电子总是先排布在能量最低的电子层里，然后依次排布在能量较高的电子层里。"
      keyPoints={keyPoints}
      examples={examples}
      primaryColor="#ffd93d"
    >
      {/* 展示碳原子的电子排布 */}
      <AtomModel
        element="C"
        protons={6}
        neutrons={6}
        electronShells={[2, 4]}
        size={180}
      />
    </ContentSlide>
  );
};

/**
 * 场景5：原子对比
 */
const Scene5_AtomComparison: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const theme = themeColors.education;

  const atoms = [
    { element: 'H', protons: 1, neutrons: 0, electronShells: [1] },
    { element: 'C', protons: 6, neutrons: 6, electronShells: [2, 4] },
    { element: 'O', protons: 8, neutrons: 8, electronShells: [2, 6] },
    { element: 'Na', protons: 11, neutrons: 12, electronShells: [2, 8, 1] },
  ];

  const titleProgress = spring({
    frame,
    fps,
    config: { damping: 200 },
  });

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(135deg, ${theme.background} 0%, ${theme.backgroundLight} 100%)`,
        padding: 60,
        fontFamily: '"Source Han Sans CN", "Microsoft YaHei", sans-serif',
      }}
    >
      {/* 标题 */}
      <div
        style={{
          fontSize: 48,
          fontWeight: 700,
          color: '#fff',
          opacity: titleProgress,
          marginBottom: 40,
        }}
      >
        不同原子的结构对比
      </div>

      {/* 原子对比展示 */}
      <AtomComparison atoms={atoms} startFrame={30} />

      {/* 底部说明 */}
      <div
        style={{
          position: 'absolute',
          bottom: 60,
          left: 60,
          right: 60,
          display: 'flex',
          justifyContent: 'center',
          gap: 40,
        }}
      >
        {['氢原子', '碳原子', '氧原子', '钠原子'].map((name, index) => {
          const opacity = interpolate(
            frame,
            [120 + index * 10, 140 + index * 10],
            [0, 1],
            { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
          );
          return (
            <div
              key={name}
              style={{
                fontSize: 22,
                color: theme.textMuted,
                opacity,
              }}
            >
              {name}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/**
 * 场景6：相对原子质量
 */
const Scene6_RelativeMass: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const theme = themeColors.education;

  const keyPoints = [
    '相对原子质量 ≈ 质子数 + 中子数',
    '电子质量很小，可忽略不计',
    '相对原子质量是一个比值，单位为1',
    '碳-12原子质量的1/12作为标准',
  ];

  // 公式动画
  const formulaOpacity = interpolate(
    frame,
    [40, 60],
    [0, 1],
    { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
  );

  const formulaScale = spring({
    frame: frame - 40,
    fps,
    config: { damping: 15, stiffness: 80 },
  });

  return (
    <ContentSlide
      title="相对原子质量"
      content="由于原子的质量很小，书写和使用都很不方便，因此科学上一般采用相对原子质量来表示。"
      keyPoints={keyPoints}
      primaryColor="#4ade80"
    >
      {/* 公式展示 */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 30,
          opacity: formulaOpacity,
          transform: `scale(${formulaScale})`,
        }}
      >
        <div
          style={{
            padding: '30px 50px',
            backgroundColor: 'rgba(74, 222, 128, 0.1)',
            borderRadius: 16,
            border: '2px solid rgba(74, 222, 128, 0.3)',
          }}
        >
          <div
            style={{
              fontSize: 48,
              color: '#fff',
              fontFamily: '"Times New Roman", serif',
              textAlign: 'center',
            }}
          >
            相对原子质量 = 质子数 + 中子数
          </div>
        </div>

        {/* 示例 */}
        <div
          style={{
            fontSize: 24,
            color: theme.textMuted,
          }}
        >
          例如：钠的相对原子质量 ≈ 11 + 12 = 23
        </div>
      </div>
    </ContentSlide>
  );
};

/**
 * 场景7：总结页
 */
const Scene7_Summary: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const theme = themeColors.education;

  const summaryItems = [
    { text: '原子 = 原子核 + 核外电子', delay: 0 },
    { text: '原子核 = 质子 + 中子', delay: 15 },
    { text: '质子数 = 电子数 = 核电荷数', delay: 30 },
    { text: '电子分层排布：K层2个，L层8个', delay: 45 },
    { text: '相对原子质量 = 质子数 + 中子数', delay: 60 },
  ];

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(135deg, ${theme.background} 0%, ${theme.backgroundLight} 100%)`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 60,
        fontFamily: '"Source Han Sans CN", "Microsoft YaHei", sans-serif',
      }}
    >
      {/* 标题 */}
      <div
        style={{
          fontSize: 56,
          fontWeight: 700,
          color: '#fff',
          marginBottom: 60,
          opacity: spring({ frame, fps, config: { damping: 200 } }),
        }}
      >
        课堂小结
      </div>

      {/* 总结要点 */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
        }}
      >
        {summaryItems.map((item, index) => {
          const progress = spring({
            frame: frame - 20 - item.delay,
            fps,
            config: { damping: 200 },
          });
          const x = interpolate(progress, [0, 1], [-40, 0]);

          return (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 20,
                opacity: progress,
                transform: `translateX(${x}px)`,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  backgroundColor: '#00d4ff',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  fontSize: 20,
                  color: '#fff',
                  fontWeight: 600,
                  boxShadow: '0 0 20px rgba(0, 212, 255, 0.5)',
                }}
              >
                {index + 1}
              </div>
              <div
                style={{
                  fontSize: 32,
                  color: '#fff',
                }}
              >
                {item.text}
              </div>
            </div>
          );
        })}
      </div>

      {/* 结束语 */}
      <div
        style={{
          position: 'absolute',
          bottom: 80,
          fontSize: 24,
          color: theme.textMuted,
          opacity: interpolate(
            frame,
            [150, 170],
            [0, 1],
            { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
          ),
        }}
      >
        掌握原子结构，理解物质构成的基础
      </div>
    </AbsoluteFill>
  );
};

/**
 * 完整的原子结构课件
 */
export const AtomicStructure: React.FC = () => {
  const { fps } = useVideoConfig();

  // 场景时长（秒）
  const sceneDurations = {
    title: 5,        // 标题页：5秒
    basic: 8,        // 基本组成：8秒
    nucleus: 8,      // 原子核：8秒
    shells: 8,       // 电子排布：8秒
    comparison: 6,   // 对比：6秒
    mass: 6,         // 相对原子质量：6秒
    summary: 8,      // 总结：8秒
  };

  return (
    <Series>
      {/* 场景1：标题页 */}
      <Series.Sequence durationInFrames={sceneDurations.title * fps}>
        <Scene1_Title />
      </Series.Sequence>

      {/* 场景2：原子基本组成 */}
      <Series.Sequence durationInFrames={sceneDurations.basic * fps}>
        <Scene2_BasicStructure />
      </Series.Sequence>

      {/* 场景3：原子核的组成 */}
      <Series.Sequence durationInFrames={sceneDurations.nucleus * fps}>
        <Scene3_Nucleus />
      </Series.Sequence>

      {/* 场景4：电子分层排布 */}
      <Series.Sequence durationInFrames={sceneDurations.shells * fps}>
        <Scene4_ElectronShells />
      </Series.Sequence>

      {/* 场景5：原子对比 */}
      <Series.Sequence durationInFrames={sceneDurations.comparison * fps}>
        <Scene5_AtomComparison />
      </Series.Sequence>

      {/* 场景6：相对原子质量 */}
      <Series.Sequence durationInFrames={sceneDurations.mass * fps}>
        <Scene6_RelativeMass />
      </Series.Sequence>

      {/* 场景7：总结 */}
      <Series.Sequence durationInFrames={sceneDurations.summary * fps}>
        <Scene7_Summary />
      </Series.Sequence>
    </Series>
  );
};

export default AtomicStructure;
