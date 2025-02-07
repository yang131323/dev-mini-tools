import { toHex, digitalDecimal, numToPercentage, percentageStrToNum } from "./num";
import { isNull } from "./type";

export enum ColorFormat {
  UNKNOWN = "",
  HEX = "hex",
  RGB = "rgb",
  RGBA = "rgba",
  HSL = "hsl",
  HSLA = "hsla",
}

export interface RGBColor {
  r: number;
  g: number;
  b: number;
  a?: number;
}

export interface HSLColor {
  h: number;
  s: number;
  l: number;
  a?: number;
}

export type ColorType = RGBColor | HSLColor;

export interface ColorObj {
  hex?: string;
  rgb?: string;
  rgba?: string;
  hsl?: string;
  hsla?: string;
}

function isHslColor(arr: string[]) {
  const [h, s, l] = arr;
  const isHue = h.endsWith("deg") || h.endsWith("grad") || h.endsWith("rad") || h.endsWith("turn");

  return isHue || s.endsWith("%") || l.endsWith("%") || (s.includes(".") && l.includes("."));
}

const rgbReg = /,\s*|\s+/g;
export function getColorFormat(str: string) {
  if (str.startsWith("#")) {
    return ColorFormat.HEX;
  } else if (str.startsWith("rgb")) {
    return str.endsWith("a") ? ColorFormat.RGBA : ColorFormat.RGB;
  } else if (str.startsWith("hsl")) {
    return str.endsWith("a") ? ColorFormat.HSLA : ColorFormat.HSL;
  } else {
    const arr = str.trim().split(rgbReg);

    if (arr.length === 3) {
      return isHslColor(arr) ? ColorFormat.HSL : ColorFormat.RGB;
    } else if (arr.length === 4) {
      return isHslColor(arr) ? ColorFormat.HSLA : ColorFormat.RGBA;
    }

    return ColorFormat.UNKNOWN;
  }
}

export function parseColor(str: string) {
  if (str.startsWith("#")) {
    return parseHexColor(str);
  } else if (str.startsWith("rgb")) {
    return parseRgbaColor(str);
  } else if (str.startsWith("hsl")) {
    return parseHslColor(str);
  } else {
    return parseStrColor(str);
  }
}

export function parseHexColor(str: string): RGBColor {
  const hex = str.slice(1);
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);

  return { r, g, b };
}

export function parseStrColor(str: string) {
  const arr = str.trim().split(rgbReg);
  const len = arr.length;
  if (len !== 3 && len !== 4) return null;
  const isHsl = isHslColor(arr);
  let color: RGBColor | HSLColor;
  if (isHsl) {
    color = parseHslColor(str);
  } else {
    color = parseRgbaColor(str);
  }
  
  if (len === 3) delete color.a;

  return color;
}

