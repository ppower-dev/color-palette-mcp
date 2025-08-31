// 색상 타입 정의
export interface HSL {
  h: number; // 0-360
  s: number; // 0-100
  l: number; // 0-100
}

export interface RGB {
  r: number; // 0-255
  g: number; // 0-255
  b: number; // 0-255
}

// 색상 스케일 (50~900)
export interface ColorScale {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
}

// 기본 팔레트 구조
export interface BasePalette {
  primary: ColorScale;
  neutral: ColorScale;
  success: ColorScale;
  error: ColorScale;
  warning: ColorScale;
  info: ColorScale;
}

// 접근성 검증 결과
export interface AccessibilityCheck {
  contrast_ratio: number;
  wcag_aa: boolean;
  wcag_aaa: boolean;
  recommendation?: string;
}

// 팔레트 생성 옵션
export type PaletteStyle = 'modern' | 'vibrant' | 'muted' | 'minimal';
export type OutputFormat = 'css' | 'tailwind' | 'scss' | 'figma' | 'react-native';
export type ProjectType = 'ecommerce' | 'dashboard' | 'webrtc' | 'blog' | 'custom';

export interface GeneratePaletteOptions {
  brandColor: string;
  style?: PaletteStyle;
  includeNeutral?: boolean;
  format?: OutputFormat;
}

export interface ExtendPaletteOptions {
  projectType: ProjectType;
  basePalette: BasePalette;
  customNeeds?: string[];
}

export interface ValidateAccessibilityOptions {
  foreground: string;
  background: string;
  level?: 'AA' | 'AAA';
}

export interface ImportColorsOptions {
  cssContent: string;
  preserveCustom?: boolean;
  modernize?: boolean;
}

// 프로젝트별 확장 컬러
export interface ProjectColors {
  [key: string]: string;
}

// 최종 출력 결과
export interface PaletteResult {
  palette: BasePalette;
  projectColors?: ProjectColors;
  accessibility: {
    [combination: string]: AccessibilityCheck;
  };
  exports: {
    [format: string]: string;
  };
  metadata: {
    generatedAt: string;
    style: PaletteStyle;
    projectType?: ProjectType;
  };
}