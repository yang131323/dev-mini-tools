import { defineComponent, ref, computed, watch, unref } from 'vue';
import { Button, Upload, Input, Slider, Select, Switch, Drawer, message } from 'ant-design-vue';
import { CloseOutlined, InboxOutlined, LeftOutlined, RightOutlined, SettingOutlined, ToTopOutlined, UploadOutlined } from '@ant-design/icons-vue';
import { useWatermark, type WatermarkConfig } from './hooks/useWatermark';
import { BEM } from '@/utils/common';
import ExportModal from './components/export-modal';
import { usePlatformStore } from '@/store';

import './index.scss';

const ns = new BEM('image-watermark');
const MAX_UPLOAD_FILES = 5;

export default defineComponent({
  name: 'ImageWatermark',
  setup() {
    const fileList = ref<any[]>([]);
    const currentIndex = ref(0);
    const canvasRef = ref<HTMLCanvasElement | null>(null);
    const canvasWrapperRef = ref<HTMLDivElement | null>(null);
    const isExportModalVisible = ref(false);
    const isParamDrawerVisible = ref(false);
    const platformStore = usePlatformStore();

    const config = ref<WatermarkConfig>({
      text: '水印文字',
      fontSize: 24,
      fontWeight: 'normal',
      fontFamily: 'Microsoft YaHei',
      color: '#ff0000',
      opacity: 30,
      gap: 40,
      angle: 45
    });

    const exportConfig = ref({
      format: 'image/png',
      quality: 90,
      width: 0,
      height: 0
    });

    const currentImageUrl = computed(() => fileList.value[unref(currentIndex)]?.url);

    useWatermark(canvasRef, canvasWrapperRef, currentImageUrl, config);

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

    // onBeforeMount(() => {
    //   unmountPlatformListener = mountPlatformListener();
    // });

    // onBeforeUnmount(() => {
    //   unmountPlatformListener?.();
    //   unmountPlatformListener = null;
    // });

    function beforeUpload(file: File) {
      handleUpload({ file });
      return false;
    }

    function handleExport() {
      const canvas = canvasRef.value;
      if (!canvas) return;

      let finalCanvas = canvas;
      const { width, height } = unref(exportConfig);
      if (width !== canvas.width || height !== canvas.height) {
        const offscreenCanvas = document.createElement('canvas');
        offscreenCanvas.width = width;
        offscreenCanvas.height = height;
        const octx = offscreenCanvas.getContext('2d');
        if (octx) {
          // CHECK: 这里有问题，会丢失清晰度
          octx.drawImage(canvas, 0, 0, width, height);
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
    }

    function handleUpload(info: any) {
      const { file } = info;
      if (fileList.value.length >= MAX_UPLOAD_FILES) {
        message.warning(`最多支持上传${MAX_UPLOAD_FILES}张图片`);
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
    }

    const removeFile = (uid: string) => {
      const index = fileList.value.findIndex(item => item.uid === uid);
      if (index !== -1) {
        fileList.value.splice(index, 1);
        if (unref(currentIndex) >= fileList.value.length) {
          currentIndex.value = Math.max(0, fileList.value.length - 1);
        }
      }
    };

    return render;

    function render() {
      const mobile = unref(platformStore.isMobile);

      return (
        <div class={ns.b()}>
          <header class={ns.e('header')}>
            <Button class={ns.e('header-export')} icon={<ToTopOutlined />} type="primary" onClick={() => isExportModalVisible.value = true}>导出</Button>
          </header>

          <main class={ns.e('container')}>
            <section class={ns.e('preview')}>
              {fileList.value.length > 0 ? (
                <>
                  <div class={ns.e('preview-canvas-wrapper')} ref={canvasWrapperRef}>
                    <canvas ref={canvasRef} style={{ display: 'block' }} />
                  </div>
                  {fileList.value.length > 1 && (
                    <div class={ns.e('preview-pagination')}>
                      <Button
                        type="text"
                        icon={<LeftOutlined />}
                        disabled={unref(currentIndex) === 0}
                        onClick={() => currentIndex.value--}
                      />
                      <span>{unref(currentIndex) + 1} / {fileList.value.length}</span>
                      <Button
                        type="text"
                        icon={<RightOutlined />}
                        disabled={unref(currentIndex) === fileList.value.length - 1}
                        onClick={() => currentIndex.value++}
                      />
                    </div>
                  )}
                </>
              ) : (
                <Upload.Dragger
                  class={ns.e('upload')}
                  multiple
                  accept="image/*"
                  beforeUpload={beforeUpload}
                  showUploadList={false}
                >
                  <p class="ant-upload-drag-icon"><InboxOutlined /></p>
                  <p class="ant-upload-text">点击或拖拽图片到此处上传</p>
                  <p class="ant-upload-hint">支持批量上传，最多{MAX_UPLOAD_FILES}张</p>
                </Upload.Dragger>
              )}
            </section>

            {mobile ? (
              <>
                {fileList.value.length > 0 && (
                  <div class={ns.e('thumbnails')}>
                    <Upload
                      class={ns.e('thumbnails-upload')}
                      fileList={fileList.value}
                      accept="image/*"
                      beforeUpload={beforeUpload}
                      showUploadList={false}
                      multiple
                    >
                      <div class={[ns.e('thumbnail'), ns.em('thumbnail', 'upload')]}>
                        <UploadOutlined />
                        <div>上传</div>
                      </div>
                    </Upload>
                    {fileList.value.map((item, index) => {
                      const isActive = index === unref(currentIndex);
                      return (
                        <div
                          key={item.uid ?? index}
                          class={[
                            ns.e('thumbnail'),
                            isActive ? ns.em('thumbnail', 'active') : '',
                          ]}
                          role="button"
                          tabindex={0}
                          onClick={() => (currentIndex.value = index)}
                        >
                          <img class={ns.e('thumbnail-img')} src={item.url} alt={item.name || `图片${index + 1}`} />
                          <Button
                            class={ns.e('thumbnail-remove')}
                            type="text"
                            size="small"
                            aria-label="移除图片"
                            icon={<CloseOutlined />}
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFile(item.uid);
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                )}

                <div class={ns.e('actionbar')}>
                  <Button icon={<SettingOutlined />} onClick={() => (isParamDrawerVisible.value = true)}>
                    参数
                  </Button>
                </div>

                <Drawer
                  class={ns.e('param-drawer')}
                  placement="bottom"
                  height="60vh"
                  open={isParamDrawerVisible.value}
                  title="参数"
                  onUpdate:open={(value: boolean) => (isParamDrawerVisible.value = value)}
                >
                  <div class={ns.e('drawer-section')}>
                    <div class={ns.e('drawer-section-title')}>水印内容</div>
                    <Input v-model={[config.value.text, 'value']} placeholder="请输入水印文字" />
                  </div>

                  <div class={ns.e('drawer-section')}>
                    <div class={ns.e('drawer-section-title')}>布局调节</div>
                    <p>间距</p>
                    <Slider v-model={[config.value.gap, 'value']} min={20} max={300} />
                    <p>角度</p>
                    <Slider v-model={[config.value.angle, 'value']} min={0} max={360} />
                  </div>

                  <div class={ns.e('drawer-section')}>
                    <div class={ns.e('drawer-section-title')}>样式调节</div>
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
                      onChange={(checked) => (config.value.fontWeight = checked ? 'bold' : 'normal')}
                      checkedChildren="加粗"
                      unCheckedChildren="常规"
                    />
                  </div>
                </Drawer>
              </>
            ) : (
              <aside class={ns.e('sider')}>
                <div class={ns.e('sider-section')}>
                  <div class={ns.e('sider-section-title')}>
                    <span>上传列表 ({fileList.value.length}/{MAX_UPLOAD_FILES})</span>
                    <Upload
                      class={ns.e('sider-upload')}
                      fileList={fileList.value}
                      accept="image/*"
                      beforeUpload={beforeUpload}
                      showUploadList={false}
                    >
                      <Button size='small' icon={<UploadOutlined />}>
                        上传
                      </Button>
                    </Upload>
                  </div>
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
                    onChange={(checked) => (config.value.fontWeight = checked ? 'bold' : 'normal')}
                    checkedChildren="加粗"
                    unCheckedChildren="常规"
                  />
                </div>
              </aside>
            )}
          </main>

          <ExportModal
            open={isExportModalVisible.value}
            onUpdate:open={(value: boolean) => (isExportModalVisible.value = value)}
            config={config}
            exportConfig={exportConfig}
            canvasRef={canvasRef}
            onUpdate:height={(value: number) => exportConfig.value.height = value}
            onUpdate:width={(value: number) => exportConfig.value.width = value}
            onExport={handleExport}
          />
        </div>
      );
    }
  }
});
