/**
 * Remotion 入口文件
 * 注册所有课件组合
 */

import { Composition, Folder, registerRoot } from 'remotion';
import { AtomicStructure } from './compositions/AtomicStructure';

/**
 * RemotionRoot - 课件项目入口
 */
export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* 初三化学课件 */}
      <Folder name="初三化学">
        <Composition
          id="AtomicStructure"
          component={AtomicStructure}
          durationInFrames={49 * 30} // 约49秒
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{}}
        />
      </Folder>

      {/* 高一化学课件（预留） */}
      <Folder name="高一化学">
        {/* 可以添加高一化学课件 */}
      </Folder>
    </>
  );
};

// 注册入口
registerRoot(RemotionRoot);
