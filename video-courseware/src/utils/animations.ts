/**
 * Remotion 动画工具函数
 * 用于化学课件的常用动画效果
 */

import { interpolate, spring, useCurrentFrame, useVideoConfig, Easing } from 'remotion';

/**
 * 获取淡入动画值
 */
export const useFadeIn = (durationInFrames: number, startFrame = 0): number => {
  const frame = useCurrentFrame();
  return interpolate(
    frame - startFrame,
    [0, durationInFrames],
    [0, 1],
    { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
  );
};

/**
 * 获取淡出动画值
 */
export const useFadeOut = (durationInFrames: number, startFrame: number): number => {
  const frame = useCurrentFrame();
  return interpolate(
    frame - startFrame,
    [0, durationInFrames],
    [1, 0],
    { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
  );
};

/**
 * 获取弹簧动画值
 */
export const useSpringValue = (
  delay = 0,
  config: { damping?: number; stiffness?: number; mass?: number } = {}
): number => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  return spring({
    frame: frame - delay,
    fps,
    config: {
      damping: config.damping ?? 200,
      stiffness: config.stiffness ?? 100,
      mass: config.mass ?? 1,
    },
  });
};

/**
 * 获取圆周运动位置
 * @param radius 半径
 * @param durationFrames 完成一圈需要的帧数
 * @param startFrame 开始帧
 */
export const useCircularMotion = (
  radius: number,
  durationFrames: number,
  startFrame = 0
): { x: number; y: number; angle: number } => {
  const frame = useCurrentFrame();
  const angle = interpolate(
    frame - startFrame,
    [0, durationFrames],
    [0, 2 * Math.PI],
    { extrapolateRight: 'extend' }
  );
  
  return {
    x: radius * Math.cos(angle),
    y: radius * Math.sin(angle),
    angle,
  };
};

/**
 * 获取波函数位置（用于电子云可视化）
 * @param baseRadius 基础半径
 * @param amplitude 振幅
 * @param frequency 频率
 */
export const useWavePosition = (
  baseRadius: number,
  amplitude: number,
  frequency: number,
  phaseOffset = 0
): { x: number; y: number } => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  const t = (frame / fps) * frequency * 2 * Math.PI;
  const r = baseRadius + amplitude * Math.sin(t + phaseOffset);
  
  return {
    x: r * Math.cos(t * 0.5),
    y: r * Math.sin(t * 0.5),
  };
};

/**
 * 获取缩放动画值
 */
export const useScale = (
  targetScale: number,
  durationInFrames: number,
  startFrame = 0
): number => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  return interpolate(
    spring({
      frame: frame - startFrame,
      fps,
      config: { damping: 200 },
    }),
    [0, 1],
    [0, targetScale],
    { extrapolateRight: 'clamp' }
  );
};

/**
 * 获取打字机效果（逐字显示）
 */
export const useTypewriter = (
  text: string,
  durationInFrames: number,
  startFrame = 0
): string => {
  const frame = useCurrentFrame();
  const charsToShow = Math.floor(
    interpolate(
      frame - startFrame,
      [0, durationInFrames],
      [0, text.length],
      { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
    )
  );
  
  return text.slice(0, charsToShow);
};

/**
 * 获取弹性动画值
 */
export const useBounce = (
  startFrame: number,
  config: { damping?: number; stiffness?: number } = {}
): number => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  return spring({
    frame: frame - startFrame,
    fps,
    config: {
      damping: config.damping ?? 10,
      stiffness: config.stiffness ?? 100,
    },
  });
};

/**
 * 获取缓动动画值
 */
export const useEasedValue = (
  startValue: number,
  endValue: number,
  durationInFrames: number,
  startFrame = 0,
  easing = Easing.inOut(Easing.quad)
): number => {
  const frame = useCurrentFrame();
  
  return interpolate(
    frame - startFrame,
    [0, durationInFrames],
    [startValue, endValue],
    {
      extrapolateRight: 'clamp',
      extrapolateLeft: 'clamp',
      easing,
    }
  );
};

/**
 * 获取脉冲动画值（周期性变化）
 */
export const usePulse = (
  minValue: number,
  maxValue: number,
  periodFrames: number,
  startFrame = 0
): number => {
  const frame = useCurrentFrame();
  const t = ((frame - startFrame) % periodFrames) / periodFrames;
  
  return interpolate(
    Math.sin(t * 2 * Math.PI),
    [-1, 1],
    [minValue, maxValue]
  );
};

/**
 * 获取序列动画（多个元素依次出现）
 */
export const useStaggeredAnimation = (
  index: number,
  totalItems: number,
  staggerDelay: number,
  itemDuration: number
): { progress: number; visible: boolean } => {
  const frame = useCurrentFrame();
  const startFrame = index * staggerDelay;
  const endFrame = startFrame + itemDuration;
  
  const progress = interpolate(
    frame,
    [startFrame, endFrame],
    [0, 1],
    { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
  );
  
  return {
    progress,
    visible: frame >= startFrame,
  };
};

/**
 * 原子轨道电子分布动画
 */
export const useElectronOrbit = (
  orbitIndex: number,
  electronsInOrbit: number,
  orbitRadius: number,
  baseSpeed: number
): Array<{ x: number; y: number; angle: number }> => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  const positions = [];
  const angleStep = (2 * Math.PI) / electronsInOrbit;
  const speed = baseSpeed / (orbitIndex + 1); // 外层轨道速度较慢
  
  for (let i = 0; i < electronsInOrbit; i++) {
    const angle = (frame * speed * 2 * Math.PI) / fps + angleStep * i;
    positions.push({
      x: orbitRadius * Math.cos(angle),
      y: orbitRadius * Math.sin(angle),
      angle,
    });
  }
  
  return positions;
};