export function parseRgbaColor(str: string): RGBColor {
  const colorStr = str.replace(/rgba?\(/, "").replace(")", "");
  const [r, g, b, a = "1"] = colorStr.split(/,\s*/);

  return {
    r: parseFloat(r),
    g: parseFloat(g),
    b: parseFloat(b),
    a: percentageStrToNum(a) / 100,
  };
}

export function parseHslColor(str: string): HSLColor {
  const colorStr = str.replace(/hsla?\(/, "").replace(")", "");
  const arr = colorStr.split('/');
  let a = arr[1] ?? "1";
  const [h, s, l, _a] = colorStr.split(rgbReg);

  if (_a) a = _a;

  return {
    h: parseHue(h),
    s: percentageStrToNum(s),
    l: percentageStrToNum(l),
    a: percentageStrToNum(a) / 100,
  };
}

export function parseHue(hue: string) {
  hue = hue.trim();
  if (hue.endsWith("deg")) {
    return parseFloat(hue.replace("deg", ""));
  } else if (hue.endsWith("grad")) {
    return parseFloat(hue.replace("grad", "")) * 0.9;
  } else if (hue.endsWith("rad")) {
    return parseFloat(hue.replace("rad", "")) * 180 / Math.PI;
  } else if (hue.endsWith("turn")) {
    return parseFloat(hue.replace("turn", "")) * 360;
  } else {
    return parseFloat(hue);
  }
}

export function getColorResult(color: RGBColor | HSLColor, decimal: number): ColorObj {
  if ("r" in color) {
    const hsl = rgbToHslValues(color, decimal);

    return {
      hex: rgbToHex(color),
      rgb: rgbToString(color),
      rgba: rgbToString(color, true),
      hsl: hslToString(hsl),
      hsla: hslToString(hsl, true),
    };
  } else {
    const rgb = hslToRgb(color, decimal);

    return {
      hex: rgbToHex(rgb),
      rgb: rgbToString(rgb),
      rgba: rgbToString(rgb, true),
      hsl: hslToString(color),
      hsla: hslToString(color, true),
    };
  }
}

export function rgbToHex(color: RGBColor) {
  const { r, g, b } = color;
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function rgbToString(color: RGBColor, hasAlpha = false) {
  const { r, g, b, a } = color;
  const colors = [r, g, b];
  
  if (hasAlpha) {
    colors.push(a ?? 1);
    return `rgba(${colors.join(", ")})`;
  } else {
    return `rgb(${colors.join(", ")})`;
  }
}

// export function rgbToHsl(color: RGBColor, hasAlpha = false) {
//   // const { a } = color;
//   const hsl = rgbToHslValues(color);
  
//   // if (hasAlpha) hsl.a = a ?? 1;

//   return hslToString(hsl, hasAlpha);
// }

/**
 * rgb转换为hsl公式： https://zh.wikipedia.org/wiki/HSL%E5%92%8CHSV%E8%89%B2%E5%BD%A9%E7%A9%BA%E9%97%B4
 */
export function rgbToHslValues(color: RGBColor, decimal: number): HSLColor {
  const { r, g, b, a = 1 } = color;
  const _r = r / 255;
  const _g = g / 255;
  const _b = b / 255;

  const max = Math.max(_r, _g, _b);
  const min = Math.min(_r, _g, _b);
  const delta = max - min;

  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (delta) {
    s = l >= 0.5 ? delta / (2 - max - min) : delta / (max + min);

    switch (max) {
      case _r:
        h = (_g - _b) / delta + (g < b ? 6 : 0);
        break;
      case _g:
        h = (_b - _r) / delta + 2;
        break;
      case _b:
        h = (_r - _g) / delta + 4;
        break;
    }

    h /= 6;
  }

  return {
    h: digitalDecimal(h * 360, decimal),
    s: digitalDecimal(s * 100, decimal),
    l: digitalDecimal(l * 100, decimal),
    a
  };
}

export function hslToString(color: HSLColor, hasAlpha = false) {
  const { h, s, l, a = 1 } = color;
  const values = [h, numToPercentage(s), numToPercentage(l)];
  if (!hasAlpha) return `hsl(${values.join(" ")})`;

  return `hsl(${values.join(" ")} / ${a})`;
}

export function hslToRgb(color: HSLColor, decimal: number): RGBColor {
  const { h, s, l, a = 1 } = color;
  const _h = h / 360;
  const _s = s / 100;
  const _l = l / 100;

  let r, g, b;

  if (!s) {
    r = g = b = _l;
  } else {
    const q = _l < 0.5 ? _l * (1 + _s) : _l + _s - _l * _s;
    const p = 2 * _l - q;

    r = hueToRgb(p, q, _h + 1 / 3);
    g = hueToRgb(p, q, _h);
    b = hueToRgb(p, q, _h - 1 / 3);
  }

  return {
    r: digitalDecimal(r * 255, decimal),
    g: digitalDecimal(g * 255, decimal),
    b: digitalDecimal(b * 255, decimal),
    a
  };
}

/**
 * hsl转换为rgb公式： https://zh.wikipedia.org/wiki/HSL%E5%92%8CHSV%E8%89%B2%E5%BD%A9%E7%A9%BA%E9%97%B4
 */
export function hueToRgb(p: number, q: number, t: number) {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1 / 6) return p + (q - p) * 6 * t;
  if (t < 1 / 2) return q;
  if (t < 2 / 3) return p + (q - p) * ( 2 / 3 - t ) * 6;

  return p;
}

export function colorToString(color: ColorType | string) {
  if (typeof color === "string") return color;
  if ("r" in color) {
    return isNull(color.a) ? rgbToString(color) : rgbToString(color, true);
  }

  return isNull(color.a) ? hslToString(color) : hslToString(color, true);
}