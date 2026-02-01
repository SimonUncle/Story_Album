'use client'

import { useRef, useState, useCallback } from 'react'
import type { Stroke } from '@/lib/types'
import { pointsToPath } from '@/lib/drawing-utils'
import { generateId } from '@/lib/id-utils'

interface DrawingCanvasProps {
  strokes: Stroke[]
  onAddStroke: (stroke: Stroke) => void
  color: string
  thickness: number
  active: boolean
}

export default function DrawingCanvas({
  strokes,
  onAddStroke,
  color,
  thickness,
  active,
}: DrawingCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentPoints, setCurrentPoints] = useState<{ x: number; y: number }[]>([])

  // 포인터 좌표를 SVG 좌표로 변환 (SVG 내장 변환 사용 - 모바일 스케일링 자동 처리)
  const getPoint = useCallback((e: React.PointerEvent): { x: number; y: number } => {
    const svg = svgRef.current
    if (!svg) return { x: 0, y: 0 }

    // SVG의 CTM(Current Transform Matrix) 사용하여 정확한 좌표 계산
    const ctm = svg.getScreenCTM()
    if (ctm) {
      const point = svg.createSVGPoint()
      point.x = e.clientX
      point.y = e.clientY
      const transformedPoint = point.matrixTransform(ctm.inverse())
      return { x: transformedPoint.x, y: transformedPoint.y }
    }

    // CTM을 사용할 수 없는 경우 기본 계산
    const rect = svg.getBoundingClientRect()
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }
  }, [])

  // 그리기 시작
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!active) return
      e.preventDefault()
      e.stopPropagation()

      const point = getPoint(e)
      setIsDrawing(true)
      setCurrentPoints([point])

      const svg = svgRef.current
      if (svg) {
        svg.setPointerCapture(e.pointerId)
      }
    },
    [active, getPoint]
  )

  // 그리기 중
  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDrawing) return
      e.preventDefault()

      const point = getPoint(e)
      setCurrentPoints((prev) => [...prev, point])
    },
    [isDrawing, getPoint]
  )

  // 그리기 종료
  const handlePointerUp = useCallback(() => {
    if (!isDrawing) return

    if (currentPoints.length > 1) {
      const newStroke: Stroke = {
        id: generateId('stroke'),
        points: currentPoints,
        color,
        thickness,
      }
      onAddStroke(newStroke)
    }

    setIsDrawing(false)
    setCurrentPoints([])
  }, [isDrawing, currentPoints, color, thickness, onAddStroke])

  // 터치 이벤트 차단 (모바일에서 스크롤/줌 방지)
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (active) {
        e.preventDefault()
      }
    },
    [active]
  )

  return (
    <svg
      ref={svgRef}
      className={`absolute inset-0 w-full h-full overflow-visible ${
        active ? 'pointer-events-auto cursor-crosshair' : 'pointer-events-none'
      }`}
      style={{
        touchAction: active ? 'none' : 'auto',
        // 모바일에서 하이라이트 방지
        WebkitTapHighlightColor: 'transparent',
        WebkitUserSelect: 'none',
        userSelect: 'none',
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onTouchStart={handleTouchStart}
    >
      {/* 저장된 선들 */}
      {strokes.map((stroke) => (
        <path
          key={stroke.id}
          d={pointsToPath(stroke.points)}
          stroke={stroke.color}
          strokeWidth={stroke.thickness}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}

      {/* 현재 그리는 중인 선 */}
      {currentPoints.length > 1 && (
        <path
          d={pointsToPath(currentPoints)}
          stroke={color}
          strokeWidth={thickness}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  )
}
