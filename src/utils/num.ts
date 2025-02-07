export function toHex(num: number) {
  const hex = num.toString(16);
  return hex.padStart(2, "0").slice(0, 2);
}

export function numToPercentage(num: number, isPercent = true) {
  return `${ isPercent ? num : num * 100 }%`;
}

export function digitalDecimal(num: number, decimal: number) {
  const rate = Math.pow(10, decimal);
  return Math.round(num * rate) / rate;
}

export function percentageStrToNum(str: string) {
  str = str.trim();
  if (str.endsWith("%")) {
    return parseFloat(str);
  } else {
    return parseFloat(str) * 100;
  }
}

// export function strToPercentage(str: string) {
//   return numToPercentage(parseFloat(str));
// }