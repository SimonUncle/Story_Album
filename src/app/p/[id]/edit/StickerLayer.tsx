'use client'

import { useRef, useState, useCallback } from 'react'
import type { Sticker } from '@/lib/types'
import { STICKER_PRESETS } from '@/lib/types'

interface StickerLayerProps {
  stickers: Sticker[]
  selectedId: string | null
  onSelect: (id: string | null) => void
  onUpdate: (id: string, updates: Partial<Sticker>) => void
  onDelete: (id: string) => void
  editable: boolean
}

export default function StickerLayer({
  stickers,
  selectedId,
  onSelect,
  onUpdate,
  onDelete,
  editable,
}: StickerLayerProps) {
  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-visible"
      style={{ zIndex: editable ? 20 : 5 }}
    >
      {stickers.map((sticker) => (
        <DraggableSticker
          key={sticker.id}
          sticker={sticker}
          selected={selectedId === sticker.id}
          onSelect={() => onSelect(sticker.id)}
          onUpdate={(updates) => onUpdate(sticker.id, updates)}
          onDelete={() => onDelete(sticker.id)}
          editable={editable}
        />
      ))}
    </div>
  )
}

interface DraggableStickerProps {
  sticker: Sticker
  selected: boolean
  onSelect: () => void
  onUpdate: (updates: Partial<Sticker>) => void
  onDelete: () => void
  editable: boolean
}

function DraggableSticker({
  sticker,
  selected,
  onSelect,
  onUpdate,
  onDelete,
  editable,
}: DraggableStickerProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const dragStart = useRef({ x: 0, y: 0, stickerX: 0, stickerY: 0 })

  const preset = STICKER_PRESETS.find((s) => s.id === sticker.type)
  if (!preset) return null

  const isSpeechBubble = sticker.type === 'speech'

  // 드래그 시작
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!editable || isEditing) return
      e.stopPropagation()
      e.preventDefault()
      onSelect()

      setIsDragging(true)
      dragStart.current = {
        x: e.clientX,
        y: e.clientY,
        stickerX: sticker.x,
        stickerY: sticker.y,
      }

      const element = ref.current
      if (element) {
        element.setPointerCapture(e.pointerId)
      }
    },
    [editable, isEditing, onSelect, sticker.x, sticker.y]
  )

  // 드래그 중
  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return

      const dx = e.clientX - dragStart.current.x
      const dy = e.clientY - dragStart.current.y

      onUpdate({
        x: dragStart.current.stickerX + dx,
        y: dragStart.current.stickerY + dy,
      })
    },
    [isDragging, onUpdate]
  )

  // 드래그 종료
  const handlePointerUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  // 크기 조절
  const handleScaleChange = (delta: number) => {
    const newScale = Math.max(0.5, Math.min(3, sticker.scale + delta))
    onUpdate({ scale: newScale })
  }

  // 회전
  const handleRotate = (delta: number) => {
    onUpdate({ rotation: (sticker.rotation + delta) % 360 })
  }

  // 말풍선 텍스트 변경
  const handleTextChange = (text: string) => {
    onUpdate({ customText: text })
  }

  return (
    <div
      ref={ref}
      data-sticker="true"
      className={`absolute select-none ${editable ? 'pointer-events-auto cursor-move' : ''}`}
      style={{
        left: sticker.x,
        top: sticker.y,
        transform: `scale(${sticker.scale}) rotate(${sticker.rotation}deg)`,
        transformOrigin: 'center center',
        zIndex: selected ? 100 : 10,
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* 스티커 내용 */}
      <div className="relative">
        {isSpeechBubble ? (
          // 말풍선 스티커
          <div
            className="relative bg-white rounded-2xl px-4 py-3 shadow-lg min-w-[80px] max-w-[200px]"
            style={{
              borderBottomLeftRadius: '4px',
            }}
          >
            {isEditing ? (
              <textarea
                autoFocus
                value={sticker.customText || ''}
                onChange={(e) => handleTextChange(e.target.value)}
                onBlur={() => setIsEditing(false)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    setIsEditing(false)
                  }
                }}
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
                className="w-full text-sm resize-none outline-none bg-transparent min-h-[40px]"
                placeholder="텍스트 입력..."
                style={{ transform: `rotate(-${sticker.rotation}deg) scale(${1 / sticker.scale})` }}
              />
            ) : (
              <p
                className="text-sm cursor-text whitespace-pre-wrap break-words"
                onClick={(e) => {
                  if (editable && selected) {
                    e.stopPropagation()
                    setIsEditing(true)
                  }
                }}
                onPointerDown={(e) => {
                  if (editable && selected) {
                    e.stopPropagation()
                  }
                }}
              >
                {sticker.customText || '클릭해서 입력'}
              </p>
            )}
            {/* 말풍선 꼬리 */}
            <div
              className="absolute -bottom-2 left-3 w-0 h-0"
              style={{
                borderLeft: '8px solid transparent',
                borderRight: '8px solid transparent',
                borderTop: '10px solid white',
              }}
            />
          </div>
        ) : preset.emoji ? (
          <span className="text-4xl">{preset.emoji}</span>
        ) : (
          <span
            className="text-lg font-bold px-2 py-1 bg-white/80 rounded-lg shadow-sm inline-block"
            style={{ whiteSpace: 'nowrap' }}
          >
            {preset.text}
          </span>
        )}

        {/* 선택 시 컨트롤 표시 */}
        {selected && editable && !isEditing && (
          <div
            data-control="true"
            className="absolute -top-12 left-1/2 flex gap-1 bg-white rounded-full shadow-lg p-1"
            style={{ transform: `translateX(-50%) rotate(-${sticker.rotation}deg) scale(${1 / sticker.scale})` }}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 크기 축소 */}
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation()
                handleScaleChange(-0.2)
              }}
              className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-full active:bg-gray-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>

            {/* 크기 확대 */}
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation()
                handleScaleChange(0.2)
              }}
              className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-full active:bg-gray-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>

            {/* 회전 */}
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation()
                handleRotate(15)
              }}
              className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-full active:bg-gray-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>

            {/* 삭제 */}
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
              className="w-8 h-8 flex items-center justify-center text-red-500 hover:bg-red-50 rounded-full active:bg-red-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
