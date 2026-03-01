/**
 * 原子模型组件
 * 展示原子核和电子云的可视化
 * 
 * 遵循 Remotion 核心原则：
 * 1. 所有动画使用 useCurrentFrame() 驱动
 * 2. 禁止使用 CSS transitions/animations
 * 3. 使用 spring() 创建自然动画
 */

import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from 'remotion';
import { particleColors, elementColors } from '../utils/colors';
import { useElectronOrbit } from '../utils/animations';

interface AtomModelProps {
  // 元素符号
  element?: string;
  // 质子数
  protons?: number;
  // 中子数
  neutrons?: number;
  // 电子层配置，如 [2, 8, 8]
  electronShells?: number[];
  // 动画开始延迟（帧数）
  startFrame?: number;
  // 模型大小
  size?: number;
  // 是否显示标签
  showLabels?: boolean;
}

/**
 * 原子核组件 - 显示质子和中子
 */
const Nucleus: React.FC<{
  protons: number;
  neutrons: number;
  size: number;
  delay: number;
}> = ({ protons, neutrons, size, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 原子核缩放动画
  const scale = spring({
    frame: frame - delay,
    fps,
    config: { damping: 15, stiffness: 100 },
  });

  // 原子核脉冲效果
  const pulse = interpolate(
    Math.sin((frame / fps) * 2 * Math.PI),
    [-1, 1],
    [1, 1.05]
  );

  const particleSize = size / 8;
  const particles = [];

  // 简化的粒子分布（随机排列）
  const totalParticles = protons + neutrons;
  for (let i = 0; i < totalParticles; i++) {
    const angle = (i / totalParticles) * 2 * Math.PI * 2.5; // 螺旋分布
    const radius = (size / 4) * (0.3 + (i / totalParticles) * 0.7);
    const x = Math.cos(angle + i * 0.5) * radius;
    const y = Math.sin(angle + i * 0.5) * radius;

    const isProton = i < protons;
    const particleOpacity = spring({
      frame: frame - delay - i * 2,
      fps,
      config: { damping: 200 },
    });

    particles.push(
      <div
        key={i}
        style={{
          position: 'absolute',
          width: particleSize,
          height: particleSize,
          borderRadius: '50%',
          backgroundColor: isProton ? particleColors.proton : particleColors.neutron,
          left: `calc(50% + ${x}px - ${particleSize / 2}px)`,
          top: `calc(50% + ${y}px - ${particleSize / 2}px)`,
          opacity: particleOpacity,
          boxShadow: isProton
            ? `0 0 ${particleSize / 2}px ${particleColors.proton}`
            : `0 0 ${particleSize / 2}px ${particleColors.neutron}`,
        }}
      />
    );
  }

  return (
    <div
      style={{
        position: 'absolute',
        width: size,
        height: size,
        transform: `translate(-50%, -50%) scale(${scale * pulse})`,
        left: '50%',
        top: '50%',
      }}
    >
      {particles}
    </div>
  );
};

/**
 * 电子轨道组件
 */
const ElectronOrbit: React.FC<{
  radius: number;
  electronCount: number;
  shellIndex: number;
  baseSpeed: number;
  delay: number;
}> = ({ radius, electronCount, shellIndex, baseSpeed, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 轨道淡入动画
  const opacity = spring({
    frame: frame - delay,
    fps,
    config: { damping: 200 },
  });

  // 电子位置
  const electronPositions = useElectronOrbit(
    shellIndex,
    electronCount,
    radius,
    baseSpeed
  );

  const electronSize = 12;

  return (
    <div
      style={{
        position: 'absolute',
        width: radius * 2,
        height: radius * 2,
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        opacity,
      }}
    >
      {/* 轨道圆环 */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          border: `1px solid rgba(255, 255, 0, 0.3)`,
          boxShadow: '0 0 10px rgba(255, 255, 0, 0.1)',
        }}
      />

      {/* 电子 */}
      {electronPositions.map((pos, i) => {
        // 电子出现的延迟动画
        const electronOpacity = spring({
          frame: frame - delay - i * 3,
          fps,
          config: { damping: 200 },
        });

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: electronSize,
              height: electronSize,
              borderRadius: '50%',
              backgroundColor: particleColors.electron,
              left: `calc(50% + ${pos.x}px - ${electronSize / 2}px)`,
              top: `calc(50% + ${pos.y}px - ${electronSize / 2}px)`,
              opacity: electronOpacity,
              boxShadow: `0 0 ${electronSize}px ${particleColors.electron}, 0 0 ${electronSize * 2}px rgba(255, 255, 0, 0.5)`,
            }}
          />
        );
      })}
    </div>
  );
};

/**
 * 完整的原子模型
 */
export const AtomModel: React.FC<AtomModelProps> = ({
  element = 'Na',
  protons = 11,
  neutrons = 12,
  electronShells = [2, 8, 1],
  startFrame = 0,
  size = 300,
  showLabels = true,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 基础轨道半径
  const baseOrbitRadius = size / 2 + 30;
  const orbitSpacing = 50;

  // 标签淡入
  const labelOpacity = interpolate(
    frame - startFrame,
    [120, 150],
    [0, 1],
    { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
  );

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {/* 电子云背景效果 */}
      <div
        style={{
          position: 'absolute',
          width: size * 2,
          height: size * 2,
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(0, 212, 255, 0.1) 0%, transparent 70%)`,
        }}
      />

      {/* 电子轨道层 */}
      {electronShells.map((count, index) => (
        <ElectronOrbit
          key={index}
          radius={baseOrbitRadius + index * orbitSpacing}
          electronCount={count}
          shellIndex={index}
          baseSpeed={0.3}
          delay={startFrame + 30 + index * 15}
        />
      ))}

      {/* 原子核 */}
      <Nucleus
        protons={protons}
        neutrons={neutrons}
        size={size / 3}
        delay={startFrame}
      />

      {/* 元素标签 */}
      {showLabels && (
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            opacity: labelOpacity,
          }}
        >
          <div
            style={{
              fontSize: 48,
              fontWeight: 'bold',
              color: '#fff',
              textShadow: '0 0 20px rgba(0, 212, 255, 0.8)',
            }}
          >
            {element}
          </div>
          <div
            style={{
              fontSize: 20,
              color: '#888',
              marginTop: 8,
            }}
          >
            质子: {protons} | 中子: {neutrons} | 电子: {electronShells.reduce((a, b) => a + b, 0)}
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};

/**
 * 原子结构对比组件 - 展示多个原子
 */
export const AtomComparison: React.FC<{
  atoms: Array<{
    element: string;
    protons: number;
    neutrons: number;
    electronShells: number[];
  }>;
  startFrame?: number;
}> = ({ atoms, startFrame = 0 }) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();

  const spacing = width / (atoms.length + 1);

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
      }}
    >
      {atoms.map((atom, index) => {
        const delay = startFrame + index * 30;
        const appearProgress = spring({
          frame: frame - delay,
          fps,
          config: { damping: 200 },
        });

        return (
          <div
            key={atom.element}
            style={{
              transform: `scale(${appearProgress})`,
              opacity: appearProgress,
            }}
          >
            <AtomModel
              element={atom.element}
              protons={atom.protons}
              neutrons={atom.neutrons}
              electronShells={atom.electronShells}
              size={180}
              showLabels={true}
            />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

export default AtomModel;
