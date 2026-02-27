import type { Ref } from "vue";

import { unref, watch } from "vue";
import { useViewportStore } from "@/store";
import { numToPixel } from "@/utils/pixel";
import { downloadDataUrl } from "@/utils/download";
import { message } from "ant-design-vue";

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

export interface FileItem {
  uid: string;
  name: string;
  url: string;
  originFile: File;
}

export interface ExportConfig {
  format: string;
  quality: number;
  width: number;
  height: number;
}

export function useWatermark(
  canvasRef: Ref<HTMLCanvasElement | null>,
  wrapperRef: Ref<HTMLElement | null>,
  imageUrl: Ref<string | undefined>,
  config: Ref<WatermarkConfig>,
) {
  const originalImage = new Image();
  const viewportStore = useViewportStore();

  let renderToken = 0;

  function setCanvasSize(
    canvas: HTMLCanvasElement,
    width: number,
    height: number,
  ) {
    canvas.style.width = numToPixel(width);
    canvas.style.height = numToPixel(height);
    canvas.width = width;
    canvas.height = height;
  }

  function calcScale() {
    const wrapper = unref(wrapperRef);
    if (!wrapper) return 1;
    const { clientWidth: width, clientHeight: height } = wrapper;
    const { width: imageWidth, height: imageHeight } = originalImage;
    const scale = Math.min(width / imageWidth, height / imageHeight, 1);
    return scale;
  }

  function calcCanvasDisplaySize(scale: number) {
    const iw = originalImage.width;
    const ih = originalImage.height;
    const dw = Math.max(1, Math.floor(iw * scale));
    const dh = Math.max(1, Math.floor(ih * scale));

    return {
      dh,
      dw,
    };
  }

  /** 配置画笔样式 */
  function setCtxStyle(ctx: CanvasRenderingContext2D, scale: number) {
    const { fontSize, fontWeight, fontFamily, color, opacity } = unref(config);
    const ceilFontSize = Math.ceil(fontSize * scale);

    ctx.font = `${fontWeight} ${numToPixel(ceilFontSize)} ${fontFamily}`;
    ctx.fillStyle = color;
    ctx.globalAlpha = opacity / 100;
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
  }

  function measureText(ctx: CanvasRenderingContext2D, scale = 1) {
    const { text, fontSize } = unref(config);
    const metrics = ctx.measureText(text);
    const textWidth = metrics.width;
    const textHeight = Math.ceil(fontSize * scale);

    return {
      textWidth,
      textHeight,
    };
  }

  function drawWatermark(
    ctx: CanvasRenderingContext2D,
    canvasWidth: number,
    canvasHeight: number,
    scale: number,
  ) {
    const { gap: _gap, angle, text } = unref(config);
    const gap = Math.ceil(_gap * scale);
    const canvasHalfWidth = canvasWidth / 2;
    const canvasHalfHeight = canvasHeight / 2;
    // 1. 测量文本大小以确定网格步长
    const { textWidth, textHeight } = measureText(ctx, scale);

    // 2. 计算网格步长 (文本大小 + 间距)
    const stepX = textWidth + gap;
    const stepY = textHeight + gap;

    // 3. 为了覆盖旋转后的全图，我们需要扩大绘制范围
    // 计算对角线长度，确保旋转时边缘不留白
    const diagonal = Math.sqrt(canvasWidth ** 2 + canvasHeight ** 2);
    const startX = (canvasWidth - diagonal) / 2;
    const endX = (canvasWidth + diagonal) / 2;
    const startY = (canvasHeight - diagonal) / 2;
    const endY = (canvasHeight + diagonal) / 2;

    const rad = (angle * Math.PI) / 180;

    // 4. 双重循环绘制点阵
    // 我们在图片中心进行旋转变换
    ctx.save();
    ctx.translate(canvasHalfWidth, canvasHalfHeight);
    ctx.rotate(rad);
    ctx.translate(-canvasHalfWidth, -canvasHalfHeight);

    for (let x = startX; x < endX; x += stepX) {
      for (let y = startY; y < endY; y += stepY) {
        ctx.fillText(text, x, y);
      }
    }

    ctx.restore();
  }

  function renderContent(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    scale = 1,
  ) {
    // 设置画布尺寸
    setCanvasSize(canvas, width, height);

    // 绘制图片
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(originalImage, 0, 0, width, height);

    // 配置画笔样式
    setCtxStyle(ctx, scale);

    // 绘制水印
    drawWatermark(ctx, width, height, scale);
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

    // 计算缩放比例
    const scale = calcScale();

    const { dw, dh } = calcCanvasDisplaySize(scale);

    renderContent(canvas, ctx, dw, dh, scale);
  }

  async function exportImage(exportConfig: ExportConfig, image: FileItem) {
    if (!unref(canvasRef)) return;
    const { width, height, format, quality } = exportConfig;
    const canvas = unref(canvasRef);
    if (!canvas) return;

    let finalCanvas = canvas;
    if (canvas.width !== width || canvas.height !== height) {
      const offscreenCanvas = document.createElement("canvas");
      offscreenCanvas.width = width;
      offscreenCanvas.height = height;
      const octx = offscreenCanvas.getContext("2d");
      if (octx) renderContent(offscreenCanvas, octx, width, height);
      finalCanvas = offscreenCanvas;
    }

    try {
      const fileLink = finalCanvas.toDataURL(format, quality / 100);
      const baseName = image?.name ? image.name.replace(/\.[^/.]+$/, "") : `watermark_${Date.now()}`;
      downloadDataUrl({
        fileLink,
        fileName: baseName,
        mimeType: format,
      });

      message.success("导出成功");
    } catch (err) {
      console.error("export image failed: ", err);
      message.error("导出失败，请重试");
    }
  }

  watch(
    [imageUrl, config],
    () => {
      render();
    },
    { deep: true },
  );

  watch(
    () => viewportStore.version,
    () => {
      render();
    },
  );

  /** 初始化渲染，imageUrl变化但是canvas dom还未就位 */
  watch(canvasRef, (val) => {
    if (val) render();
  });

  return {
    render,
    exportImage,
  };
}
