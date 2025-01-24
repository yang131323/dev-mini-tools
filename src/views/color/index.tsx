import { Textarea } from "ant-design-vue";
import { defineComponent, ref, unref } from "vue";

import "./index.scss";

function createItem(key: string, label: string) {
  return {
    key,
    label,
  };
}

const ColorPage = defineComponent({
  name: "ColorPage",
  setup() {
    const colorText = ref<string>("");
    const result = ref<string[]>([]);
    const items = [
      createItem("hex", "HEX"),
      createItem("rgb", "RGB"),
      createItem("rgba", "RGBA"),
      createItem("hsl", "HSL"),
      createItem("hsla", "HSLA"),
    ];

    return render;

    function render() {
      return (
        <div class="color-page">
          <div class="color-block">
            <h3 class="block-title">格式化颜色</h3>
            <Textarea v-model={colorText} placeholder="请输入颜色"></Textarea>
            <h3 class="result-title">格式化结果</h3>
            {renderResult()}
          </div>
        </div>
      )
    }

    function renderResult() {
      return (
        <div class="format-result">
          {unref(items).map(({ label }, index) => {
            return (
              <div class="result-item">
                <div class="item-title">{label}</div>
                <div class="item-value">{unref(result)[index]}</div>
              </div>
            )
          })}
        </div>
      )
    }
  }
})

export default ColorPage;
