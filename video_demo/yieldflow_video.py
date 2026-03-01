"""
YieldFlow 3分钟双语字幕视频Demo
使用Remotion风格动画和MoviePy实现

视频结构:
1. 开场介绍 (0-20s)
2. 问题陈述 (20-45s)
3. 解决方案 (45-90s)
4. 技术架构 (90-130s)
5. 演示展示 (130-160s)
6. 结尾总结 (160-180s)
"""

from moviepy.editor import *
from moviepy.video.fx.all import fadein, fadeout
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import os

# 视频配置
WIDTH = 1920
HEIGHT = 1080
FPS = 30
DURATION = 180  # 3分钟

# 颜色配置
COLORS = {
    'primary': '#6366f1',
    'secondary': '#8b5cf6',
    'accent': '#a855f7',
    'success': '#22c55e',
    'warning': '#eab308',
    'bg_dark': '#0f0f23',
    'bg_secondary': '#1a1a2e',
    'text_white': '#ffffff',
    'text_gray': '#a1a1aa',
}

# 字幕数据 (双语)
SUBTITLES = [
    # 开场 (0-20s)
    {
        'start': 0, 'end': 5,
        'en': 'YieldFlow',
        'zh': 'YieldFlow 收益流动'
    },
    {
        'start': 5, 'end': 10,
        'en': 'AI-Powered Yield Optimization',
        'zh': 'AI驱动的智能收益优化'
    },
    {
        'start': 10, 'end': 15,
        'en': 'Built on Monad Blockchain',
        'zh': '构建于Monad区块链'
    },
    {
        'start': 15, 'end': 20,
        'en': 'Rebel in Paradise AI Hackathon 2026',
        'zh': '2026年Rebel黑客马拉松'
    },
    
    # 问题陈述 (20-45s)
    {
        'start': 20, 'end': 25,
        'en': 'The Problem: DeFi is Complex',
        'zh': '问题：DeFi过于复杂'
    },
    {
        'start': 25, 'end': 30,
        'en': '50+ Protocols to Choose From',
        'zh': '50多个协议需要选择'
    },
    {
        'start': 30, 'end': 35,
        'en': 'Manual Management is Time-Consuming',
        'zh': '手动管理耗时费力'
    },
    {
        'start': 35, 'end': 40,
        'en': 'Information Asymmetry',
        'zh': '信息不对称问题'
    },
    {
        'start': 40, 'end': 45,
        'en': 'Risk Assessment is Difficult',
        'zh': '风险评估困难'
    },
    
    # 解决方案 (45-90s)
    {
        'start': 45, 'end': 50,
        'en': 'Our Solution: AI Agent System',
        'zh': '解决方案：AI Agent系统'
    },
    {
        'start': 50, 'end': 55,
        'en': 'One-Click Yield Optimization',
        'zh': '一键收益优化'
    },
    {
        'start': 55, 'end': 60,
        'en': 'Multi-Protocol Aggregation',
        'zh': '多协议聚合'
    },
    {
        'start': 60, 'end': 65,
        'en': 'Real-Time Risk Assessment',
        'zh': '实时风险评估'
    },
    {
        'start': 65, 'end': 70,
        'en': 'Transparent AI Decisions',
        'zh': '透明的AI决策'
    },
    {
        'start': 70, 'end': 75,
        'en': 'Non-Custodial Security',
        'zh': '非托管安全'
    },
    {
        'start': 75, 'end': 80,
        'en': 'Data Collector Agent',
        'zh': '数据收集Agent'
    },
    {
        'start': 80, 'end': 85,
        'en': 'Analysis Agent',
        'zh': '分析Agent'
    },
    {
        'start': 85, 'end': 90,
        'en': 'Decision & Execution Agents',
        'zh': '决策与执行Agent'
    },
    
    # 技术架构 (90-130s)
    {
        'start': 90, 'end': 95,
        'en': 'Technical Architecture',
        'zh': '技术架构'
    },
    {
        'start': 95, 'end': 100,
        'en': 'Frontend: React + wagmi',
        'zh': '前端：React + wagmi'
    },
    {
        'start': 100, 'end': 105,
        'en': 'AI Layer: LangChain + GLM-4',
        'zh': 'AI层：LangChain + GLM-4'
    },
    {
        'start': 105, 'end': 110,
        'en': 'Smart Contracts: Solidity',
        'zh': '智能合约：Solidity'
    },
    {
        'start': 110, 'end': 115,
        'en': 'YieldVault: ERC4626 Standard',
        'zh': 'YieldVault：ERC4626标准'
    },
    {
        'start': 115, 'end': 120,
        'en': 'StrategyManager: Multi-Strategy',
        'zh': 'StrategyManager：多策略管理'
    },
    {
        'start': 120, 'end': 125,
        'en': 'AgentController: Security Layer',
        'zh': 'AgentController：安全层'
    },
    {
        'start': 125, 'end': 130,
        'en': 'Monad: 10,000 TPS Performance',
        'zh': 'Monad：10,000 TPS性能'
    },
    
    # 演示展示 (130-160s)
    {
        'start': 130, 'end': 135,
        'en': 'Live Demo',
        'zh': '实时演示'
    },
    {
        'start': 135, 'end': 140,
        'en': 'Dashboard Overview',
        'zh': '仪表盘概览'
    },
    {
        'start': 140, 'end': 145,
        'en': 'One-Click Deposit',
        'zh': '一键存款'
    },
    {
        'start': 145, 'end': 150,
        'en': 'Strategy Selection',
        'zh': '策略选择'
    },
    {
        'start': 150, 'end': 155,
        'en': 'Real-Time Analytics',
        'zh': '实时分析'
    },
    {
        'start': 155, 'end': 160,
        'en': 'AI Insights Panel',
        'zh': 'AI洞察面板'
    },
    
    # 结尾 (160-180s)
    {
        'start': 160, 'end': 165,
        'en': 'Key Benefits',
        'zh': '核心优势'
    },
    {
        'start': 165, 'end': 170,
        'en': '8.5% Average APY',
        'zh': '平均8.5%年化收益'
    },
    {
        'start': 170, 'end': 175,
        'en': 'Fully Automated',
        'zh': '完全自动化'
    },
    {
        'start': 175, 'end': 180,
        'en': 'YieldFlow - Let AI Optimize Your Yield',
        'zh': 'YieldFlow - 让AI优化您的收益'
    },
]

