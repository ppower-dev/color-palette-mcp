# Color Palette MCP

**[English README](./README-EN.md)**

브랜드 컬러를 입력하면 조화로운 팔레트 CSS 파일을 생성하는 MCP 서버입니다.

## 주요 기능

- **브랜드 컬러 기반 팔레트 생성**: 하나의 헥스 코드로 50~900 스케일의 체계적인 색상 팔레트 생성
- **🤖 AI 동적 색상 생성**: 자연어 프로젝트 설명만으로 맞춤형 색상 변수 자동 생성
- **프로젝트별 맞춤 색상**: 이커머스, 대시보드, WebRTC, 블로그 등 용도별 전용 컬러 제공
- **접근성 검증**: WCAG AA/AAA 기준 대비율 체크 및 개선 방안 제시
- **다양한 포맷 지원**: CSS Variables, Tailwind Config, SCSS, Figma Tokens, React Native 출력
- **기존 CSS 현대화**: 레거시 CSS에서 색상 추출하여 체계적인 컬러 시스템으로 변환
- **실시간 미리보기**: 생성된 팔레트를 적용한 샘플 UI HTML 제공

## 설치 및 설정

### 1. 패키지 설치
```bash
npm install -g color-palette-mcp
```
설치 완료 후 올바른 설정 경로가 자동으로 표시됩니다! 📋

### 2. Claude Desktop 연결
Claude Desktop 설정 파일을 수정하세요:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`  
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`  
**Linux**: `~/.config/Claude/claude_desktop_config.json`

#### 방법 1: 절대 경로 사용 (권장 ✅)
설치 후 표시되는 절대 경로를 사용:
```json
{
  "mcpServers": {
    "color-palette": {
      "command": "/your/npm/global/bin/color-palette-mcp"
    }
  }
}
```

#### 방법 2: npx 사용 (간편함 ⚡)
```json
{
  "mcpServers": {
    "color-palette": {
      "command": "npx",
      "args": ["color-palette-mcp"]
    }
  }
}
```

### 설정 경로 찾기 💡
올바른 경로를 찾으려면:
```bash
# macOS/Linux
which color-palette-mcp

# Windows  
where color-palette-mcp

# npm 전역 경로 확인
npm config get prefix
```

설정 후 Claude Desktop을 재시작하면 색상 팔레트 도구들이 활성화됩니다.

### 3. Cursor 연결
Cursor에서 사용하려면 Cursor 설정에서 MCP 서버를 추가하세요:

**설정 방법**:
1. Cursor > Settings > Extensions > MCP
2. 새 MCP 서버 추가:
   - **Name**: color-palette
   - **Command**: color-palette-mcp
   - **Args**: (비워둠)

또는 Cursor 설정 파일에 직접 추가:
```json
{
  "mcp.servers": {
    "color-palette": {
      "command": "color-palette-mcp"
    }
  }
}
```

## 사용법

### 기본 팔레트 생성
```
브랜드 컬러 #3b82f6로 현대적인 스타일의 CSS 팔레트 생성해줘
```
**Cursor에서**: `@color-palette 브랜드 컬러 #3b82f6로 팔레트 생성`

### 프로젝트별 확장 팔레트
```
#22c55e 색상으로 이커머스 프로젝트용 팔레트 생성해줘 (할인가격, 재고상태 색상 포함)
```

### 🤖 AI 동적 색상 생성 (NEW!)
어떤 종류의 프로젝트든 자연어로 설명하면 AI가 맞춤 색상을 자동 생성합니다:

```
"의료진 전용 병원 관리 시스템을 만들고 있어. 응급상황, 수술실 상태, 환자 중증도, 의료진 역할별 구분이 필요해"
```

```
"암호화폐 거래소 대시보드야. 상승/하락, 매수/매도, 위험도, 알람 등급, 지갑 상태 색상이 필요해"
```

```  
"게임 길드 관리 툴이야. 플레이어 등급, 퀘스트 상태, 아이템 희귀도, PvP 순위, 길드 랭킹 색상 만들어줘"
```

### 포맷 지정 출력
생성할 때 원하는 포맷을 명시하면 해당 형태로 출력됩니다:

**CSS Variables**:
```
#ff6b6b로 팔레트 생성하고 CSS 변수 형태로 출력해줘
```

**Tailwind Config**:
```
#3b82f6로 팔레트 만들고 Tailwind 설정 형태로 내보내줘
```

**SCSS Variables**:
```
브랜드 컬러로 SCSS 변수 형태의 색상 시스템 만들어줘
```

### 접근성 검증
```
텍스트 색상 #333333과 배경 색상 #ffffff의 접근성을 WCAG AA 기준으로 검증해줘
```

