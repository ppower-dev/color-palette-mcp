# Color Palette MCP

**[한국어 README](./README.md)**

An MCP server that generates harmonious color palette CSS files from brand colors.

## Key Features

- **Brand Color-Based Palette Generation**: Create systematic color palettes with 50~900 scales from a single hex code
- **Project-Specific Customization**: Specialized colors for ecommerce, dashboard, WebRTC, blog projects
- **Accessibility Validation**: WCAG AA/AAA contrast ratio checking with improvement suggestions
- **Multiple Format Support**: CSS Variables, Tailwind Config, SCSS, Figma Tokens, React Native output
- **Legacy CSS Modernization**: Extract colors from existing CSS and convert to systematic color systems
- **Live Preview**: Generate sample UI HTML with applied palettes

## Installation & Setup

### 1. Install Package
```bash
npm install -g color-palette-mcp
```

### 2. Claude Desktop Connection
Edit Claude Desktop configuration file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`  
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "color-palette": {
      "command": "color-palette-mcp"
    }
  }
}
```

Restart Claude Desktop after configuration.

### 3. Cursor Connection
To use with Cursor, add MCP server in Cursor settings:

**Setup Method**:
1. Cursor > Settings > Extensions > MCP
2. Add new MCP server:
   - **Name**: color-palette
   - **Command**: color-palette-mcp
   - **Args**: (leave empty)

Or add directly to Cursor settings file:
```json
{
  "mcp.servers": {
    "color-palette": {
      "command": "color-palette-mcp"
    }
  }
}
```

## Usage

### Basic Palette Generation
```
Generate a modern style CSS palette from brand color #3b82f6
```
**In Cursor**: `@color-palette Generate palette from #3b82f6`

### Project-Specific Extended Palette
```
Create an ecommerce project palette from #22c55e (include discount prices, stock status colors)
```

### Format-Specific Output
Specify desired format when generating:

**CSS Variables**:
```
Create palette from #ff6b6b and output as CSS variables
```

**Tailwind Config**:
```
Generate palette from #3b82f6 and export as Tailwind configuration
```

**SCSS Variables**:
```
Create color system from brand color and output as SCSS variables
```

### Accessibility Validation
```
Validate accessibility between text color #333333 and background #ffffff using WCAG AA standards
```

### Legacy CSS Modernization
```css
/* Paste existing CSS */
.primary { color: #007bff; }
.secondary { color: #28a745; }
```
```
Extract colors from the above CSS and convert to modern color system
```

### Palette Preview
```
Create vibrant style palette from #ff6b6b and generate preview HTML for button, card components
```

## Supported Styles

- **modern**: Balanced contemporary design (default)
- **vibrant**: Lively high saturation
- **muted**: Calm and sophisticated low saturation
- **minimal**: Minimalist ultra-low saturation

## Project-Specific Colors

### Ecommerce
- **Pricing**: Original, discount, sale prices
- **Stock Status**: High, medium, low, out of stock
- **Shipping**: Free, express, standard shipping
- **Product Status**: New, bestseller, featured

### Dashboard
- **Metrics**: Positive, negative, neutral, trending up/down
- **Charts**: 5-color line set
- **Status**: Online, offline, busy, away
- **Notifications**: High, medium, low priority

### WebRTC
- **Camera/Mic**: Active, inactive, muted
- **Connection Quality**: Excellent, good, fair, poor, lost
- **Recording**: Active, paused, stopped
- **Screen sharing and participant status**

## Output Format Examples

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

## For Developers

### Local Development
```bash
git clone https://github.com/ppower-dev/color-palette-mcp.git
cd color-palette-mcp
npm install
npm run build
npm run dev  # Start development server
```

### Commands
```bash
npm run build     # Compile TypeScript
npm run test      # Run Jest tests
npm run watch     # Watch file changes
npm run dev       # Run development server
```

## Troubleshooting

### MCP Server Not Recognized
1. Restart Claude Desktop/Cursor
2. Verify configuration file path
3. Check global installation with `npm list -g color-palette-mcp`

### Colors Not Generated Properly
- Verify hex code format (#000000)
- Ensure valid color values


## Contributing

Issues and PRs are always welcome!

---

**Tip**: Generated palettes follow Material Design and Tailwind CSS standards, automatically including dark mode considerations.