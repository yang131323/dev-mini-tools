import type { BaseOption } from "types/base";
import type { ColorObj, ColorType } from "@/utils/color";

import { Textarea, message } from "ant-design-vue";
import { computed, defineComponent, ref, unref } from "vue";
import { ColorFormat, colorToString, getColorFormat, getColorResult, parseColor } from "@/utils/color";
import { ColorBlock } from "@components/index";
import { CopyOutlined } from "@ant-design/icons-vue";

import "./index.scss";
import { copyText } from "@/utils/common";

type ColorItem = BaseOption<ColorType | null>;

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

function getColors(color: ColorItem) {
  const { label, value } = color;
  const list: BaseOption[]  = [];
  if (!value) return [];
  const colorItems = colorSort.filter((item) => item.key !== label);
  // const isRgb = label === ColorFormat.RGB || label === ColorFormat.RGBA || label === ColorFormat.HEX;
  // const isHsl = label === ColorFormat.HSL || label === ColorFormat.HSLA;
  // const rgbObj: RGBColor = isRgb ? (value as RGBColor) : hslToRgb(value as HSLColor);
  // const hslObj: HSLColor = isHsl ? (value as HSLColor) : rgbToHsl(value as RGBColor);
  const rgbObj = getColorResult(value)

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
      result.value = getColors(unref(current));
    }

    return render;

    function render() {
      return (
        <div class="color-page">
          <div class="color-block">
            <h3 class="block-title">格式化颜色</h3>
            <Textarea v-model:value={colorText.value} placeholder="请输入颜色" onBlur={handleBlur}></Textarea>
            <h3 class="result-title">当前颜色</h3>
            {unref(current).value && (
              <div class="current-color">
                <span class="color-label">格式：{unref(current).label}</span>
                {renderColorItem(unref(currentColorStr))}
              </div>
            )}
            <h3 class="result-title">其它格式</h3>
            {renderResult()}
          </div>
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
  }
})

export default ColorPage;
