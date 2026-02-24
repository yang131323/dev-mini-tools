import type { Ref } from "vue";

import { unref, watch } from "vue";
import { useViewportStore } from "@/store";
import { numToPixel } from "@/utils/pixel";

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

export function useWatermark(
  canvasRef: Ref<HTMLCanvasElement | null>,
  wrapperRef: Ref<HTMLElement | null>,
  imageUrl: Ref<string | undefined>,
  config: Ref<WatermarkConfig>,
) {
  const originalImage = new Image();
  const { version } = useViewportStore();

  let renderToken = 0;

  function updateCanvasDisplaySize(canvas: HTMLCanvasElement) {
    const wrapper = unref(wrapperRef);
    const rect = {
      dw: 1,
      dh: 1,
    };
    if (!wrapper) return rect;

    const cw = wrapper.clientWidth;
    const ch = wrapper.clientHeight;
    if (!cw || !ch) return rect;

    const iw = originalImage.width;
    const ih = originalImage.height;
    if (!iw || !ih) return rect;

    const scale = Math.min(cw / iw, ch / ih, 1);
    const dw = Math.max(1, Math.floor(iw * scale));
    const dh = Math.max(1, Math.floor(ih * scale));

    canvas.style.width = numToPixel(dw);
    canvas.style.height = numToPixel(dh);
    canvas.width = dw;
    canvas.height = dh;

    rect.dw = dw;
    rect.dh = dh;

    return rect;
  }

  async function render() {
    renderToken += 1;
    const token = renderToken;

    const canvas = unref(canvasRef);
    if (!canvas || !unref(imageUrl)) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 加载图片
    if (originalImage.src !== unref(imageUrl)) {
      await new Promise((resolve, reject) => {
        originalImage.onload = resolve;
        originalImage.onerror = reject;
        originalImage.src = unref(imageUrl)!;
      });
    }

    if (token !== renderToken) return;

    // 设置画布尺寸为原图尺寸
    // canvas.width = originalImage.width;
    // canvas.height = originalImage.height;
    const { dw, dh } = updateCanvasDisplaySize(canvas);

    // 绘制原图
    ctx.clearRect(0, 0, dw, dh);
    ctx.drawImage(originalImage, 0, 0, dw, dh);

    const {
      text,
      fontSize,
      fontWeight,
      fontFamily,
      color,
      opacity,
      gap,
      angle,
    } = config.value;

    // 配置画笔样式
    ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    ctx.fillStyle = color;
    ctx.globalAlpha = opacity / 100;
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";

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
    const startX = 0;
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

    // 更新显示尺寸：保证在父容器可视区域内等比完整展示（允许放大）
    // updateCanvasDisplaySize(canvas);
  }

  watch(
    [imageUrl, config],
    () => {
      render();
    },
    { deep: true },
  );

  watch(version, () => {
    render();
  });

  /** 初始化渲染，imageUrl变化但是canvas dom还未就位 */
  watch(canvasRef, (val) => {
    if (val) render();
  });

  return {
    render,
  };
}
