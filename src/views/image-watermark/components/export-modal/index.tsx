import type { PropType, Ref } from 'vue';

import { computed, defineComponent } from 'vue';
import { Input, Modal, Select, Slider } from 'ant-design-vue';

import type { WatermarkConfig } from '../../hooks/useWatermark';

export interface ExportConfig {
  format: string;
  quality: number;
  width: number;
  height: number;
}

function parsePositiveInt(value: string): number | null {
  const v = parseInt(value, 10);
  if (!Number.isFinite(v) || v <= 0) return null;
  return v;
}

export default defineComponent({
  name: 'ExportModal',
  props: {
    open: {
      type: Boolean,
      required: true,
    },
    config: {
      type: Object as PropType<Ref<WatermarkConfig>>,
      required: true,
    },
    exportConfig: {
      type: Object,
      required: true,
    },
    canvasRef: {
      type: Object as PropType<Ref<HTMLCanvasElement | null>>,
      required: true,
    },
    onExport: {
      type: Function as PropType<() => void>,
      required: true,
    },
  },
  emits: {
    // eslint-disable-next-line
    'update:open': (_value: boolean) => true,
    // eslint-disable-next-line
    'update:height': (_value: number) => true,
    // eslint-disable-next-line
    'update:width': (_value: number) => true,
  },
  setup(props, { emit }) {
    const isQualityVisible = computed(() => {
      const format = props.exportConfig.value.format;
      return format === 'image/jpeg' || format === 'image/webp';
    });

    function handleWidthChange(e: Event) {
      const target = e.target as HTMLInputElement | null;
      const val = parsePositiveInt(target?.value ?? '');
      const canvas = props.canvasRef.value;
      if (!canvas || !val) return;
      if (canvas.width <= 0 || canvas.height <= 0) return;

      const ratio = canvas.height / canvas.width;
      // props.exportConfig.value.height = Math.round(val * ratio);
      emit('update:height', Math.round(val * ratio));
    }

    function handleHeightChange(e: Event) {
      const target = e.target as HTMLInputElement | null;
      const val = parsePositiveInt(target?.value ?? '');
      const canvas = props.canvasRef.value;
      if (!canvas || !val) return;
      if (canvas.width <= 0 || canvas.height <= 0) return;

      const ratio = canvas.width / canvas.height;
      emit('update:width', Math.round(val * ratio));
    }

    return render;

    function render() {
      return (
        <Modal
          open={props.open}
          onUpdate:open={(value: boolean) => emit('update:open', value)}
          title="导出预览与设置"
          onOk={props.onExport}
          okText="确认下载"
          cancelText="取消"
        >
          <div class="export-summary">
            <p>
              <strong>当前配置摘要:</strong>
            </p>
            <p>- 水印文本: {props.config.value.text}</p>
            <p>
              - 字体样式: {props.config.value.fontFamily} /{' '}
              {props.config.value.fontWeight === 'bold' ? '加粗' : '常规'}
            </p>
            <p>
              - 布局信息: 间距 {props.config.value.gap}px / 角度 {props.config.value.angle}°
            </p>
          </div>
          <div class="export-settings" style={{ marginTop: '20px' }}>
            <p>
              <strong>导出参数配置:</strong>
            </p>
            <p>选择导出格式:</p>
            <Select v-model={[props.exportConfig.value.format, 'value']} style={{ width: '100%' }}>
              <Select.Option value="image/png">PNG</Select.Option>
              <Select.Option value="image/jpeg">JPG</Select.Option>
              <Select.Option value="image/webp">WEBP</Select.Option>
            </Select>
            {isQualityVisible.value && (
              <>
                <p style={{ marginTop: '12px' }}>导出质量: {props.exportConfig.value.quality}%</p>
                <Slider v-model={[props.exportConfig.value.quality, 'value']} min={0} max={100} />
              </>
            )}
            <p style={{ marginTop: '12px' }}>导出分辨率:</p>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Input
                v-model={[props.exportConfig.value.width, 'value']}
                type="number"
                placeholder="宽度"
                onChange={handleWidthChange}
              />
              <span>x</span>
              <Input
                v-model={[props.exportConfig.value.height, 'value']}
                type="number"
                placeholder="高度"
                onChange={handleHeightChange}
              />
            </div>
            <p style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
              默认使用原图分辨率，支持等比调整
            </p>
          </div>
        </Modal>
      )
    }
  },
});

