import type { FilterType } from './types'

// CSS 필터 스타일 정의
export const FILTER_STYLES: Record<FilterType, React.CSSProperties> = {
  none: {},
  warm: {
    filter: 'saturate(1.1) sepia(0.15) brightness(1.05) contrast(1.05)',
  },
  film: {
    filter: 'saturate(0.9) contrast(1.1) brightness(0.95) sepia(0.1)',
  },
  mono: {
    filter: 'grayscale(1) contrast(1.1)',
  },
}

// 필터 CSS 클래스 (Tailwind 호환)
export const FILTER_CLASSES: Record<FilterType, string> = {
  none: '',
  warm: 'saturate-110 sepia-15 brightness-105 contrast-105',
  film: 'saturate-90 contrast-110 brightness-95 sepia-10',
  mono: 'grayscale contrast-110',
}

// 필터 스타일 가져오기
export function getFilterStyle(filter: FilterType): React.CSSProperties {
  return FILTER_STYLES[filter] || {}
}

// 필터 클래스 가져오기
export function getFilterClass(filter: FilterType): string {
  return FILTER_CLASSES[filter] || ''
}

// 미리보기용 필터 프리셋 (작은 썸네일에서 사용)
export const FILTER_PREVIEWS = {
  none: {
    name: '원본',
    emoji: '📷',
    style: {},
  },
  warm: {
    name: '웜톤',
    emoji: '☀️',
    style: FILTER_STYLES.warm,
  },
  film: {
    name: '필름',
    emoji: '🎞️',
    style: FILTER_STYLES.film,
  },
  mono: {
    name: '모노',
    emoji: '🖤',
    style: FILTER_STYLES.mono,
  },
} as const
