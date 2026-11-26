export function toNum(d) {
  return typeof d === "number" ? d : Number(d);
}

export function roundMoney(n) {
  return Math.round(n * 100) / 100;
}
