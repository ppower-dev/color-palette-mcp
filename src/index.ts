#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

// 내부 모듈들
import { generateBasePalette } from './lib/palette-generator.js';
import { generateProjectColors, generateDynamicProjectColors } from './lib/project-colors.js';
import { validateAccessibility, validatePaletteAccessibility } from './lib/accessibility.js';
import { exportToCSS, exportToTailwind, exportToSCSS, exportToFigma, exportToReactNative, exportToDynamicCSS, exportToDynamicTailwind, exportToDynamicSCSS, exportToDynamicFigma, exportToDynamicReactNative } from './lib/exporters.js';
import { extractColorsFromCSS } from './lib/color-utils.js';
import type { PaletteResult, OutputFormat, ProjectType, PaletteStyle } from './types/index.js';

// 스키마 정의
const GeneratePaletteSchema = z.object({
  brandColor: z.string().regex(/^#[0-9A-Fa-f]{3,6}$/, 'Valid hex color required'),
  style: z.enum(['modern', 'vibrant', 'muted', 'minimal']).default('modern'),
  includeNeutral: z.boolean().default(true),
  format: z.enum(['css', 'tailwind', 'scss', 'figma', 'react-native']).default('css')
});

const ExtendPaletteSchema = z.object({
  projectType: z.enum(['ecommerce', 'dashboard', 'webrtc', 'blog', 'custom']),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{3,6}$/, 'Valid hex color required'),
  style: z.enum(['modern', 'vibrant', 'muted', 'minimal']).default('modern'),
  customNeeds: z.array(z.string()).optional(),
  format: z.enum(['css', 'tailwind', 'scss', 'figma', 'react-native']).default('css')
});

const ValidateAccessibilitySchema = z.object({
  foreground: z.string().regex(/^#[0-9A-Fa-f]{3,6}$/, 'Valid hex color required'),
  background: z.string().regex(/^#[0-9A-Fa-f]{3,6}$/, 'Valid hex color required'),
  level: z.enum(['AA', 'AAA']).default('AA'),
  isLargeText: z.boolean().default(false)
});

const ImportColorsSchema = z.object({
  cssContent: z.string(),
  preserveCustom: z.boolean().default(true),
  modernize: z.boolean().default(true),
  format: z.enum(['css', 'tailwind', 'scss', 'figma', 'react-native']).default('css')
});

const PreviewPaletteSchema = z.object({
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{3,6}$/, 'Valid hex color required'),
  style: z.enum(['modern', 'vibrant', 'muted', 'minimal']).default('modern'),
  components: z.array(z.enum(['button', 'card', 'form', 'navigation', 'all'])).default(['button', 'card'])
});

const GenerateDynamicColorsSchema = z.object({
  projectDescription: z.string().min(5, 'Project description must be at least 5 characters'),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{3,6}$/, 'Valid hex color required'),
  maxColors: z.number().min(1).max(30).default(15),
  format: z.enum(['css', 'tailwind', 'scss', 'figma', 'react-native']).default('css')
});

// 서버 설정
const server = new Server(
  {
    name: "color-palette-server",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// 도구 목록 핸들러
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "generate_palette",
        description: "브랜드 컬러로 전체 색상 팔레트를 생성합니다. 50~900 스케일의 체계적인 색상과 시맨틱 컬러를 포함합니다.",
        inputSchema: zodToJsonSchema(GeneratePaletteSchema) as Tool["inputSchema"],
      },
      {
        name: "extend_palette_for_project", 
        description: "프로젝트 타입에 맞는 전용 색상들을 추가로 생성합니다. 이커머스, 대시보드, WebRTC 등 용도별 맞춤 컬러를 제공합니다.",
        inputSchema: zodToJsonSchema(ExtendPaletteSchema) as Tool["inputSchema"],
      },
      {
        name: "validate_accessibility",
        description: "두 색상 간의 접근성을 검증합니다. WCAG AA/AAA 기준 대비율을 체크하고 개선 방안을 제시합니다.",
        inputSchema: zodToJsonSchema(ValidateAccessibilitySchema) as Tool["inputSchema"],
      },
      {
        name: "import_existing_colors",
        description: "기존 CSS 파일에서 색상을 추출하여 현대적인 컬러 시스템으로 변환합니다. 기존 커스텀 컬러는 보존하면서 표준화합니다.",
        inputSchema: zodToJsonSchema(ImportColorsSchema) as Tool["inputSchema"],
      },
      {
        name: "preview_palette",
        description: "생성된 팔레트를 적용한 샘플 UI를 HTML로 생성합니다. 실제 적용 결과를 미리 볼 수 있습니다.",
        inputSchema: zodToJsonSchema(PreviewPaletteSchema) as Tool["inputSchema"],
      },
      {
        name: "generate_dynamic_colors",
        description: "자연어 프로젝트 설명을 분석하여 맞춤형 색상 변수를 자동 생성합니다. 어떤 종류의 프로젝트든 상관없이 AI가 적절한 색상을 추론해서 생성합니다.",
        inputSchema: zodToJsonSchema(GenerateDynamicColorsSchema) as Tool["inputSchema"],
      }
    ],
  };
});

