import type { HSL, RGB } from '../types/index.js';

// 색상 변환 함수들
export function hexToRgb(hex: string): RGB {
  const cleanHex = hex.replace('#', '');
  if (cleanHex.length !== 6) {
    throw new Error(`Invalid hex color: ${hex}`);
  }
  
  return {
    r: parseInt(cleanHex.slice(0, 2), 16),
    g: parseInt(cleanHex.slice(2, 4), 16),
    b: parseInt(cleanHex.slice(4, 6), 16),
  };
}

export function rgbToHex(rgb: RGB): string {
  const toHex = (n: number) => Math.round(Math.max(0, Math.min(255, n))).toString(16).padStart(2, '0');
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}

export function rgbToHsl(rgb: RGB): HSL {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;

  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (diff !== 0) {
    s = l > 0.5 ? diff / (2 - max - min) : diff / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / diff + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / diff + 2) / 6;
        break;
      case b:
        h = ((r - g) / diff + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

export function hslToRgb(hsl: HSL): RGB {
  const h = hsl.h / 360;
  const s = hsl.s / 100;
  const l = hsl.l / 100;

  const hue2rgb = (p: number, q: number, t: number): number => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };

  let r: number, g: number, b: number;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

export function hexToHsl(hex: string): HSL {
  return rgbToHsl(hexToRgb(hex));
}

export function hslToHex(hsl: HSL): string {
  return rgbToHex(hslToRgb(hsl));
}

// 색상 조정 함수들
export function adjustLightness(color: string, amount: number): string {
  const hsl = hexToHsl(color);
  return hslToHex({
    ...hsl,
    l: Math.max(0, Math.min(100, hsl.l + amount))
  });
}

export function adjustSaturation(color: string, amount: number): string {
  const hsl = hexToHsl(color);
  return hslToHex({
    ...hsl,
    s: Math.max(0, Math.min(100, hsl.s + amount))
  });
}

export function rotateHue(color: string, degrees: number): string {
  const hsl = hexToHsl(color);
  return hslToHex({
    ...hsl,
    h: (hsl.h + degrees) % 360
  });
}

// 상대 휘도 계산 (접근성용)
export function getRelativeLuminance(color: string): number {
  const rgb = hexToRgb(color);
  
  const normalize = (c: number): number => {
    const val = c / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  };

  const r = normalize(rgb.r);
  const g = normalize(rgb.g);
  const b = normalize(rgb.b);

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// 대비율 계산
export function calculateContrastRatio(color1: string, color2: string): number {
  const lum1 = getRelativeLuminance(color1);
  const lum2 = getRelativeLuminance(color2);
  const ratio = (Math.max(lum1, lum2) + 0.05) / (Math.min(lum1, lum2) + 0.05);
  return Math.round(ratio * 100) / 100;
}

// 색상 밝기에 따른 텍스트 색상 추천
export function getOptimalTextColor(backgroundColor: string): string {
  const luminance = getRelativeLuminance(backgroundColor);
  return luminance > 0.5 ? '#000000' : '#ffffff';
}

// 색상이 유효한 hex인지 검증
export function isValidHex(color: string): boolean {
  return /^#([0-9A-F]{3}|[0-9A-F]{6})$/i.test(color);
}

// 3자리 hex를 6자리로 확장
export function expandHex(hex: string): string {
  if (!isValidHex(hex)) {
    throw new Error(`Invalid hex color: ${hex}`);
  }
  
  if (hex.length === 4) {
    return hex.replace(/^#([0-9A-F])([0-9A-F])([0-9A-F])$/i, '#$1$1$2$2$3$3');
  }
  
  return hex.toLowerCase();
}

// CSS에서 색상 추출
export function extractColorsFromCSS(cssContent: string): string[] {
  const hexRegex = /#[0-9A-Fa-f]{3,6}/g;
  const matches = cssContent.match(hexRegex) || [];
  
  // 중복 제거하고 유효한 hex만 필터링
  const uniqueColors = [...new Set(matches)]
    .filter(color => isValidHex(color))
    .map(color => expandHex(color));

  return uniqueColors;
}