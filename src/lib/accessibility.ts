import type { AccessibilityCheck } from '../types/index.js';
import { calculateContrastRatio, adjustLightness, hexToHsl } from './color-utils.js';

// WCAG 기준값
const WCAG_STANDARDS = {
  AA_NORMAL: 4.5,
  AA_LARGE: 3.0,
  AAA_NORMAL: 7.0,
  AAA_LARGE: 4.5
};

export function validateAccessibility(
  foreground: string, 
  background: string, 
  level: 'AA' | 'AAA' = 'AA',
  isLargeText: boolean = false
): AccessibilityCheck {
  const contrastRatio = calculateContrastRatio(foreground, background);
  
  // 기준값 선택
  const threshold = isLargeText 
    ? (level === 'AA' ? WCAG_STANDARDS.AA_LARGE : WCAG_STANDARDS.AAA_LARGE)
    : (level === 'AA' ? WCAG_STANDARDS.AA_NORMAL : WCAG_STANDARDS.AAA_NORMAL);

  const wcagAA = contrastRatio >= WCAG_STANDARDS.AA_NORMAL;
  const wcagAAA = contrastRatio >= WCAG_STANDARDS.AAA_NORMAL;
  const meetsCurrent = contrastRatio >= threshold;

  let recommendation: string | undefined;
  
  if (!meetsCurrent) {
    // 대안 색상 추천
    const suggestedForeground = suggestBetterContrast(foreground, background, threshold);
    recommendation = `현재 대비율 ${contrastRatio}:1이 기준 ${threshold}:1 미달. 텍스트 색상을 ${suggestedForeground}로 변경하거나 배경색을 조정하세요.`;
  }

  return {
    contrast_ratio: contrastRatio,
    wcag_aa: wcagAA,
    wcag_aaa: wcagAAA,
    recommendation
  };
}

// 더 나은 대비를 위한 색상 추천
function suggestBetterContrast(foreground: string, background: string, targetRatio: number): string {
  let adjustedColor = foreground;
  let currentRatio = calculateContrastRatio(foreground, background);
  
  // 밝기를 조정해서 목표 대비율 달성 시도
  const step = currentRatio < targetRatio ? -5 : 5; // 부족하면 더 어둡게, 과하면 더 밝게
  
  for (let adjustment = step; Math.abs(adjustment) <= 50; adjustment += step) {
    const testColor = adjustLightness(foreground, adjustment);
    const testRatio = calculateContrastRatio(testColor, background);
    
    if (testRatio >= targetRatio) {
      adjustedColor = testColor;
      break;
    }
  }
  
  return adjustedColor;
}

// 팔레트 전체 접근성 검증
export function validatePaletteAccessibility(palette: any): Record<string, AccessibilityCheck> {
  const results: Record<string, AccessibilityCheck> = {};
  
  // 자주 사용되는 조합들 검증
  const commonCombinations = [
    { name: 'primary-on-white', fg: palette.primary['500'], bg: '#ffffff' },
    { name: 'white-on-primary', fg: '#ffffff', bg: palette.primary['500'] },
    { name: 'primary-dark-on-white', fg: palette.primary['700'], bg: '#ffffff' },
    { name: 'neutral-text-on-white', fg: palette.neutral['700'], bg: '#ffffff' },
    { name: 'muted-text-on-white', fg: palette.neutral['500'], bg: '#ffffff' },
    { name: 'error-on-white', fg: palette.error['500'], bg: '#ffffff' },
    { name: 'success-on-white', fg: palette.success['500'], bg: '#ffffff' }
  ];

  for (const combo of commonCombinations) {
    results[combo.name] = validateAccessibility(combo.fg, combo.bg, 'AA');
  }

  return results;
}

// 색맹 친화적인지 체크 (기본적인 휴리스틱)
export function checkColorBlindFriendly(colors: string[]): {
  protanopia: boolean;
  deuteranopia: boolean;
  tritanopia: boolean;
  recommendations: string[];
} {
  const recommendations: string[] = [];
  
  // 빨강-초록 구분 문제 (가장 흔한 색맹)
  const hasRedGreenIssue = colors.some(color1 => 
    colors.some(color2 => {
      const hsl1 = hexToHsl(color1);
      const hsl2 = hexToHsl(color2);
      
      // 빨강(0도)과 초록(120도) 근처에서 비슷한 밝기
      const isRedish = hsl1.h < 30 || hsl1.h > 330;
      const isGreenish = hsl2.h > 90 && hsl2.h < 150;
      const similarLightness = Math.abs(hsl1.l - hsl2.l) < 20;
      
      return isRedish && isGreenish && similarLightness;
    })
  );

  if (hasRedGreenIssue) {
    recommendations.push('빨강과 초록의 밝기 차이를 늘리거나 패턴/아이콘을 함께 사용하세요');
  }

  return {
    protanopia: !hasRedGreenIssue,    // 적색맹
    deuteranopia: !hasRedGreenIssue,  // 녹색맹 
    tritanopia: true, // 청색맹은 덜 흔해서 기본 true
    recommendations
  };
}