def hex_to_rgb(hex_color):
    """Convert hex color to RGB tuple"""
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

def create_gradient_background(width, height, color1, color2, direction='vertical'):
    """Create a gradient background image"""
    img = Image.new('RGB', (width, height))
    draw = ImageDraw.Draw(img)
    
    r1, g1, b1 = hex_to_rgb(color1)
    r2, g2, b2 = hex_to_rgb(color2)
    
    if direction == 'vertical':
        for y in range(height):
            ratio = y / height
            r = int(r1 + (r2 - r1) * ratio)
            g = int(g1 + (g2 - g1) * ratio)
            b = int(b1 + (b2 - b1) * ratio)
            draw.line([(0, y), (width, y)], fill=(r, g, b))
    else:
        for x in range(width):
            ratio = x / width
            r = int(r1 + (r2 - r1) * ratio)
            g = int(g1 + (g2 - g1) * ratio)
            b = int(b1 + (b2 - b1) * ratio)
            draw.line([(x, 0), (x, height)], fill=(r, g, b))
    
    return np.array(img)

def create_text_frame(text_en, text_zh, width, height, bg_color='#0f0f23', 
                      en_color='#ffffff', zh_color='#a1a1aa', font_size_en=72, font_size_zh=48):
    """Create a frame with bilingual text"""
    img = Image.new('RGB', (width, height), hex_to_rgb(bg_color))
    draw = ImageDraw.Draw(img)
    
    # Try to use a good font, fall back to default
    try:
        font_en = ImageFont.truetype("arial.ttf", font_size_en)
        font_zh = ImageFont.truetype("msyh.ttc", font_size_zh)  # Microsoft YaHei for Chinese
    except:
        font_en = ImageFont.load_default()
        font_zh = ImageFont.load_default()
    
    # Calculate positions for centered text
    en_bbox = draw.textbbox((0, 0), text_en, font=font_en)
    en_width = en_bbox[2] - en_bbox[0]
    en_height = en_bbox[3] - en_bbox[1]
    en_x = (width - en_width) // 2
    en_y = height // 2 - en_height - 20
    
    zh_bbox = draw.textbbox((0, 0), text_zh, font=font_zh)
    zh_width = zh_bbox[2] - zh_bbox[0]
    zh_height = zh_bbox[3] - zh_bbox[1]
    zh_x = (width - zh_width) // 2
    zh_y = height // 2 + 20
    
    # Draw text
    draw.text((en_x, en_y), text_en, fill=hex_to_rgb(en_color), font=font_en)
    draw.text((zh_x, zh_y), text_zh, fill=hex_to_rgb(zh_color), font=font_zh)
    
    return np.array(img)

