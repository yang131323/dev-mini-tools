import { defineComponent, ref, computed, watch } from 'vue';
import { Button, Upload, Input, Slider, Select, Switch, Modal, message } from 'ant-design-vue';
import { InboxOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons-vue';
import { useWatermark, type WatermarkConfig } from './hooks/useWatermark';
import { BEM } from '@/utils/common';

import './index.scss';

const ns = new BEM('image-watermark');

export default defineComponent({
  name: 'ImageWatermark',
  setup() {
    const fileList = ref<any[]>([]);
    const currentIndex = ref(0);
    const canvasRef = ref<HTMLCanvasElement | null>(null);
    const isExportModalVisible = ref(false);

    const config = ref<WatermarkConfig>({
      text: '水印文字',
      fontSize: 24,
      fontWeight: 'normal',
      fontFamily: 'Microsoft YaHei',
      color: '#000000',
      opacity: 30,
      gap: 100,
      angle: 45
    });

    const exportConfig = ref({
      format: 'image/png',
      quality: 90,
      width: 0,
      height: 0
    });

    const currentImageUrl = computed(() => fileList.value[currentIndex.value]?.url);

    useWatermark(canvasRef, currentImageUrl, config);

    watch(currentImageUrl, () => {
      if (currentImageUrl.value) {
        const img = new Image();
        img.onload = () => {
          exportConfig.value.width = img.width;
          exportConfig.value.height = img.height;
        };
        img.src = currentImageUrl.value;
      }
    });

    const handleExport = () => {
      const canvas = canvasRef.value;
      if (!canvas) return;

      let finalCanvas = canvas;
      if (exportConfig.value.width !== canvas.width || exportConfig.value.height !== canvas.height) {
        const offscreenCanvas = document.createElement('canvas');
        offscreenCanvas.width = exportConfig.value.width;
        offscreenCanvas.height = exportConfig.value.height;
        const octx = offscreenCanvas.getContext('2d');
        if (octx) {
          octx.drawImage(canvas, 0, 0, exportConfig.value.width, exportConfig.value.height);
          finalCanvas = offscreenCanvas;
        }
      }

      try {
        const dataUrl = finalCanvas.toDataURL(exportConfig.value.format, exportConfig.value.quality / 100);
        const link = document.createElement('a');
        const extension = exportConfig.value.format.split('/')[1];
        link.download = `watermark_${Date.now()}.${extension}`;
        link.href = dataUrl;
        link.click();
        isExportModalVisible.value = false;
        message.success('导出成功');
      } catch (err) {
        console.error(err);
        message.error('导出失败，请重试');
      }
    };

    const handleUpload = (info: any) => {
      const { file } = info;
      if (fileList.value.length >= 5) {
        message.warning('最多支持上传5张图片');
        return false;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        fileList.value.push({
          uid: file.uid,
          name: file.name,
          url: e.target?.result as string,
          originFile: file
        });
      };
      reader.readAsDataURL(file);
      return false;
    };

    const removeFile = (uid: string) => {
      const index = fileList.value.findIndex(item => item.uid === uid);
      if (index !== -1) {
        fileList.value.splice(index, 1);
        if (currentIndex.value >= fileList.value.length) {
          currentIndex.value = Math.max(0, fileList.value.length - 1);
        }
      }
    };

    return () => (
      <div class={ns.b()}>
        <header class={ns.e('header')}>
          <div class={ns.e('header-title')}>图片加水印工具</div>
          <Button type="primary" onClick={() => isExportModalVisible.value = true}>立即导出图片</Button>
        </header>

        <main class={ns.e('container')}>
          <section class={ns.e('preview')}>
            {fileList.value.length > 0 ? (
              <>
                <div class={ns.e('preview-canvas-wrapper')}>
                  <canvas ref={canvasRef} style={{ maxWidth: '100%', display: 'block' }} />
                </div>
                {fileList.value.length > 1 && (
                  <div class={ns.e('preview-pagination')}>
                    <Button 
                      type="text" 
                      icon={<LeftOutlined />} 
                      disabled={currentIndex.value === 0}
                      onClick={() => currentIndex.value--}
                    />
                    <span>{currentIndex.value + 1} / {fileList.value.length}</span>
                    <Button 
                      type="text" 
                      icon={<RightOutlined />} 
                      disabled={currentIndex.value === fileList.value.length - 1}
                      onClick={() => currentIndex.value++}
                    />
                  </div>
                )}
              </>
            ) : (
              <Upload.Dragger
                multiple
                accept="image/*"
                beforeUpload={(file) => {
                  handleUpload({ file });
                  return false;
                }}
                showUploadList={false}
              >
                <p class="ant-upload-drag-icon"><InboxOutlined /></p>
                <p class="ant-upload-text">点击或拖拽图片到此处上传</p>
                <p class="ant-upload-hint">支持批量上传，最多5张</p>
              </Upload.Dragger>
            )}
          </section>

          <aside class={ns.e('sider')}>
            <div class={ns.e('sider-section')}>
              <div class={ns.e('sider-section-title')}>上传列表 ({fileList.value.length}/5)</div>
              <Upload
                fileList={fileList.value}
                listType="picture"
                onRemove={(file) => removeFile(file.uid)}
                accept="image/*"
                beforeUpload={() => false}
              />
            </div>

            <div class={ns.e('sider-section')}>
              <div class={ns.e('sider-section-title')}>水印内容</div>
              <Input v-model={[config.value.text, 'value']} placeholder="请输入水印文字" />
            </div>

            <div class={ns.e('sider-section')}>
              <div class={ns.e('sider-section-title')}>布局调节</div>
              <p>间距</p>
              <Slider v-model={[config.value.gap, 'value']} min={20} max={300} />
              <p>角度</p>
              <Slider v-model={[config.value.angle, 'value']} min={0} max={360} />
            </div>

            <div class={ns.e('sider-section')}>
              <div class={ns.e('sider-section-title')}>样式调节</div>
              <p>字体</p>
              <Select v-model={[config.value.fontFamily, 'value']} style={{ width: '100%' }}>
                <Select.Option value="Microsoft YaHei">微软雅黑</Select.Option>
                <Select.Option value="SimSun">宋体</Select.Option>
                <Select.Option value="SimHei">黑体</Select.Option>
                <Select.Option value="Arial">Arial</Select.Option>
                <Select.Option value="Times New Roman">Times New Roman</Select.Option>
              </Select>
              <p style={{ marginTop: '12px' }}>大小</p>
              <Slider v-model={[config.value.fontSize, 'value']} min={12} max={100} />
              <p>颜色与透明度</p>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input type="color" v-model={config.value.color} style={{ width: '40px', height: '32px', padding: '0', border: '1px solid #d9d9d9', borderRadius: '4px' }} />
                <Slider v-model={[config.value.opacity, 'value']} min={0} max={100} style={{ flex: 1 }} />
              </div>
              <p style={{ marginTop: '12px' }}>粗细</p>
              <Switch 
                checked={config.value.fontWeight === 'bold'} 
                onChange={(checked) => config.value.fontWeight = checked ? 'bold' : 'normal'}
                checkedChildren="加粗" 
                unCheckedChildren="常规" 
              />
            </div>
          </aside>
        </main>

        <Modal
          v-model={[isExportModalVisible.value, 'open']}
          title="导出预览与设置"
          onOk={handleExport}
          okText="确认下载"
          cancelText="取消"
        >
          <div class="export-summary">
            <p><strong>当前配置摘要:</strong></p>
            <p>- 水印文本: {config.value.text}</p>
            <p>- 字体样式: {config.value.fontFamily} / {config.value.fontWeight === 'bold' ? '加粗' : '常规'}</p>
            <p>- 布局信息: 间距 {config.value.gap}px / 角度 {config.value.angle}°</p>
          </div>
          <div class="export-settings" style={{ marginTop: '20px' }}>
            <p><strong>导出参数配置:</strong></p>
            <p>选择导出格式:</p>
            <Select v-model={[exportConfig.value.format, 'value']} style={{ width: '100%' }}>
              <Select.Option value="image/png">PNG</Select.Option>
              <Select.Option value="image/jpeg">JPG</Select.Option>
              <Select.Option value="image/webp">WEBP</Select.Option>
            </Select>
            {['image/jpeg', 'image/webp'].includes(exportConfig.value.format) && (
              <>
                <p style={{ marginTop: '12px' }}>导出质量: {exportConfig.value.quality}%</p>
                <Slider v-model={[exportConfig.value.quality, 'value']} min={0} max={100} />
              </>
            )}
            <p style={{ marginTop: '12px' }}>导出分辨率:</p>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Input 
                v-model={[exportConfig.value.width, 'value']} 
                type="number" 
                placeholder="宽度" 
                onChange={(e: any) => {
                  const val = parseInt(e.target.value);
                  if (canvasRef.value && val > 0) {
                    const ratio = canvasRef.value.height / canvasRef.value.width;
                    exportConfig.value.height = Math.round(val * ratio);
                  }
                }}
              />
              <span>x</span>
              <Input 
                v-model={[exportConfig.value.height, 'value']} 
                type="number" 
                placeholder="高度" 
                onChange={(e: any) => {
                  const val = parseInt(e.target.value);
                  if (canvasRef.value && val > 0) {
                    const ratio = canvasRef.value.width / canvasRef.value.height;
                    exportConfig.value.width = Math.round(val * ratio);
                  }
                }}
              />
            </div>
            <p style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>默认使用原图分辨率，支持等比调整</p>
          </div>
        </Modal>
      </div>
    );
  }
});
