import type { BasePalette, ProjectColors, ColorScale } from '../types/index.js';
import { hexToRgb } from './color-utils.js';

// CSS 변수 형태로 출력
export function exportToCSS(palette: BasePalette, projectColors?: ProjectColors): string {
  const lines: string[] = [':root {'];

  // 기본 팔레트 색상들
  for (const [colorName, scale] of Object.entries(palette)) {
    lines.push(`  /* ${colorName.charAt(0).toUpperCase() + colorName.slice(1)} colors */`);
    
    for (const [step, color] of Object.entries(scale as ColorScale)) {
      const rgb = hexToRgb(color);
      lines.push(`  --color-${colorName}-${step}: ${rgb.r} ${rgb.g} ${rgb.b};`);
    }
    lines.push('');
  }

  // 시맨틱 컬러들
  lines.push('  /* Semantic colors */');
  lines.push('  --color-background: var(--color-neutral-50);');
  lines.push('  --color-card: #ffffff;');
  lines.push('  --color-border: var(--color-neutral-200);');
  lines.push('  --color-border-focus: var(--color-primary-500);');
  lines.push('');
  
  lines.push('  --color-text: var(--color-neutral-800);');
  lines.push('  --color-text-muted: var(--color-neutral-600);');
  lines.push('  --color-text-subtle: var(--color-neutral-500);');
  lines.push('');

  // 버튼 시스템
  lines.push('  /* Button system */');
  lines.push('  --color-button-primary: var(--color-primary-500);');
  lines.push('  --color-button-primary-hover: var(--color-primary-600);');
  lines.push('  --color-button-primary-text: var(--color-neutral-900);');
  lines.push('');
  
  lines.push('  --color-button-secondary: var(--color-card);');
  lines.push('  --color-button-secondary-hover: var(--color-neutral-50);');
  lines.push('  --color-button-secondary-text: var(--color-text);');
  lines.push('  --color-button-secondary-border: var(--color-border);');
  lines.push('');

  // 프로젝트별 추가 컬러들
  if (projectColors) {
    lines.push('  /* Project-specific colors */');
    for (const [name, color] of Object.entries(projectColors)) {
      const rgb = hexToRgb(color);
      lines.push(`  --color-${name}: ${rgb.r} ${rgb.g} ${rgb.b};`);
    }
    lines.push('');
  }

  // 다크모드 지원
  lines.push('}');
  lines.push('');
  lines.push('/* Dark mode */');
  lines.push('[data-theme="dark"] {');
  lines.push('  --color-background: var(--color-neutral-900);');
  lines.push('  --color-card: var(--color-neutral-800);');
  lines.push('  --color-border: var(--color-neutral-700);');
  lines.push('  --color-text: var(--color-neutral-100);');
  lines.push('  --color-text-muted: var(--color-neutral-400);');
  lines.push('  --color-text-subtle: var(--color-neutral-500);');
  lines.push('}');

  return lines.join('\n');
}

// Tailwind CSS config 형태로 출력
export function exportToTailwind(palette: BasePalette, projectColors?: ProjectColors): string {
  const config: any = {
    theme: {
      extend: {
        colors: {}
      }
    }
  };

  // 기본 팔레트
  for (const [colorName, scale] of Object.entries(palette)) {
    config.theme.extend.colors[colorName] = scale;
  }

  // 프로젝트 컬러들
  if (projectColors) {
    for (const [name, color] of Object.entries(projectColors)) {
      config.theme.extend.colors[name] = color;
    }
  }

  return `module.exports = ${JSON.stringify(config, null, 2)};`;
}

// SCSS 변수 형태로 출력
export function exportToSCSS(palette: BasePalette, projectColors?: ProjectColors): string {
  const lines: string[] = ['// Generated color palette'];

  // 기본 팔레트
  for (const [colorName, scale] of Object.entries(palette)) {
    lines.push(`\n// ${colorName.charAt(0).toUpperCase() + colorName.slice(1)} colors`);
    
    for (const [step, color] of Object.entries(scale as ColorScale)) {
      lines.push(`${colorName}-${step}: ${color};`);
    }
  }

  // 프로젝트별 컬러
  if (projectColors) {
    lines.push('\n// Project-specific colors');
    for (const [name, color] of Object.entries(projectColors)) {
      lines.push(`${name}: ${color};`);
    }
  }

  // 시맨틱 매핑
  lines.push('\n// Semantic mappings');
  lines.push('$background: $neutral-50;');
  lines.push('$card: #ffffff;');
  lines.push('$text: $neutral-800;');
  lines.push('$text-muted: $neutral-600;');
  lines.push('$border: $neutral-200;');
  lines.push('$accent: $primary-500;');

  return lines.join('\n');
}

// Figma tokens 형태로 출력  
export function exportToFigma(palette: BasePalette, projectColors?: ProjectColors): string {
  const tokens: any = {
    color: {}
  };

  // 기본 팔레트
  for (const [colorName, scale] of Object.entries(palette)) {
    tokens.color[colorName] = {};
    
    for (const [step, color] of Object.entries(scale as ColorScale)) {
      tokens.color[colorName][step] = {
        value: color,
        type: "color"
      };
    }
  }

  // 프로젝트 컬러
  if (projectColors) {
    for (const [name, color] of Object.entries(projectColors)) {
      tokens.color[name] = {
        value: color,
        type: "color"
      };
    }
  }

  return JSON.stringify(tokens, null, 2);
}

// React Native StyleSheet 형태로 출력
export function exportToReactNative(palette: BasePalette, projectColors?: ProjectColors): string {
  const lines: string[] = [
    'export const colors = {',
    '  // Base palette'
  ];

  // 기본 팔레트
  for (const [colorName, scale] of Object.entries(palette)) {
    lines.push(`  ${colorName}: {`);
    
    for (const [step, color] of Object.entries(scale as ColorScale)) {
      lines.push(`    ${step}: '${color}',`);
    }
    
    lines.push('  },');
  }

  // 프로젝트 컬러
  if (projectColors) {
    lines.push('  // Project colors');
    for (const [name, color] of Object.entries(projectColors)) {
      lines.push(`  ${name}: '${color}',`);
    }
  }

  // 시맨틱 매핑
  lines.push('  // Semantic mappings');
  lines.push("  background: '#fafafa',");
  lines.push("  card: '#ffffff',");
  lines.push("  text: '#262626',");
  lines.push("  textMuted: '#525252',");
  lines.push("  border: '#e5e5e5',");
  lines.push("  accent: '#ffd966'");
  lines.push('};');

  return lines.join('\n');
}