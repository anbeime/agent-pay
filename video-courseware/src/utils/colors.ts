/**
 * 化学元素配色方案
 * 参考 CPK (Corey-Pauling-Koltun) 着色惯例
 */

// 元素颜色映射
export const elementColors: Record<string, string> = {
  // 常见元素
  H: '#FFFFFF',   // 氢 - 白色
  He: '#D9FFFF',  // 氦 - 淡青色
  Li: '#CC80FF',  // 锂 - 紫色
  Be: '#C2FF00',  // 铍 - 黄绿色
  B: '#FFB5B5',   // 硼 - 粉红色
  C: '#909090',   // 碳 - 灰色
  N: '#3050F8',   // 氮 - 蓝色
  O: '#FF0D0D',   // 氧 - 红色
  F: '#90E050',   // 氟 - 淡绿色
  Ne: '#B3E3F5',  // 氖 - 淡蓝色
  Na: '#AB5CF2',  // 钠 - 紫色
  Mg: '#8AFF00',  // 镁 - 绿色
  Al: '#BFA6A6',  // 铝 - 灰色
  Si: '#F0C8A0',  // 硅 - 米色
  P: '#FF8000',   // 磷 - 橙色
  S: '#FFFF30',   // 硫 - 黄色
  Cl: '#1FF01F',  // 氯 - 绿色
  Ar: '#80D1E3',  // 氩 - 青色
  K: '#8F40D4',   // 钾 - 紫色
  Ca: '#3DFF00',  // 钙 - 绿色
  Fe: '#E06633',  // 铁 - 橙色
  Cu: '#C88033',  // 铜 - 棕色
  Zn: '#7D80B0',  // 锌 - 灰蓝色
  Br: '#A62929',  // 溴 - 棕红色
  I: '#940094',   // 碘 - 紫色
  Ag: '#C0C0C0',  // 银 - 银色
  Au: '#FFD123',  // 金 - 金色
};

// 获取元素颜色，未知元素返回默认颜色
export const getElementColor = (symbol: string): string => {
  return elementColors[symbol] || '#808080';
};

// 主题配色
export const themeColors = {
  // 深色主题
  dark: {
    background: '#0a0a1a',
    backgroundLight: '#1a1a2e',
    primary: '#00d4ff',
    secondary: '#ff6b6b',
    accent: '#ffd93d',
    text: '#ffffff',
    textMuted: '#888888',
    success: '#4ade80',
    warning: '#fbbf24',
    error: '#ef4444',
  },
  // 浅色主题
  light: {
    background: '#f5f5f5',
    backgroundLight: '#ffffff',
    primary: '#0066cc',
    secondary: '#dc2626',
    accent: '#d97706',
    text: '#1a1a1a',
    textMuted: '#666666',
    success: '#16a34a',
    warning: '#ca8a04',
    error: '#dc2626',
  },
  // 教育主题（适合课堂投影）
  education: {
    background: '#1e3a5f',
    backgroundLight: '#2d4a6f',
    primary: '#00d4ff',
    secondary: '#ff6b6b',
    accent: '#ffd93d',
    text: '#ffffff',
    textMuted: '#a0c4e8',
    success: '#4ade80',
    warning: '#fbbf24',
    error: '#ef4444',
  },
};

// 化学键颜色
export const bondColors = {
  covalent: '#ffffff',      // 共价键 - 白色
  ionic: '#ffd700',         // 离子键 - 金色
  metallic: '#c0c0c0',      // 金属键 - 银色
  hydrogen: '#00ffff',      // 氢键 - 青色
  vanDerWaals: '#ff69b4',   // 范德华力 - 粉色
};

// 化学反应箭头颜色
export const arrowColors = {
  reaction: '#ffffff',      // 普通反应
  equilibrium: '#ffd700',   // 可逆反应
  reversible: '#00d4ff',    // 可逆
  energy: '#ff6b6b',        // 能量变化
};

// 粒子类型颜色
export const particleColors = {
  proton: '#ff4444',        // 质子 - 红色
  neutron: '#4488ff',       // 中子 - 蓝色
  electron: '#ffff00',      // 电子 - 黄色
  nucleus: '#ff6b6b',       // 原子核
  electronCloud: 'rgba(0, 212, 255, 0.3)', // 电子云
};

// 状态颜色（物质三态）
export const stateColors = {
  solid: '#4a90d9',         // 固态 - 蓝色
  liquid: '#00d4ff',        // 液态 - 青色
  gas: '#ffd93d',           // 气态 - 黄色
  plasma: '#ff6b6b',        // 等离子态 - 红色
};

// pH 指示剂颜色
export const phColors = {
  acidic: '#ff4444',        // 酸性 - 红色
  neutral: '#44ff44',       // 中性 - 绿色
  alkaline: '#4444ff',      // 碱性 - 蓝色
  // pH 梯度
  gradient: [
    '#ff0000', '#ff4400', '#ff8800', '#ffcc00', '#ffff00',
    '#ccff00', '#88ff00', '#44ff00', '#00ff00', '#00ff44',
    '#00ff88', '#00ffcc', '#00ffff', '#00ccff', '#0088ff',
  ],
};