### 기존 CSS 현대화
```css
/* 기존 CSS를 채팅에 붙여넣고 */
.primary { color: #007bff; }
.secondary { color: #28a745; }
```
```
위 CSS의 색상들을 추출해서 현대적인 컬러 시스템으로 변환해줘
```

### 팔레트 미리보기
```
#ff6b6b 색상으로 vibrant 스타일 팔레트 만들고 버튼, 카드 컴포넌트 미리보기 HTML 생성해줘
```

## 지원하는 스타일

- **modern**: 균형잡힌 현대적 디자인 (기본값)
- **vibrant**: 생동감 있는 높은 채도
- **muted**: 차분하고 세련된 낮은 채도  
- **minimal**: 미니멀한 저채도

## 프로젝트 타입별 특화 색상

### 이커머스
- **가격 관련**: 원가, 할인가, 세일가
- **재고 상태**: 충분, 보통, 부족, 품절
- **배송**: 무료배송, 특급배송, 일반배송
- **상품 상태**: 신상품, 베스트셀러, 추천상품

### 대시보드
- **메트릭**: 증가, 감소, 중립, 상승 추세, 하락 추세
- **차트**: 5가지 라인 컬러 세트
- **상태**: 온라인, 오프라인, 바쁨, 자리비움
- **알림**: 높음, 보통, 낮음 우선순위

### WebRTC
- **카메라/마이크**: 활성, 비활성, 음소거
- **연결 품질**: 최고, 좋음, 보통, 나쁨, 끊김
- **녹화**: 진행중, 일시정지, 정지
- **화면공유 및 참가자 상태**

## 출력 포맷 예시

### CSS Variables
```css
:root {
  --color-primary-500: 59 130 246;
  --color-background: var(--color-neutral-50);
  --color-button-primary: var(--color-primary-500);
}
```

### Tailwind Config
```js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: { 
          50: '#eff6ff',
          500: '#3b82f6',
          900: '#1e3a8a'
        }
      }
    }
  }
}
```

### SCSS Variables
```scss
$primary-500: #3b82f6;
$background: $neutral-50;
$button-primary: $primary-500;
```

### Figma Tokens
```json
{
  "color": {
    "primary": {
      "500": {
        "value": "#3b82f6",
        "type": "color"
      }
    }
  }
}
```

## 개발자용

### 로컬 개발
```bash
git clone https://github.com/ppower-dev/color-palette-mcp.git
cd color-palette-mcp
npm install
npm run build
npm run dev  # 개발 서버 실행
```

### 명령어
```bash
npm run build     # TypeScript 컴파일
npm run test      # Jest 테스트 실행
npm run watch     # 파일 변경 감지
npm run dev       # 개발 서버 실행
```

## 문제해결

### ❌ "서버를 찾을 수 없습니다" 오류
**증상**: `spawn color-palette-mcp ENOENT` 또는 서버 연결 실패

**해결방법**:
1. **절대 경로 확인**: 
   ```bash
   which color-palette-mcp
   # 또는 npm config get prefix
   ```
   결과를 설정 파일의 `command`에 정확히 입력

2. **npx 방법 사용**:
   ```json
   {
     "mcpServers": {
       "color-palette": {
         "command": "npx",
         "args": ["color-palette-mcp"]
       }
     }
   }
   ```

3. **설치 확인**:
   ```bash
   npm list -g color-palette-mcp
   ```

### ❌ EPIPE 오류 (연결 끊김)
**증상**: `Error: write EPIPE` 로그에 표시

**해결방법**:
- Claude Desktop 완전 종료 후 재시작
- 설정 파일 구문 오류 확인 (JSON 형식 검증)

### ❌ 색상이 제대로 생성되지 않는 경우
- 헥스 코드 형식 확인 (`#000000` 또는 `#000` 형태)
- 유효한 색상 값인지 확인
- 브랜드 컬러는 너무 어두우거나 밝지 않게 (중간 톤 권장)

### 🔍 디버깅 로그 확인
**macOS**: `~/Library/Logs/Claude/mcp*.log`  
**Windows**: `%LOCALAPPDATA%\Claude\logs\mcp*.log`

### 📞 추가 도움이 필요하면
[GitHub Issues](https://github.com/ppower-dev/color-palette-mcp/issues)에 다음 정보와 함께 문의:
- 운영체제 및 Claude 버전
- `npm config get prefix` 결과
- 설정 파일 내용
- 오류 로그


## 기여하기

이슈나 PR은 언제든 환영합니다!

---

**팁**: 생성된 팔레트는 Material Design과 Tailwind CSS 표준을 따르며, 자동으로 다크모드까지 고려해서 제공됩니다.