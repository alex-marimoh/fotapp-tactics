import React from 'react';

// Full skin schema — colors PLUS style tokens (font, radius, glow, flat, borders).
// The layout never changes; a skin only swaps these values. Override per render
// with the `skin` prop. DEFAULT_SKIN is the "Matchday" look: live TV-broadcast
// graphics — rich saturated grass, crisp white lines, electric blue + broadcast
// orange, Oswald condensed headlines.
export const DEFAULT_SKIN = {
  bg: '#eef2f6', panel: '#ffffff', text: '#141a22', surface: '#ffffff',
  accent: '#1463ff', accentDark: '#0b49c9', accent2: '#ff5a1f', onAccent: '#ffffff',
  solid: '#1ba24e', thin: '#e08a16', gap: '#e23b34', oop: '#7c3aed',
  pitch: ['#3aa056', '#2f9249', '#27823f'],
  ribbon: ['#ffffff', '#eef3f8'],
  cardFrom: '#ffffff', cardTo: '#eef3f8',
  // style tokens
  font: '"DM Sans", -apple-system, system-ui, sans-serif',
  display: '"Oswald", "DM Sans", system-ui, sans-serif',
  radius: 10, pill: 8,
  glow: false, flat: false,
  line: 'rgba(255,255,255,.85)',
  hair: 'rgba(12,22,40,.10)',
  hair2: 'rgba(12,22,40,.18)',
  soft: 'rgba(12,22,40,.045)',
};

export const ThemeContext = React.createContext(DEFAULT_SKIN);
export const useT = () => React.useContext(ThemeContext);
export const hcOf = (T) => ({ solid: T.solid, thin: T.thin, gap: T.gap });
export const tierColorOf = (T) => ({ nat: T.solid, sec: T.oop, oop: T.oop });
