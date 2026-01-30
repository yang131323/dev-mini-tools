import { message } from "ant-design-vue";

const copyStatus = new Set<string>();

/**
 * BEM 规范管理器
 */
export class BEM {
  private readonly block: string;

  constructor(block: string) {
    this.block = block;
  }

  /**
   * 生成 Block 类名: `block`
   */
  b(): string {
    return this.block;
  }

  /**
   * 生成 Element 类名: `block__element`
   * @param element 元素名
   */
  e(element: string): string {
    return `${this.block}__${element}`;
  }

  /**
   * 生成 Modifier 类名: `block--modifier`
   * @param modifier 修饰符
   */
  m(modifier: string): string {
    return `${this.block}--${modifier}`;
  }

  /**
   * 生成 Element Modifier 类名: `block__element--modifier`
   * @param element 元素名
   * @param modifier 修饰符
   */
  em(element: string, modifier: string): string {
    return `${this.e(element)}--${modifier}`;
  }
}

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
