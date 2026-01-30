import type { Ref } from 'vue';

import { watch } from 'vue';

export interface WatermarkConfig {
  text: string;
  fontSize: number;
  fontWeight: string;
  fontFamily: string;
  color: string;
  opacity: number;
  gap: number;
  angle: number;
}

export function useWatermark(canvasRef: Ref<HTMLCanvasElement | null>, imageUrl: Ref<string | undefined>, config: Ref<WatermarkConfig>) {
  const originalImage = new Image();

  const render = async () => {
    const canvas = canvasRef.value;
    if (!canvas || !imageUrl.value) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 加载图片
    if (originalImage.src !== imageUrl.value) {
      await new Promise((resolve, reject) => {
        originalImage.onload = resolve;
        originalImage.onerror = reject;
        originalImage.src = imageUrl.value!;
      });
    }

    // 设置画布尺寸为原图尺寸
    canvas.width = originalImage.width;
    canvas.height = originalImage.height;

    // 绘制原图
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(originalImage, 0, 0);

    const { text, fontSize, fontWeight, fontFamily, color, opacity, gap, angle } = config.value;
    
    // 配置画笔样式
    ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    ctx.fillStyle = color;
    ctx.globalAlpha = opacity / 100;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';

    // 1. 测量文本大小以确定网格步长
    const metrics = ctx.measureText(text);
    const textWidth = metrics.width;
    const textHeight = fontSize;

    // 2. 计算网格步长 (文本大小 + 间距)
    const stepX = textWidth + gap;
    const stepY = textHeight + gap;

    // 3. 为了覆盖旋转后的全图，我们需要扩大绘制范围
    // 计算对角线长度，确保旋转时边缘不留白
    const diagonal = Math.sqrt(canvas.width ** 2 + canvas.height ** 2);
    const startX = (canvas.width - diagonal) / 2;
    const endX = (canvas.width + diagonal) / 2;
    const startY = (canvas.height - diagonal) / 2;
    const endY = (canvas.height + diagonal) / 2;

    const rad = (angle * Math.PI) / 180;

    // 4. 双重循环绘制点阵
    // 我们在图片中心进行旋转变换
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(rad);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);

    for (let x = startX; x < endX; x += stepX) {
      for (let y = startY; y < endY; y += stepY) {
        ctx.fillText(text, x, y);
      }
    }
    
    ctx.restore();
  };

  watch([imageUrl, config], () => {
    render();
  }, { deep: true });

  return {
    render
  };
}
