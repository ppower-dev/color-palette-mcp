import type { ColorScale, HSL, PaletteStyle, BasePalette } from '../types/index.js';
import { hexToHsl, hslToHex, expandHex, isValidHex, rotateHue } from './color-utils.js';

// 스타일별 색상 조정 설정
const styleConfigs = {
  modern: { saturationBoost: 0, lightnessRange: [5, 95] },
  vibrant: { saturationBoost: 15, lightnessRange: [10, 90] },
  muted: { saturationBoost: -20, lightnessRange: [15, 85] },
  minimal: { saturationBoost: -30, lightnessRange: [20, 80] }
};

// 스케일별 밝기 매핑 (500을 기준으로)
const lightnessSteps = {
  50: 95,   // 거의 흰색
  100: 90,
  200: 80,
  300: 70,
  400: 60,
  500: 50,  // 기본값
  600: 40,
  700: 30,
  800: 20,
  900: 10   // 거의 검은색
};

// 채도 조정 (밝은 색은 채도 낮춤, 진한 색은 채도 높임)
const saturationAdjustments = {
  50: -40,
  100: -30,
  200: -20,
  300: -10,
  400: -5,
  500: 0,   // 기본값
  600: 5,
  700: 10,
  800: 15,
  900: 20
};

export function generateColorScale(baseColor: string, style: PaletteStyle = 'modern'): ColorScale {
  if (!isValidHex(baseColor)) {
    throw new Error(`Invalid hex color: ${baseColor}`);
  }

  const expandedHex = expandHex(baseColor);
  const baseHsl = hexToHsl(expandedHex);
  const config = styleConfigs[style];

  const scale: Partial<ColorScale> = {};

  for (const [step, targetLightness] of Object.entries(lightnessSteps)) {
    const stepKey = step as unknown as keyof ColorScale;
    const saturationAdjustment = saturationAdjustments[stepKey];
    
    // 스타일에 따른 채도 조정
    let adjustedSaturation = baseHsl.s + config.saturationBoost + saturationAdjustment;
    adjustedSaturation = Math.max(0, Math.min(100, adjustedSaturation));

    // 밝기 범위 제한
    const clampedLightness = Math.max(
      config.lightnessRange[0], 
      Math.min(config.lightnessRange[1], targetLightness)
    );

    const newColor = hslToHex({
      h: baseHsl.h,
      s: adjustedSaturation,
      l: clampedLightness
    });

    scale[stepKey] = newColor;
  }

  return scale as ColorScale;
}

// 중성 회색 팔레트 생성
export function generateNeutralScale(style: PaletteStyle = 'modern'): ColorScale {
  const config = styleConfigs[style];
  const scale: Partial<ColorScale> = {};

  for (const [step, lightness] of Object.entries(lightnessSteps)) {
    const stepKey = step as unknown as keyof ColorScale;
    // 중성 회색은 채도를 거의 0에 가깝게
    const saturation = style === 'minimal' ? 0 : 2;
    
    const clampedLightness = Math.max(
      config.lightnessRange[0], 
      Math.min(config.lightnessRange[1], lightness)
    );

    // 약간의 따뜻함을 위해 hue를 30도 (노란색 방향)으로
    const newColor = hslToHex({
      h: 30,
      s: saturation,
      l: clampedLightness
    });

    scale[stepKey] = newColor;
  }

  return scale as ColorScale;
}

// 상태 색상 생성 (성공, 에러, 경고, 정보)
export function generateStatusColors(style: PaletteStyle = 'modern'): {
  success: ColorScale;
  error: ColorScale;
  warning: ColorScale;
  info: ColorScale;
} {
  const baseColors = {
    success: '#22c55e',   // 초록
    error: '#ef4444',     // 빨강
    warning: '#f59e0b',   // 노랑
    info: '#3b82f6'       // 파랑
  };

  return {
    success: generateColorScale(baseColors.success, style),
    error: generateColorScale(baseColors.error, style),
    warning: generateColorScale(baseColors.warning, style),
    info: generateColorScale(baseColors.info, style)
  };
}

// 기본 팔레트 생성
export function generateBasePalette(brandColor: string, style: PaletteStyle = 'modern'): BasePalette {
  const primary = generateColorScale(brandColor, style);
  const neutral = generateNeutralScale(style);
  const statusColors = generateStatusColors(style);

  return {
    primary,
    neutral,
    ...statusColors
  };
}

// 보조 색상 추천 (색상 이론 기반)
export function suggestSecondaryColor(primaryColor: string, type: 'analogous' | 'complementary' | 'triadic' = 'analogous'): string {
  switch (type) {
    case 'complementary':
      return rotateHue(primaryColor, 180);
    case 'triadic':
      return rotateHue(primaryColor, 120);
    case 'analogous':
    default:
      return rotateHue(primaryColor, 30);
  }
}

