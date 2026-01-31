// ID 생성 유틸리티

/**
 * 고유 ID 생성
 * @param prefix - ID 접두사 (예: 'sticker', 'stroke', 'media')
 * @returns 고유 ID 문자열
 */
export function generateId(prefix?: string): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 11)

  if (prefix) {
    return `${prefix}-${timestamp}-${random}`
  }
  return `${timestamp}-${random}`
}
