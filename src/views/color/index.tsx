import type { BaseOption } from "types/base";
import type { ColorObj, ColorType } from "@/utils/color";

import { Textarea, message, Collapse, CollapsePanel, Form, FormItem, InputNumber, Tooltip } from "ant-design-vue";
import { computed, defineComponent, ref, unref, onBeforeMount, reactive } from "vue";
import { ColorFormat, colorToString, getColorFormat, getColorResult, parseColor } from "@/utils/color";
import { ColorBlock } from "@components/index";
import { CopyOutlined, CaretRightOutlined, QuestionCircleFilled } from "@ant-design/icons-vue";
import { copyText } from "@/utils/common";
import { Storage } from "@isq/storage";

import "./index.scss";
import { COLOR_SETTING } from "@/constants/key";

type ColorItem = BaseOption<ColorType | null>;

interface ColorSetting {
  decimalNum: number;
}

const options = {
  type: "local" as any,
}

const colorSort = [
  createItem(ColorFormat.HEX, "HEX"),
  createItem(ColorFormat.RGB, "RGB"),
  createItem(ColorFormat.RGBA, "RGBA"),
  createItem(ColorFormat.HSL, "HSL"),
  createItem(ColorFormat.HSLA, "HSLA"),
];

function createItem(key: string, label: string) {
  return {
    key,
    label,
  };
}

function getColors(color: ColorItem, decimal = 2) {
  const { label, value } = color;
  const list: BaseOption[]  = [];
  if (!value) return [];
  const colorItems = colorSort.filter((item) => item.key !== label);
  const rgbObj = getColorResult(value, decimal)

  for (const item of colorItems) {
    const key = item.key as keyof ColorObj;

    if (rgbObj[key]) {
      list.push({
        label: key,
        value: rgbObj[key],
      });
    }
  }

  return list;
}

