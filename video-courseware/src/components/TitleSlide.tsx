/**
 * 标题页组件
 * 用于课件开场，展示课程标题和副标题
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
import { themeColors } from '../utils/colors';

interface TitleSlideProps {
  // 主标题
  title: string;
  // 副标题
  subtitle?: string;
  // 学科标识
  subject?: string;
  // 主色调
  primaryColor?: string;
  // 背景渐变
  backgroundGradient?: string;
}

export const TitleSlide: React.FC<TitleSlideProps> = ({
  title,
  subtitle,
  subject = '化学',
  primaryColor = '#00d4ff',
  backgroundGradient,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const theme = themeColors.education;

  // 标题缩放和淡入动画
  const titleScale = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 80 },
  });

  const titleOpacity = interpolate(
    frame,
    [0, 15],
    [0, 1],
    { extrapolateRight: 'clamp' }
  );

  // 副标题延迟动画
  const subtitleOpacity = interpolate(
    frame,
    [30, 50],
    [0, 1],
    { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
  );

  const subtitleY = interpolate(
    frame,
    [30, 50],
    [30, 0],
    { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
  );

  // 学科标签动画
  const badgeScale = spring({
    frame: frame - 20,
    fps,
    config: { damping: 12, stiffness: 100 },
  });

  // 装饰粒子动画
  const particles = [];
  for (let i = 0; i < 20; i++) {
    const delay = i * 5;
    const x = (width * (i % 5)) / 5 + 50;
    const y = (height * Math.floor(i / 5)) / 4 + 50;
    const opacity = interpolate(
      frame - delay,
      [0, 20, 100, 120],
      [0, 0.6, 0.6, 0],
      { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
    );
    const scale = interpolate(
      Math.sin((frame / fps) * Math.PI + i),
      [-1, 1],
      [0.8, 1.2]
    );

    particles.push(
      <div
        key={i}
        style={{
          position: 'absolute',
          left: x,
          top: y,
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: i % 3 === 0 ? primaryColor : i % 3 === 1 ? '#ff6b6b' : '#ffd93d',
          opacity,
          transform: `scale(${scale})`,
          boxShadow: `0 0 20px ${i % 3 === 0 ? primaryColor : i % 3 === 1 ? '#ff6b6b' : '#ffd93d'}`,
        }}
      />
    );
  }

  // 背景动画
  const bgGradient = backgroundGradient || `linear-gradient(135deg, ${theme.background} 0%, ${theme.backgroundLight} 100%)`;

  // 中心光晕动画
  const glowPulse = interpolate(
    Math.sin((frame / fps) * Math.PI * 0.5),
    [-1, 1],
    [0.8, 1.2]
  );

  return (
    <AbsoluteFill
      style={{
        background: bgGradient,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: '"Source Han Sans CN", "Microsoft YaHei", sans-serif',
        overflow: 'hidden',
      }}
    >
      {/* 装饰粒子 */}
      {particles}

      {/* 中心光晕 */}
      <div
        style={{
          position: 'absolute',
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${primaryColor}33 0%, transparent 70%)`,
          transform: `scale(${glowPulse})`,
        }}
      />

      {/* 学科标签 */}
      <div
        style={{
          position: 'absolute',
          top: 60,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          transform: `scale(${badgeScale})`,
          opacity: badgeScale,
        }}
      >
        <div
          style={{
            padding: '8px 24px',
            backgroundColor: primaryColor,
            borderRadius: 20,
            color: '#fff',
            fontSize: 18,
            fontWeight: 600,
            letterSpacing: 2,
          }}
        >
          {subject}
        </div>
        <div
          style={{
            color: theme.textMuted,
            fontSize: 16,
          }}
        >
          动态课件
        </div>
      </div>

      {/* 主标题 */}
      <div
        style={{
          fontSize: 80,
          fontWeight: 700,
          color: theme.text,
          textAlign: 'center',
          opacity: titleOpacity,
          transform: `scale(${titleScale})`,
          textShadow: `0 0 40px ${primaryColor}66`,
          letterSpacing: 4,
        }}
      >
        {title}
      </div>

      {/* 副标题 */}
      {subtitle && (
        <div
          style={{
            marginTop: 30,
            fontSize: 32,
            color: theme.textMuted,
            textAlign: 'center',
            opacity: subtitleOpacity,
            transform: `translateY(${subtitleY}px)`,
          }}
        >
          {subtitle}
        </div>
      )}

      {/* 底部装饰线 */}
      <div
        style={{
          position: 'absolute',
          bottom: 80,
          width: interpolate(
            frame,
            [60, 100],
            [0, 200],
            { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
          ),
          height: 4,
          backgroundColor: primaryColor,
          borderRadius: 2,
          boxShadow: `0 0 20px ${primaryColor}`,
        }}
      />
    </AbsoluteFill>
  );
};

export default TitleSlide;
