// src/data/colors.js
// Centralized Color Map - Trap editoriale pulita

export const COLOR_MAP = {
  bg:       'var(--color-bg)',
  primary:  'var(--color-primary)',
  secondary:'var(--color-secondary)',
  tertiary: 'var(--color-tertiary)',
  accent:   'var(--color-accent)',
  neutral:  'var(--color-neutral)',
  success:  'var(--color-success)',
  warning:  'var(--color-warning)',
  bgAlt:    'var(--color-bg-alt)',
  text:     'var(--color-text)',
};

export const COLOR_RGBA = {
  bg:        'rgba(247,241,232,',
  primary:   'rgba(163,56,47,',
  secondary: 'rgba(183,132,93,',
  tertiary:  'rgba(216,182,148,',
  accent:    'rgba(106,122,127,',
  neutral:   'rgba(36,24,22,',
  success:   'rgba(157,108,77,',
  warning:   'rgba(191,91,66,',
  bgAlt:     'rgba(239,230,218,',
  text:      'rgba(36,24,22,',
};

export const getPaletteColor = (colorName, opacity = 1) => {
  if (opacity === 1) return COLOR_MAP[colorName];

  const rgbaBase = COLOR_RGBA[colorName];
  if (!rgbaBase) return COLOR_MAP[colorName];

  return `${rgbaBase}${opacity})`;
};
