export const COMPONENT_COLORS = ['#1EFF00', '#D71111', '#C61998'];

export const COMPONENT_FILL_OPACITY = [0.3, 0.5, 0.6];
export const COMPONENT_NODE_STROKE_COLOR = '#44516F';
export const COMPONENT_MATRIX_STROKE_COLOR = '#5D74C8';
export const COMPONENT_RESULT_STROKE_COLOR = '#2F3A55';

const clampToByte = (value: number): number => Math.max(0, Math.min(255, Math.round(value)));

const toHexByte = (value: number): string => clampToByte(value).toString(16).padStart(2, '0');

const hslToHex = (hue: number, saturationPercent: number, lightnessPercent: number): string => {
  const saturation = saturationPercent / 100;
  const lightness = lightnessPercent / 100;
  const hueNormalized = ((hue % 360) + 360) % 360;
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const huePrime = hueNormalized / 60;
  const secondComponent = chroma * (1 - Math.abs((huePrime % 2) - 1));

  let red = 0;
  let green = 0;
  let blue = 0;

  if (huePrime >= 0 && huePrime < 1) {
    red = chroma;
    green = secondComponent;
  } else if (huePrime >= 1 && huePrime < 2) {
    red = secondComponent;
    green = chroma;
  } else if (huePrime >= 2 && huePrime < 3) {
    green = chroma;
    blue = secondComponent;
  } else if (huePrime >= 3 && huePrime < 4) {
    green = secondComponent;
    blue = chroma;
  } else if (huePrime >= 4 && huePrime < 5) {
    red = secondComponent;
    blue = chroma;
  } else {
    red = chroma;
    blue = secondComponent;
  }

  const m = lightness - chroma / 2;

  return `#${toHexByte((red + m) * 255)}${toHexByte((green + m) * 255)}${toHexByte((blue + m) * 255)}`;
};

export const getComponentColor = (componentIndex: number): string => {
  if (componentIndex < COMPONENT_COLORS.length) {
    return COMPONENT_COLORS[componentIndex];
  }

  const overflowIndex = componentIndex - COMPONENT_COLORS.length;
  const hue = (31 + overflowIndex * 47) % 360;

  return hslToHex(hue, 68, 62);
};

export const getComponentFillOpacity = (componentIndex: number): number => {
  if (componentIndex < COMPONENT_FILL_OPACITY.length) {
    return COMPONENT_FILL_OPACITY[componentIndex];
  }

  return 0.45;
};

export const getComponentFillOpacityByColor = (componentColor: string): number => {
  const normalized = componentColor.toUpperCase();
  const index = COMPONENT_COLORS.findIndex((presetColor) => presetColor.toUpperCase() === normalized);

  if (index >= 0) {
    return getComponentFillOpacity(index);
  }

  return 0.45;
};

export const hexToRgba = (hexColor: string, alpha: number): string => {
  const normalized = hexColor.replace('#', '');

  if (normalized.length !== 6) {
    return `rgba(255, 255, 255, ${alpha})`;
  }

  const red = Number.parseInt(normalized.slice(0, 2), 16);
  const green = Number.parseInt(normalized.slice(2, 4), 16);
  const blue = Number.parseInt(normalized.slice(4, 6), 16);

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
};

export const EDGE_BASE_COLOR = '#61708F';
export const EDGE_HOVER_COLOR = '#8EA2FF';
export const EDGE_SELECTED_COLOR = '#8EA2FF';
export const EDGE_TEMPORARY_COLOR = '#8EA2FF';

export const EDGE_STROKE_WIDTH = 2.2;
export const EDGE_HITBOX_WIDTH = 12;
export const EDGE_SELECTED_DASHARRAY = '7 5';
export const EDGE_TEMPORARY_DASHARRAY = '7 5';

export const EDGE_MUTUAL_MIN_CURVE_OFFSET = 26;
export const EDGE_MUTUAL_MAX_CURVE_OFFSET = 46;
