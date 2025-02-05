export function toHex(num: number) {
  const hex = num.toString(16);
  return hex.padStart(2, "0");
}