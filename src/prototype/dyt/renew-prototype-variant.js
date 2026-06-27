import { readPrototypeVariant } from './prototype-variant';

const VARIANTS = ['A', 'B', 'C'];

/** @returns {boolean} */
export function isRenewPrototypeActive() {
  const v = readPrototypeVariant('renewVariant');
  return !!v && VARIANTS.includes(v.toUpperCase());
}

/** @returns {string | null} */
export function getRenewPrototypeVariant() {
  const v = readPrototypeVariant('renewVariant');
  if (!v) return null;
  const up = v.toUpperCase();
  return VARIANTS.includes(up) ? up : 'A';
}

export { VARIANTS as RENEW_PROTOTYPE_VARIANTS };
