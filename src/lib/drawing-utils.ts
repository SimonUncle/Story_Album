// 그리기 관련 유틸리티 함수

/**
 * 점 배열을 SVG path 문자열로 변환
 */
export function pointsToPath(points: { x: number; y: number }[]): string {
  if (points.length < 2) return ''

  let path = `M ${points[0].x} ${points[0].y}`
  for (let i = 1; i < points.length; i++) {
    path += ` L ${points[i].x} ${points[i].y}`
  }
  return path
}
