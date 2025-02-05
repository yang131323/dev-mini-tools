import { message } from "ant-design-vue";

const copyStatus = new Set<string>();
export function copyText(text: string) {
  return new Promise((resolve) => {
    if (copyStatus.has(text)) return resolve(1);
    copyStatus.add(text);
    setTimeout(() => {
      let result = 0;
      try {
        if (navigator?.clipboard) {
          navigator.clipboard.writeText(text);
          message.success("复制成功～", 5);
        } else {
          const textarea = document.createElement("textarea");

          const style =
            "position: fixed;z-index: -100;top: -100px;left: -100%;clip: rect(0 0 0 0)";

          textarea.setAttribute("style", style);

          document.body.appendChild(textarea);

          textarea.value = text;
          textarea.select();
          document.execCommand("copy", true);
          document.body.removeChild(textarea);
          message.success("复制成功～", 5);
        }
      } catch (error) {
        result = -1;
        message.error("复制失败～", 5);
        console.error("[copyText fail]: ", error);
      }

      setTimeout(() => {
        copyStatus.delete(text);
        resolve(result);
      }, 150);
    });
  });
}