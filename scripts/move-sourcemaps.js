import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'site');
const sourceMapDir = path.resolve(distDir, 'sourceMap');

/**
 * 递归遍历目录并移动 .map 文件
 * @param {string} dir 
 */
function moveSourceMaps(dir) {
  if (!fs.existsSync(dir)) return;

  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
      // 排除我们自己创建的 sourceMap 目录
      if (filePath !== sourceMapDir) {
        moveSourceMaps(filePath);
      }
    } else if (file.endsWith('.map')) {
      const destPath = path.join(sourceMapDir, file);
      console.log(`Moving: ${file} -> site/sourceMap/`);
      fs.renameSync(filePath, destPath);
    }
  }
}

console.log('Post-build: Moving source maps...');
try {
  // 确保目标目录存在
  if (!fs.existsSync(sourceMapDir)) {
    fs.mkdirSync(sourceMapDir, { recursive: true });
  }
  moveSourceMaps(distDir);
  console.log('Post-build: All source maps moved successfully.');
} catch (err) {
  console.error('Post-build: Failed to move source maps:', err);
  process.exit(1);
}
