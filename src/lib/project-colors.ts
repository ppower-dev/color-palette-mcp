import type { ProjectColors, ProjectType } from '../types/index.js';
import { adjustLightness, adjustSaturation, rotateHue, hexToHsl } from './color-utils.js';

// 프로젝트별 색상 생성기
export function generateProjectColors(
  projectType: ProjectType,
  primaryColor: string,
  customNeeds?: string[]
): ProjectColors {
  const generators = {
    ecommerce: generateEcommerceColors,
    dashboard: generateDashboardColors, 
    webrtc: generateWebRTCColors,
    blog: generateBlogColors,
    custom: (primary: string, needs?: string[]) => generateCustomColors(primary, needs || [])
  };

  return generators[projectType](primaryColor, customNeeds);
}

// 이커머스용 컬러들
function generateEcommerceColors(primaryColor: string, customNeeds?: string[]): ProjectColors {
  const colors: ProjectColors = {
    // 가격 관련
    'price-original': adjustLightness(primaryColor, -10),
    'price-discount': '#dc2626', // 강한 빨강
    'price-sale': '#ef4444',
    
    // 재고 상태
    'stock-high': '#22c55e',
    'stock-medium': '#f59e0b', 
    'stock-low': '#ef4444',
    'stock-out': '#6b7280',
    
    // 배송 관련
    'shipping-free': '#059669',
    'shipping-express': '#8b5cf6',
    'shipping-standard': '#6b7280',
    
    // 상품 상태
    'product-new': '#3b82f6',
    'product-bestseller': '#f59e0b',
    'product-featured': rotateHue(primaryColor, 30),
    
    // 결제/보안
    'secure-payment': '#22c55e',
    'payment-pending': '#f59e0b',
    'payment-failed': '#dc2626'
  };

  // 커스텀 요구사항 추가
  if (customNeeds) {
    for (const need of customNeeds) {
      if (!colors[need]) {
        colors[need] = generateCustomColorForNeed(primaryColor, need);
      }
    }
  }

  return colors;
}

// 대시보드용 컬러들  
function generateDashboardColors(primaryColor: string, customNeeds?: string[]): ProjectColors {
  return {
    // 메트릭 표시
    'metric-positive': '#22c55e',
    'metric-negative': '#ef4444',
    'metric-neutral': '#6b7280',
    'metric-trending-up': '#059669',
    'metric-trending-down': '#dc2626',
    
    // 차트 컬러 세트
    'chart-line-1': primaryColor,
    'chart-line-2': rotateHue(primaryColor, 60),
    'chart-line-3': rotateHue(primaryColor, 120),
    'chart-line-4': rotateHue(primaryColor, 180),
    'chart-line-5': rotateHue(primaryColor, 240),
    
    // 상태 표시
    'status-online': '#22c55e',
    'status-offline': '#6b7280', 
    'status-busy': '#ef4444',
    'status-away': '#f59e0b',
    
    // 알림 및 뱃지
    'notification-high': '#dc2626',
    'notification-medium': '#f59e0b',
    'notification-low': '#3b82f6',
    'badge-new': adjustSaturation(primaryColor, 20),
    'badge-updated': '#3b82f6'
  };
}

// WebRTC용 컬러들
function generateWebRTCColors(primaryColor: string, customNeeds?: string[]): ProjectColors {
  return {
    // 카메라 상태
    'camera-active': '#22c55e',
    'camera-inactive': '#ef4444',
    'camera-loading': '#f59e0b',
    
    // 마이크 상태  
    'mic-active': '#22c55e',
    'mic-inactive': '#ef4444',
    'mic-muted': '#6b7280',
    
    // 연결 상태
    'connection-excellent': '#22c55e',
    'connection-good': '#65a30d',
    'connection-fair': '#f59e0b', 
    'connection-poor': '#ef4444',
    'connection-lost': '#991b1b',
    
    // 녹화 상태
    'recording-active': '#dc2626',
    'recording-paused': '#f59e0b',
    'recording-stopped': '#6b7280',
    
    // 화면 공유
    'screen-sharing': '#8b5cf6',
    'screen-request': adjustLightness(primaryColor, -15),
    
    // 참가자 상태
    'participant-host': adjustSaturation(primaryColor, 30),
    'participant-speaking': '#22c55e',
    'participant-muted': '#6b7280'
  };
}

// 블로그용 컬러들
function generateBlogColors(primaryColor: string, customNeeds?: string[]): ProjectColors {
  return {
    // 카테고리별
    'category-tech': primaryColor,
    'category-design': rotateHue(primaryColor, 60),
    'category-business': rotateHue(primaryColor, 120),
    'category-personal': rotateHue(primaryColor, 180),
    
    // 태그 시스템
    'tag-featured': adjustSaturation(primaryColor, 20),
    'tag-trending': '#f59e0b',
    'tag-new': '#3b82f6',
    
    // 콘텐츠 상태
    'post-published': '#22c55e',
    'post-draft': '#6b7280',
    'post-scheduled': '#f59e0b',
    'post-archived': '#9ca3af',
    
    // 인터랙션
    'like-active': '#ef4444',
    'bookmark-active': '#f59e0b',
    'share-active': '#3b82f6',
    
    // 하이라이트
    'highlight-quote': adjustLightness(primaryColor, 30),
    'highlight-code': '#f3f4f6',
    'highlight-important': '#fef3c7'
  };
}

// 커스텀 요구사항 처리
function generateCustomColors(primaryColor: string, needs: string[]): ProjectColors {
  const colors: ProjectColors = {};
  
  for (const need of needs) {
    colors[need] = generateCustomColorForNeed(primaryColor, need);
  }
  
  return colors;
}

// 특정 요구사항에 맞는 색상 생성
function generateCustomColorForNeed(primaryColor: string, need: string): string {
  const lowercaseNeed = need.toLowerCase();
  
  // 키워드 기반 색상 매핑
  if (lowercaseNeed.includes('danger') || lowercaseNeed.includes('error') || lowercaseNeed.includes('delete')) {
    return '#ef4444';
  }
  if (lowercaseNeed.includes('success') || lowercaseNeed.includes('complete') || lowercaseNeed.includes('done')) {
    return '#22c55e';
  }
  if (lowercaseNeed.includes('warning') || lowercaseNeed.includes('caution') || lowercaseNeed.includes('pending')) {
    return '#f59e0b';
  }
  if (lowercaseNeed.includes('info') || lowercaseNeed.includes('notice') || lowercaseNeed.includes('blue')) {
    return '#3b82f6';
  }
  if (lowercaseNeed.includes('purple') || lowercaseNeed.includes('premium') || lowercaseNeed.includes('special')) {
    return '#8b5cf6';
  }
  
  // 기본적으로 primary 색상을 기반으로 변형
  return adjustLightness(primaryColor, Math.random() * 20 - 10);
}

