import { describe, it, expect } from 'vitest';
import {
  clampInfoPanelWidth,
  INFO_PANEL_PITCH_MIN,
  INFO_PANEL_WIDTH_MIN,
} from './utils';

describe('clampInfoPanelWidth', () => {
  it('clamps to minimum panel width', () => {
    expect(clampInfoPanelWidth(100, 1200)).toBe(INFO_PANEL_WIDTH_MIN);
  });

  it('clamps to grid width minus pitch minimum', () => {
    const gridWidth = 1000;
    expect(clampInfoPanelWidth(900, gridWidth)).toBe(gridWidth - INFO_PANEL_PITCH_MIN);
  });

  it('passes through values within bounds', () => {
    expect(clampInfoPanelWidth(460, 1200)).toBe(460);
  });
});
