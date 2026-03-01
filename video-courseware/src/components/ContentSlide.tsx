/**
 * 内容页组件
 * 用于展示知识点内容、要点列表和示意图
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

interface ContentSlideProps {
  // 标题
  title: string;
  // 内容文字
  content?: string;
  // 要点列表
  keyPoints?: string[];
  // 示例列表
  examples?: string[];
  // 主色调
  primaryColor?: string;
  // 次要颜色
  secondaryColor?: string;
  // 子组件（如动画模型）
  children?: React.ReactNode;
}

/**
 * 要点项目组件
 */
const KeyPoint: React.FC<{
  text: string;
  index: number;
  primaryColor: string;
  delay: number;
}> = ({ text, index, primaryColor, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - delay - index * 10,
    fps,
    config: { damping: 200 },
  });

  const x = interpolate(progress, [0, 1], [-50, 0]);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 16,
        marginBottom: 20,
        opacity: progress,
        transform: `translateX(${x}px)`,
      }}
    >
      {/* 项目符号 */}
      <div
        style={{
          width: 12,
          height: 12,
          borderRadius: '50%',
          backgroundColor: primaryColor,
          marginTop: 8,
          flexShrink: 0,
          boxShadow: `0 0 10px ${primaryColor}`,
        }}
      />
      {/* 文字内容 */}
      <div
        style={{
          fontSize: 28,
          color: '#fff',
          lineHeight: 1.6,
        }}
      >
        {text}
      </div>
    </div>
  );
};

/**
 * 示例卡片组件
 */
const ExampleCard: React.FC<{
  text: string;
  index: number;
  primaryColor: string;
  secondaryColor: string;
  delay: number;
}> = ({ text, index, primaryColor, secondaryColor, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - delay - index * 8,
    fps,
    config: { damping: 15, stiffness: 80 },
  });

  return (
    <div
      style={{
        padding: '16px 24px',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 12,
        border: `1px solid ${primaryColor}33`,
        opacity: progress,
        transform: `scale(${progress})`,
      }}
    >
      <div
        style={{
          fontSize: 22,
          color: '#fff',
        }}
      >
        {text}
      </div>
    </div>
  );
};

export const ContentSlide: React.FC<ContentSlideProps> = ({
  title,
  content,
  keyPoints = [],
  examples = [],
  primaryColor = '#00d4ff',
  secondaryColor = '#ff6b6b',
  children,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const theme = themeColors.education;

  // 标题动画
  const titleProgress = spring({
    frame,
    fps,
    config: { damping: 200 },
  });

  const titleY = interpolate(titleProgress, [0, 1], [-30, 0]);

  // 分隔线动画
  const lineWidth = interpolate(
    frame,
    [15, 40],
    [0, 200],
    { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
  );

  // 内容淡入
  const contentOpacity = interpolate(
    frame,
    [30, 50],
    [0, 1],
    { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
  );

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(135deg, ${theme.background} 0%, ${theme.backgroundLight} 100%)`,
        padding: 60,
        fontFamily: '"Source Han Sans CN", "Microsoft YaHei", sans-serif',
      }}
    >
      {/* 顶部标题区域 */}
      <div
        style={{
          position: 'absolute',
          top: 60,
          left: 60,
          right: 60,
        }}
      >
        {/* 标题 */}
        <div
          style={{
            fontSize: 48,
            fontWeight: 700,
            color: '#fff',
            opacity: titleProgress,
            transform: `translateY(${titleY}px)`,
          }}
        >
          {title}
        </div>

        {/* 分隔线 */}
        <div
          style={{
            marginTop: 20,
            height: 4,
            width: lineWidth,
            backgroundColor: primaryColor,
            borderRadius: 2,
            boxShadow: `0 0 20px ${primaryColor}`,
          }}
        />
      </div>

      {/* 主内容区域 */}
      <div
        style={{
          position: 'absolute',
          top: 160,
          left: 60,
          right: 60,
          bottom: 60,
          display: 'flex',
          gap: 40,
          opacity: contentOpacity,
        }}
      >
        {/* 左侧：文字内容 */}
        <div
          style={{
            flex: '0 0 500px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* 概述文字 */}
          {content && (
            <div
              style={{
                fontSize: 24,
                color: theme.textMuted,
                lineHeight: 1.8,
                marginBottom: 30,
                padding: '20px 24px',
                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                borderRadius: 12,
                borderLeft: `4px solid ${primaryColor}`,
              }}
            >
              {content}
            </div>
          )}

          {/* 要点列表 */}
          {keyPoints.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <div
                style={{
                  fontSize: 20,
                  color: primaryColor,
                  marginBottom: 16,
                  fontWeight: 600,
                }}
              >
                核心要点
              </div>
              {keyPoints.map((point, index) => (
                <KeyPoint
                  key={index}
                  text={point}
                  index={index}
                  primaryColor={primaryColor}
                  delay={40}
                />
              ))}
            </div>
          )}
        </div>

        {/* 右侧：视觉内容 */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* 子组件（动画模型） */}
          {children}

          {/* 示例卡片 */}
          {examples.length > 0 && (
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 16,
                justifyContent: 'center',
                marginTop: 30,
              }}
            >
              {examples.map((example, index) => (
                <ExampleCard
                  key={index}
                  text={example}
                  index={index}
                  primaryColor={primaryColor}
                  secondaryColor={secondaryColor}
                  delay={80}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export default ContentSlide;