def create_title_frame(title, subtitle, width, height):
    """Create a title frame with logo-style presentation"""
    img = Image.new('RGB', (width, height), hex_to_rgb(COLORS['bg_dark']))
    draw = ImageDraw.Draw(img)
    
    try:
        font_title = ImageFont.truetype("arial.ttf", 120)
        font_sub = ImageFont.truetype("arial.ttf", 48)
    except:
        font_title = ImageFont.load_default()
        font_sub = ImageFont.load_default()
    
    # Draw gradient bar at top
    for i in range(10):
        color = f"#{99 + i*10:02x}{102 + i*10:02x}{241:02x}"
        draw.rectangle([0, i*10, width, (i+1)*10], fill=hex_to_rgb(color))
    
    # Draw title
    title_bbox = draw.textbbox((0, 0), title, font=font_title)
    title_width = title_bbox[2] - title_bbox[0]
    title_x = (width - title_width) // 2
    title_y = height // 2 - 80
    draw.text((title_x, title_y), title, fill=hex_to_rgb(COLORS['primary']), font=font_title)
    
    # Draw subtitle
    sub_bbox = draw.textbbox((0, 0), subtitle, font=font_sub)
    sub_width = sub_bbox[2] - sub_bbox[0]
    sub_x = (width - sub_width) // 2
    sub_y = title_y + 150
    draw.text((sub_x, sub_y), subtitle, fill=hex_to_rgb(COLORS['text_gray']), font=font_sub)
    
    return np.array(img)

