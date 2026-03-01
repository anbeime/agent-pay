import { Config } from '@remotion/cli/config';

/**
 * Remotion 配置文件
 */

// 设置入口文件
Config.setEntryPoint('./src/Root.tsx');

// 视频输出配置
Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
