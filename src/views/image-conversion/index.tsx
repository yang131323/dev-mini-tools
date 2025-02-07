import { defineComponent } from "vue";
import { Result } from "ant-design-vue";

import "./index.scss";

const ImageConversion = defineComponent({
  name: "ImageConversion",
  setup() {
    return render;

    function render() {
      return (
        <Result status="404" title="当前功能正在努力开发～"></Result>
      )
    }
  },
});

export default ImageConversion;