// 도구 실행 핸들러
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const { name, arguments: args } = request.params;

    switch (name) {
      case "generate_palette": {
        const parsed = GeneratePaletteSchema.safeParse(args);
        if (!parsed.success) {
          throw new Error(`Invalid arguments: ${parsed.error.message}`);
        }

        const { brandColor, style, format } = parsed.data;
        
        // 기본 팔레트 생성
        const basePalette = generateBasePalette(brandColor, style);
        
        // 접근성 검증
        const accessibility = validatePaletteAccessibility(basePalette);
        
        // 포맷에 맞게 출력
        const exports: Record<string, string> = {};
        exports[format] = getFormattedOutput(basePalette, undefined, format);
        
        const result: PaletteResult = {
          palette: basePalette,
          accessibility,
          exports,
          metadata: {
            generatedAt: new Date().toISOString(),
            style
          }
        };

        return {
          content: [{ 
            type: "text", 
            text: `✨ 컬러 팔레트가 생성되었습니다!\n\n${JSON.stringify(result, null, 2)}` 
          }],
        };
      }

      case "extend_palette_for_project": {
        const parsed = ExtendPaletteSchema.safeParse(args);
        if (!parsed.success) {
          throw new Error(`Invalid arguments: ${parsed.error.message}`);
        }

        const { projectType, primaryColor, style, customNeeds, format } = parsed.data;
        
        // 기본 팔레트 + 프로젝트 확장 컬러 생성
        const basePalette = generateBasePalette(primaryColor, style);
        const projectColors = generateProjectColors(projectType, primaryColor, customNeeds);
        
        // 접근성 검증
        const accessibility = validatePaletteAccessibility(basePalette);
        
        // 포맷에 맞게 출력
        const exports: Record<string, string> = {};
        exports[format] = getFormattedOutput(basePalette, projectColors, format);
        
        const result: PaletteResult = {
          palette: basePalette,
          projectColors,
          accessibility,
          exports,
          metadata: {
            generatedAt: new Date().toISOString(),
            style,
            projectType
          }
        };

        return {
          content: [{ 
            type: "text", 
            text: `🎨 ${projectType} 프로젝트용 확장 팔레트가 생성되었습니다!\n\n${JSON.stringify(result, null, 2)}` 
          }],
        };
      }

      case "validate_accessibility": {
        const parsed = ValidateAccessibilitySchema.safeParse(args);
        if (!parsed.success) {
          throw new Error(`Invalid arguments: ${parsed.error.message}`);
        }

        const { foreground, background, level, isLargeText } = parsed.data;
        const result = validateAccessibility(foreground, background, level, isLargeText);

        return {
          content: [{ 
            type: "text", 
            text: `♿ 접근성 검증 결과:\n\n${JSON.stringify(result, null, 2)}` 
          }],
        };
      }

      case "import_existing_colors": {
        const parsed = ImportColorsSchema.safeParse(args);
        if (!parsed.success) {
          throw new Error(`Invalid arguments: ${parsed.error.message}`);
        }

        const { cssContent, format } = parsed.data;
        
        // CSS에서 색상 추출
        const extractedColors = extractColorsFromCSS(cssContent);
        
        if (extractedColors.length === 0) {
          throw new Error('CSS에서 유효한 색상을 찾을 수 없습니다.');
        }

        // 첫 번째 색상을 주 색상으로 사용하여 팔레트 생성
        const primaryColor = extractedColors[0];
        const basePalette = generateBasePalette(primaryColor, 'modern');
        
        // 추출된 모든 색상 정보 포함
        const result = {
          extractedColors,
          primaryColorUsed: primaryColor,
          modernizedPalette: basePalette,
          exports: {
            [format]: getFormattedOutput(basePalette, undefined, format)
          }
        };

        return {
          content: [{ 
            type: "text", 
            text: `🔄 기존 CSS에서 ${extractedColors.length}개 색상을 추출하여 현대적 팔레트로 변환했습니다!\n\n${JSON.stringify(result, null, 2)}` 
          }],
        };
      }

      case "preview_palette": {
        const parsed = PreviewPaletteSchema.safeParse(args);
        if (!parsed.success) {
          throw new Error(`Invalid arguments: ${parsed.error.message}`);
        }

        const { primaryColor, style, components } = parsed.data;
        const basePalette = generateBasePalette(primaryColor, style);
        const html = generatePreviewHTML(basePalette, components);

        return {
          content: [{ 
            type: "text", 
            text: `🎭 팔레트 미리보기 HTML이 생성되었습니다:\n\n${html}` 
          }],
        };
      }

      case "generate_dynamic_colors": {
        const parsed = GenerateDynamicColorsSchema.safeParse(args);
        if (!parsed.success) {
          throw new Error(`Invalid arguments: ${parsed.error.message}`);
        }

        const { projectDescription, primaryColor, maxColors, format } = parsed.data;
        
        // 동적 색상 생성
        const dynamicColors = generateDynamicProjectColors(
          projectDescription, 
          primaryColor, 
          maxColors
        );

        // 선택된 포맷으로 내보내기
        let exportedResult: string;
        switch (format) {
          case 'css':
            exportedResult = exportToDynamicCSS(dynamicColors, primaryColor);
            break;
          case 'tailwind':
            exportedResult = exportToDynamicTailwind(dynamicColors);
            break;
          case 'scss':
            exportedResult = exportToDynamicSCSS(dynamicColors);
            break;
          case 'figma':
            exportedResult = exportToDynamicFigma(dynamicColors);
            break;
          case 'react-native':
            exportedResult = exportToDynamicReactNative(dynamicColors);
            break;
          default:
            exportedResult = exportToDynamicCSS(dynamicColors, primaryColor);
        }

        const colorCount = Object.keys(dynamicColors).length;

        return {
          content: [{ 
            type: "text", 
            text: `🤖 AI가 "${projectDescription}" 분석 결과 ${colorCount}개의 맞춤 색상을 생성했습니다!\n\n${exportedResult}` 
          }],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [{ type: "text", text: `Error: ${errorMessage}` }],
      isError: true,
    };
  }
});

