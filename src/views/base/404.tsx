import { defineComponent } from "vue";
import { Result } from "ant-design-vue";

const ImageConversion = defineComponent({
  name: "ImageConversion",
  setup() {
    return render;

    function render() {
      return (
        <Result status="404" title="404" sub-title="当前功能正在努力开发～"></Result>
      )
    }
  },
});

export default ImageConversion;
