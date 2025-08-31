import { adjustLightness, adjustSaturation, rotateHue } from './color-utils.js';

export interface InferredColor {
  name: string;
  color: string;
  reasoning: string;
}

// 색상 추론 시스템
export class ColorInferenceEngine {
  private static readonly COLOR_PATTERNS = {
    // 상태/감정 기반 색상
    danger: '#dc2626',
    error: '#ef4444', 
    warning: '#f59e0b',
    success: '#22c55e',
    info: '#3b82f6',
    
    // 감정적 색상
    love: '#ec4899',
    happy: '#fbbf24',
    calm: '#06b6d4',
    energy: '#f97316',
    trust: '#3b82f6',
    
    // 기능적 색상  
    premium: '#8b5cf6',
    discount: '#dc2626',
    new: '#22c55e',
    popular: '#f59e0b',
    featured: '#8b5cf6',
    
    // 상태별
    active: '#22c55e',
    inactive: '#6b7280',
    pending: '#f59e0b',
    completed: '#22c55e',
    cancelled: '#ef4444',
    
    // 비즈니스 관련
    profit: '#22c55e', 
    loss: '#ef4444',
    neutral: '#6b7280',
    growth: '#059669',
    decline: '#dc2626'
  };

  private static readonly SEMANTIC_KEYWORDS = {
    // 긍정적 키워드
    positive: ['success', 'complete', 'done', 'good', 'best', 'premium', 'featured', 'favorite', 'like', 'love'],
    
    // 부정적 키워드  
    negative: ['error', 'fail', 'danger', 'bad', 'delete', 'remove', 'cancel', 'reject'],
    
    // 경고 키워드
    warning: ['warning', 'caution', 'pending', 'wait', 'review', 'draft', 'temporary'],
    
    // 정보 키워드
    info: ['info', 'detail', 'note', 'tip', 'help', 'guide', 'tutorial'],
    
    // 특별 키워드
    special: ['premium', 'vip', 'pro', 'plus', 'featured', 'highlight', 'important']
  };

  static inferColorsFromText(
    text: string, 
    primaryColor: string, 
    maxColors: number = 20
  ): InferredColor[] {
    const words = this.extractMeaningfulWords(text);
    const inferredColors: InferredColor[] = [];
    const usedColors = new Set<string>();
    
    for (const word of words) {
      if (inferredColors.length >= maxColors) break;
      
      const colorResult = this.inferSingleColor(word, primaryColor);
      if (colorResult && !usedColors.has(colorResult.color)) {
        inferredColors.push({
          name: this.generateColorVariableName(word),
          color: colorResult.color,
          reasoning: colorResult.reasoning
        });
        usedColors.add(colorResult.color);
      }
    }
    
    return inferredColors;
  }
  
  private static extractMeaningfulWords(text: string): string[] {
    // 한글, 영어 단어 추출 (2글자 이상)
    const words = text.toLowerCase()
      .match(/[a-zA-Z가-힣]{2,}/g) || [];
      
    // 불용어 제거
    const stopWords = new Set([
      'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
      '그리고', '그런데', '하지만', '또는', '그래서', '그리고', '이것', '저것', '우리', '나는'
    ]);
    
    return words.filter(word => 
      !stopWords.has(word) && 
      word.length >= 2
    ).slice(0, 50); // 최대 50개 단어만 처리
  }
  
  private static inferSingleColor(
    word: string, 
    primaryColor: string
  ): { color: string; reasoning: string } | null {
    
    // 1. 직접적인 색상 패턴 매칭
    for (const [pattern, color] of Object.entries(this.COLOR_PATTERNS)) {
      if (word.includes(pattern)) {
        return { 
          color, 
          reasoning: `키워드 "${word}"가 "${pattern}" 패턴과 매칭됨` 
        };
      }
    }
    
    // 2. 의미론적 분석
    const semanticColor = this.getSemanticColor(word, primaryColor);
    if (semanticColor) {
      return semanticColor;
    }
    
    // 3. 도메인 특화 추론
    const domainColor = this.getDomainSpecificColor(word, primaryColor);
    if (domainColor) {
      return domainColor;
    }
    
    return null;
  }
  
  private static getSemanticColor(
    word: string, 
    primaryColor: string
  ): { color: string; reasoning: string } | null {
    
    for (const [category, keywords] of Object.entries(this.SEMANTIC_KEYWORDS)) {
      if (keywords.some(keyword => word.includes(keyword))) {
        let color: string;
        
        switch (category) {
          case 'positive':
            color = '#22c55e';
            break;
          case 'negative':
            color = '#ef4444';
            break;
          case 'warning':
            color = '#f59e0b';
            break;
          case 'info':
            color = '#3b82f6';
            break;
          case 'special':
            color = '#8b5cf6';
            break;
          default:
            return null;
        }
        
        return { 
          color, 
          reasoning: `"${word}"가 ${category} 카테고리로 분류됨` 
        };
      }
    }
    
    return null;
  }
  
  private static getDomainSpecificColor(
    word: string, 
    primaryColor: string
  ): { color: string; reasoning: string } | null {
    
    // 결제 관련
    if (/pay|payment|card|bank|money|price|cost|fee/.test(word)) {
      return { 
        color: adjustLightness(primaryColor, -15), 
        reasoning: `결제 관련 키워드 "${word}" 감지` 
      };
    }
    
    // 사용자/계정 관련
    if (/user|account|profile|member|login|auth/.test(word)) {
      return { 
        color: adjustSaturation(primaryColor, -20), 
        reasoning: `사용자 관련 키워드 "${word}" 감지` 
      };
    }
    
    // 데이터/분석 관련
    if (/data|chart|graph|metric|analytics|report/.test(word)) {
      return { 
        color: rotateHue(primaryColor, 180), 
        reasoning: `데이터 관련 키워드 "${word}" 감지` 
      };
    }
    
    // 통신/연결 관련  
    if (/connect|network|signal|wifi|call|message/.test(word)) {
      return { 
        color: rotateHue(primaryColor, 120), 
        reasoning: `통신 관련 키워드 "${word}" 감지` 
      };
    }
    
    // 시간/일정 관련
    if (/time|date|schedule|calendar|event|deadline/.test(word)) {
      return { 
        color: adjustLightness(primaryColor, 25), 
        reasoning: `시간 관련 키워드 "${word}" 감지` 
      };
    }
    
    return null;
  }
  
  private static generateColorVariableName(word: string): string {
    // camelCase나 한글을 kebab-case로 변환
    return word
      .toLowerCase()
      .replace(/[가-힣]/g, match => {
        // 한글 음성학적 변환 (간단한 예시)
        const koreanMap: { [key: string]: string } = {
          '결제': 'payment',
          '사용자': 'user', 
          '성공': 'success',
          '실패': 'error',
          '경고': 'warning',
          '정보': 'info',
          '프리미엄': 'premium',
          '할인': 'discount',
          '신규': 'new',
          '인기': 'popular'
        };
        return koreanMap[match] || match;
      })
      .replace(/([A-Z])/g, '-$1')
      .replace(/[\s_]+/g, '-')
      .replace(/[^a-zA-Z0-9-]/g, '')
      .replace(/^-+|-+$/g, '')
      .replace(/-+/g, '-');
  }
}