// 헬퍼 함수들
function getFormattedOutput(basePalette: any, projectColors: any, format: OutputFormat): string {
  switch (format) {
    case 'css':
      return exportToCSS(basePalette, projectColors);
    case 'tailwind':
      return exportToTailwind(basePalette, projectColors);
    case 'scss':
      return exportToSCSS(basePalette, projectColors);
    case 'figma':
      return exportToFigma(basePalette, projectColors);
    case 'react-native':
      return exportToReactNative(basePalette, projectColors);
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}

function generatePreviewHTML(palette: any, components: string[]): string {
  const css = exportToCSS(palette);
  
  const componentHTML = components.includes('all') || components.length === 0
    ? generateAllComponents()
    : components.map(comp => generateComponent(comp)).join('\n');

  return `<!DOCTYPE html>
<html>
<head>
  <style>
  ${css}
  
  body { font-family: -apple-system, sans-serif; padding: 2rem; background: rgb(var(--color-background)); }
  .preview-grid { display: grid; gap: 2rem; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); }
  </style>
</head>
<body>
  <h1 style="color: rgb(var(--color-text));">Color Palette Preview</h1>
  <div class="preview-grid">
    ${componentHTML}
  </div>
</body>
</html>`;
}

function generateComponent(type: string): string {
  switch (type) {
    case 'button':
      return `
        <div>
          <h3 style="color: rgb(var(--color-text));">Buttons</h3>
          <button style="background: rgb(var(--color-button-primary)); color: rgb(var(--color-button-primary-text)); padding: 0.5rem 1rem; border: none; border-radius: 6px; margin: 0.25rem;">Primary</button>
          <button style="background: rgb(var(--color-button-secondary)); color: rgb(var(--color-button-secondary-text)); padding: 0.5rem 1rem; border: 1px solid rgb(var(--color-border)); border-radius: 6px; margin: 0.25rem;">Secondary</button>
        </div>`;
    case 'card':
      return `
        <div>
          <h3 style="color: rgb(var(--color-text));">Cards</h3>
          <div style="background: rgb(var(--color-card)); border: 1px solid rgb(var(--color-border)); border-radius: 8px; padding: 1.5rem; margin: 0.5rem 0;">
            <h4 style="color: rgb(var(--color-text)); margin: 0 0 0.5rem 0;">Card Title</h4>
            <p style="color: rgb(var(--color-text-muted)); margin: 0;">Card content with muted text</p>
          </div>
        </div>`;
    case 'form':
      return `
        <div>
          <h3 style="color: rgb(var(--color-text));">Form Elements</h3>
          <input type="text" placeholder="Input field" style="background: rgb(var(--color-card)); border: 1px solid rgb(var(--color-border)); padding: 0.5rem; border-radius: 4px; color: rgb(var(--color-text)); margin: 0.25rem; display: block; width: 200px;">
          <input type="text" placeholder="Focused state" style="background: rgb(var(--color-card)); border: 2px solid rgb(var(--color-border-focus)); padding: 0.5rem; border-radius: 4px; color: rgb(var(--color-text)); margin: 0.25rem; display: block; width: 200px;">
        </div>`;
    case 'navigation':
      return `
        <div>
          <h3 style="color: rgb(var(--color-text));">Navigation</h3>
          <nav style="background: rgb(var(--color-card)); border: 1px solid rgb(var(--color-border)); border-radius: 8px; padding: 1rem;">
            <a href="#" style="color: rgb(var(--color-accent)); text-decoration: none; margin-right: 1rem;">Home</a>
            <a href="#" style="color: rgb(var(--color-text)); text-decoration: none; margin-right: 1rem;">About</a>
            <a href="#" style="color: rgb(var(--color-text-muted)); text-decoration: none;">Contact</a>
          </nav>
        </div>`;
    default:
      return '';
  }
}

function generateAllComponents(): string {
  return ['button', 'card', 'form', 'navigation'].map(comp => generateComponent(comp)).join('\n');
}

// 도움말 표시 함수
async function showSetupHelp() {
  const { execSync } = await import('child_process');
  const { platform } = await import('os');
  
  try {
    const globalPrefix = execSync('npm config get prefix', { encoding: 'utf8' }).trim();
    const binPath = `${globalPrefix}/bin/color-palette-mcp`;
    
    const configPaths = {
      darwin: '~/Library/Application Support/Claude/claude_desktop_config.json',
      win32: '%APPDATA%\\Claude\\claude_desktop_config.json',
      linux: '~/.config/Claude/claude_desktop_config.json'
    };
    
    const configPath = configPaths[platform() as keyof typeof configPaths] || configPaths.linux;
    
    console.log('\n🎨 Color Palette MCP 설정 안내');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ MCP 설정을 위해 다음 경로를 사용하세요:');
    console.log(`\n📍 절대 경로: ${binPath}\n`);
    console.log('📝 Claude Desktop 설정 파일 위치:');
    console.log(`   ${configPath}\n`);
    console.log('⚙️  설정 예시:');
    console.log('┌─────────────────────────────────────────┐');
    console.log('│ {                                       │');
    console.log('│   "mcpServers": {                       │');
    console.log('│     "color-palette": {                  │');
    console.log(`│       "command": "${binPath}"          │`);
    console.log('│     }                                   │');
    console.log('│   }                                     │');
    console.log('│ }                                       │');
    console.log('└─────────────────────────────────────────┘\n');
    console.log('💡 대안 방법 (npx 사용):');
    console.log('┌─────────────────────────────────────────┐');
    console.log('│ {                                       │');
    console.log('│   "mcpServers": {                       │');
    console.log('│     "color-palette": {                  │');
    console.log('│       "command": "npx",                 │');
    console.log('│       "args": ["color-palette-mcp"]     │');
    console.log('│     }                                   │');
    console.log('│   }                                     │');
    console.log('│ }                                       │');
    console.log('└─────────────────────────────────────────┘\n');
    console.log('🔄 설정 후 Claude Desktop을 재시작하세요!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('⚠️  경로 확인 중 오류가 발생했습니다:', errorMessage);
    console.log('\n💡 수동 설정을 위해 다음 명령어를 실행하세요:');
    console.log('   which color-palette-mcp');
    console.log('   (Windows: where color-palette-mcp)\n');
  }
}

// 메인 함수
async function main() {
  // 명령행 인수 처리
  const args = process.argv.slice(2);
  if (args.includes('--help') || args.includes('-h') || args.includes('--setup')) {
    await showSetupHelp();
    process.exit(0);
  }

  // 서버 실행
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Color Palette MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error running server:", error);
  process.exit(1);
});