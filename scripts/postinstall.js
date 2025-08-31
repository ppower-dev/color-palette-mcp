#!/usr/bin/env node

import { execSync } from 'child_process';
import { join } from 'path';
import { platform } from 'os';

console.log('\n🎨 Color Palette MCP 설치 완료!');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

try {
  // npm global prefix 찾기
  const globalPrefix = execSync('npm config get prefix', { encoding: 'utf8' }).trim();
  const binPath = join(globalPrefix, 'bin', 'color-palette-mcp');
  
  console.log('✅ MCP 설정을 위해 다음 경로를 사용하세요:');
  console.log(`\n📍 절대 경로: ${binPath}\n`);
  
  // 플랫폼별 설정 파일 경로
  const configPaths = {
    darwin: '~/Library/Application Support/Claude/claude_desktop_config.json',
    win32: '%APPDATA%\\Claude\\claude_desktop_config.json',
    linux: '~/.config/Claude/claude_desktop_config.json'
  };
  
  const configPath = configPaths[platform()] || configPaths.linux;
  
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
  console.error('⚠️  경로 확인 중 오류가 발생했습니다:', error.message);
  console.log('\n💡 수동 설정을 위해 다음 명령어를 실행하세요:');
  console.log('   which color-palette-mcp');
  console.log('   (Windows: where color-palette-mcp)\n');
}