const ColorPage = defineComponent({
  name: "ColorPage",
  setup() {

    const colorText = ref<string>("");
    const current = ref<ColorItem>({ label: "", value: null });
    const result = ref<BaseOption[]>([]);
    const form = reactive({
      decimalNum: 2,
    });
    const activePanel = ref("");

    const currentColorStr = computed(() => {
      if (!unref(current).value) return "";
      return colorToString(unref(current).value!);
    })

    function handleBlur() {
      const color = unref(colorText);
      if (!color) {
        current.value = { label: "", value: null };
        return;
      }
      const format = getColorFormat(color);
      const colorStr = parseColor(color);
      if (!colorStr) {
        message.warning(`解析颜色失败，请检查「${unref(colorText)}」是否符合16进制、rgb、rgba、hsl、hsla格式`, 6);
        return;
      }
      current.value = {
        label: format,
        value: colorStr,
      };
      result.value = getColors(unref(current), form.decimalNum);
    }

    function handleSettingChange() {
      Storage.setItem(COLOR_SETTING, form, options);
      handleBlur();
    }

    function initSetting() {
      Storage.getItem(COLOR_SETTING, {}, options).then((setting) => {
        const { decimalNum = 2 } = setting as ColorSetting;
        form.decimalNum = decimalNum;
      }).catch(() => {
        form.decimalNum = 2;
      }).finally(() => {
        Storage.setItem(COLOR_SETTING, form, options);
      });
    }

    onBeforeMount(() => {
      initSetting();
    });

    return render;

    function render() {
      return (
        <div class="color-page">
          {renderSettingPanel()}
          {renderColorPanel()}
          {renderToolDetail()}
        </div>
      )
    }

    function renderSettings() {
      return (
        <CollapsePanel class="settings" key="setting" header="颜色转换相关设置（精确度）">
          <Form layout="inline" model={form} class="setting-form">
            <FormItem label="精确度" name="decimalNum" class="form-item">
              <div class="tip-wrapper">
                <Tooltip placement="right" title="rgb和hsl相互转换是经过数学计算得出，可能会有精度问题，该值控制转换后保留的小数位数，采用四舍五入的方式保留小数位数">
                  {{
                    default: () => <QuestionCircleFilled class="question-icon" />,
                  }}
                </Tooltip>
                <InputNumber class="decimal-input" v-model:value={form.decimalNum} min={0} max={10} onChange={handleSettingChange} />
              </div>
            </FormItem>
          </Form>
        </CollapsePanel>
      )
    }

    function renderSettingPanel() {
      return (
        <Collapse class="setting-panel" v-model:activeKey={activePanel.value} bordered={false}>
          {{
            expandIcon: (ctx: any) => {
              return <CaretRightOutlined rotate={ctx.isActive ? 90 : 0}></CaretRightOutlined>
            },
            default: renderSettings,
          }}
        </Collapse>
      )
    }

    function renderColorPanel() {
      return (
        <div class="color-block">
          <h3 class="block-title">格式化颜色</h3>
          <Textarea v-model:value={colorText.value} placeholder="请输入颜色" onBlur={handleBlur}></Textarea>
          <div class="split-line"></div>
          <h3 class="result-title">当前颜色</h3>
          {unref(current).value && (
            <div class="current-color">
              <span class="color-label">格式：{unref(current).label}</span>
              {renderColorItem(unref(currentColorStr))}
            </div>
          )}
          <div class="split-line"></div>
          <h3 class="result-title">其它格式</h3>
          {renderResult()}
        </div>
      )
    }

    function renderResult() {
      return (
        <div class="format-result">
          {unref(result).map(({ label, value }) => {
            return (
              <div class="result-item">
                <div class="result-label">{label}</div>
                <div class="result-value">
                  {renderColorItem(value)}
                </div>
              </div>
            )
          })}
        </div>
      )
    }

    function renderColorItem(value: string) {
      return (
        <div class="color-item">
          <ColorBlock color={value} />
          <span class="color-value">{value}</span>
          <CopyOutlined class="color-copy" title="点击复制" onClick={() => copyText(value)} />
        </div>
      )
    }

    function renderToolDetail() {
      return (
        <div class="color-detail">
          <h3 class="detail-title">工具简介</h3>
          <p class="detail-content">
            工具输入支持16进制、rgb、rgba、hsl、hsla格式的颜色，会自动识别当前颜色格式（对应当前颜色部分），然后以解析出来的颜色为基础计算出其它格式的颜色。
            <ol class="detail-des">
              <li>rba支持快捷输入，如:<pre class="inline-code">23 56 78</pre>、<pre class="inline-code">23, 56, 78, 0.1</pre>，这两种格式都能识别</li>
              <li> hsl支持快捷输入，如:<pre class="inline-code">23 56% 78%</pre>、<pre class="inline-code">23, 56%, 78%, 0.1</pre>，这两种格式都能识别；<strong class="detail-tip">需要注意的是因为同时支持RGB、HSL格式快捷识别，但两种格式有一定相似性，如果没法找到HSL特殊标识，如H没有带deg、grad、rad、turn等角度标志，S、L没有带上<pre class="inline-code">%</pre>，可能会将HSL错误识别为RGB</strong></li>
              <li>hsl和rgb互转采用数学公式计算，会存在误差，详情：
                <a class="common-link" target="_blank" href="https://zh.wikipedia.org/wiki/HSL%E5%92%8CHSV%E8%89%B2%E5%BD%A9%E7%A9%BA%E9%97%B4#%E5%BE%9ERGB%E5%88%B0HSL%E6%88%96HSV%E7%9A%84%E8%BD%89%E6%8F%9B">RGB转HSL（维基百科）</a>、
                <a class="common-link" target="_blank" href="https://zh.wikipedia.org/wiki/HSL%E5%92%8CHSV%E8%89%B2%E5%BD%A9%E7%A9%BA%E9%97%B4#%E5%BE%9EHSL%E5%88%B0RGB%E7%9A%84%E8%BD%89%E6%8F%9B">HSL转RGB（维基百科）</a></li>
            </ol>
          </p>
        </div>
      )
    }
  }
})

export default ColorPage;
