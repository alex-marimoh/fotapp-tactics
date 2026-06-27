export const withA = (hex, a) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};

export const cardBg = (T) => (T.flat ? T.cardTo : `linear-gradient(160deg,${T.cardFrom},${T.cardTo})`);

export function decidedCount(decisions) {
  return Object.values(decisions).filter((d) => d?.verdict).length;
}
