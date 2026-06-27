export const attackerSlot = (slots) => (slots.find((s) => s.type === 'ST') || slots[0]).id;

export const INFO_PANEL_WIDTH_MIN = 300;
export const INFO_PANEL_PITCH_MIN = 360;
export const INFO_PANEL_WIDTH_VAR = '--info-width';

/** @param {number} next @param {number} gridWidth */
export function clampInfoPanelWidth(next, gridWidth) {
  return Math.max(INFO_PANEL_WIDTH_MIN, Math.min(gridWidth - INFO_PANEL_PITCH_MIN, next));
}
