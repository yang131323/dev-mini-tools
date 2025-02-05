import { colorToString, type ColorType } from "@/utils/color";

import { computed, defineComponent, unref, type CSSProperties, type PropType } from "vue";
import { numToPixel } from "@/utils/pixel";

import "./index.scss";

const ColorBlock = defineComponent({
  name: "ColorBlock",
  props: {
    color: {
      type: String as PropType<string | ColorType>,
      required: true,
    },
    circle: {
      type: Boolean,
      default: false,
    },
    size: {
      type: Number,
      default: 24,
    }
  },
  setup(props) {

    const colorStyle = computed(() => {
      const style: CSSProperties = {
        width: numToPixel(unref(props.size)),
        height: numToPixel(unref(props.size)),
        backgroundColor: colorToString(unref(props.color)),
        flex: `0 0 ${numToPixel(unref(props.size))}`,
      }

      if (unref(props.circle)) {
        style.borderRadius = "50%";
      }

      return style;
    });

    return render;

    function render() {
      return (
        <div class="color-block" style={unref(colorStyle)}></div>
      )
    }
  }
});

export default ColorBlock;