def create_metrics_frame(metrics, width, height):
    """Create a frame showing metrics"""
    img = Image.new('RGB', (width, height), hex_to_rgb(COLORS['bg_secondary']))
    draw = ImageDraw.Draw(img)
    
    try:
        font_value = ImageFont.truetype("arial.ttf", 64)
        font_label = ImageFont.truetype("arial.ttf", 28)
    except:
        font_value = ImageFont.load_default()
        font_label = ImageFont.load_default()
    
    # Draw metric cards
    card_width = 400
    card_height = 200
    gap = 50
    start_x = (width - (4 * card_width + 3 * gap)) // 2
    start_y = height // 2 - card_height // 2
    
    for i, (label, value, color) in enumerate(metrics):
        x = start_x + i * (card_width + gap)
        
        # Draw card background
        draw.rounded_rectangle(
            [x, start_y, x + card_width, start_y + card_height],
            radius=20,
            fill=hex_to_rgb(COLORS['bg_dark'])
        )
        
        # Draw value
        value_bbox = draw.textbbox((0, 0), value, font=font_value)
        value_width = value_bbox[2] - value_bbox[0]
        draw.text(
            (x + (card_width - value_width) // 2, start_y + 40),
            value,
            fill=hex_to_rgb(color),
            font=font_value
        )
        
        # Draw label
        label_bbox = draw.textbbox((0, 0), label, font=font_label)
        label_width = label_bbox[2] - label_bbox[0]
        draw.text(
            (x + (card_width - label_width) // 2, start_y + 130),
            label,
            fill=hex_to_rgb(COLORS['text_gray']),
            font=font_label
        )
    
    return np.array(img)

def generate_video():
    """Generate the complete video"""
    print("Generating YieldFlow video demo...")
    
    clips = []
    
    # Section 1: Opening (0-20s)
    print("Creating opening sequence...")
    
    # Title frame
    title_frame = create_title_frame("YieldFlow", "AI-Powered Yield Optimization", WIDTH, HEIGHT)
    title_clip = ImageClip(title_frame).set_duration(5)
    title_clip = title_clip.crossfadein(1).crossfadeout(0.5)
    clips.append(title_clip)
    
    # Opening subtitles
    for sub in SUBTITLES[1:4]:
        frame = create_text_frame(sub['en'], sub['zh'], WIDTH, HEIGHT)
        clip = ImageClip(frame).set_duration(sub['end'] - sub['start'])
        clip = clip.crossfadein(0.3).crossfadeout(0.3)
        clips.append(clip)
    
    # Section 2: Problem (20-45s)
    print("Creating problem section...")
    for sub in SUBTITLES[4:9]:
        frame = create_text_frame(sub['en'], sub['zh'], WIDTH, HEIGHT, 
                                  en_color='#ef4444')  # Red for problem
        clip = ImageClip(frame).set_duration(sub['end'] - sub['start'])
        clip = clip.crossfadein(0.3).crossfadeout(0.3)
        clips.append(clip)
    
    # Section 3: Solution (45-90s)
    print("Creating solution section...")
    for sub in SUBTITLES[9:19]:
        frame = create_text_frame(sub['en'], sub['zh'], WIDTH, HEIGHT,
                                  en_color='#22c55e')  # Green for solution
        clip = ImageClip(frame).set_duration(sub['end'] - sub['start'])
        clip = clip.crossfadein(0.3).crossfadeout(0.3)
        clips.append(clip)
    
    # Section 4: Technical Architecture (90-130s)
    print("Creating architecture section...")
    for sub in SUBTITLES[19:27]:
        frame = create_text_frame(sub['en'], sub['zh'], WIDTH, HEIGHT,
                                  en_color='#6366f1')  # Primary color
        clip = ImageClip(frame).set_duration(sub['end'] - sub['start'])
        clip = clip.crossfadein(0.3).crossfadeout(0.3)
        clips.append(clip)
    
    # Section 5: Demo (130-160s)
    print("Creating demo section...")
    
    # Metrics frame
    metrics = [
        ("Total Value", "$10,520", COLORS['primary']),
        ("Total Yield", "$520", COLORS['success']),
        ("Current APY", "8.5%", COLORS['secondary']),
        ("Daily Earn", "$2.45", COLORS['warning']),
    ]
    metrics_frame = create_metrics_frame(metrics, WIDTH, HEIGHT)
    metrics_clip = ImageClip(metrics_frame).set_duration(10)
    metrics_clip = metrics_clip.crossfadein(0.5).crossfadeout(0.5)
    clips.append(metrics_clip)
    
    for sub in SUBTITLES[27:32]:
        frame = create_text_frame(sub['en'], sub['zh'], WIDTH, HEIGHT,
                                  en_color='#a855f7')  # Accent color
        clip = ImageClip(frame).set_duration(sub['end'] - sub['start'])
        clip = clip.crossfadein(0.3).crossfadeout(0.3)
        clips.append(clip)
    
    # Section 6: Closing (160-180s)
    print("Creating closing sequence...")
    for sub in SUBTITLES[32:]:
        if 'YieldFlow - Let AI' in sub['en']:
            frame = create_title_frame("YieldFlow", "Let AI Optimize Your Yield", WIDTH, HEIGHT)
        else:
            frame = create_text_frame(sub['en'], sub['zh'], WIDTH, HEIGHT,
                                      en_color='#22c55e')
        clip = ImageClip(frame).set_duration(sub['end'] - sub['start'])
        clip = clip.crossfadein(0.3).crossfadeout(0.3)
        clips.append(clip)
    
    # Concatenate all clips
    print("Concatenating clips...")
    final_video = concatenate_videoclips(clips, method="compose")
    
    # Add fade in/out
    final_video = final_video.fadein(1).fadeout(1)
    
    # Write video file
    output_path = "c:/D/compet/dcic/rebel/output/video/yieldflow_demo.mp4"
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    print(f"Writing video to {output_path}...")
    final_video.write_videofile(
        output_path,
        fps=FPS,
        codec='libx264',
        audio=False,
        preset='medium',
        bitrate='5000k'
    )
    
    print("Video generation complete!")
    return output_path

if __name__ == "__main__":
    generate_video()
