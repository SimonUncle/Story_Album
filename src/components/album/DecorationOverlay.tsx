'use client'

import type { Sticker, Stroke } from '@/lib/types'
import { STICKER_PRESETS } from '@/lib/types'
import { pointsToPath } from '@/lib/drawing-utils'

interface DecorationOverlayProps {
  stickers?: Sticker[]
  drawings?: Stroke[]
}

export default function DecorationOverlay({
  stickers = [],
  drawings = [],
}: DecorationOverlayProps) {
  if (stickers.length === 0 && drawings.length === 0) {
    return null
  }

  const getSticker = (type: string) => {
    return STICKER_PRESETS.find((s) => s.id === type)
  }

  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible">
      {/* 그리기 레이어 (SVG) */}
      {drawings.length > 0 && (
        <svg className="absolute inset-0 w-full h-full overflow-visible">
          {drawings.map((stroke) => (
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
        </svg>
      )}

      {/* 스티커 레이어 */}
      {stickers.map((sticker) => {
        const preset = getSticker(sticker.type)
        if (!preset) return null

        const isSpeechBubble = sticker.type === 'speech'

        return (
          <div
            key={sticker.id}
            className="absolute select-none"
            style={{
              left: sticker.x,
              top: sticker.y,
              transform: `scale(${sticker.scale}) rotate(${sticker.rotation}deg)`,
              transformOrigin: 'center center',
            }}
          >
            {isSpeechBubble ? (
              // 말풍선 스티커
              <div
                className="relative bg-white rounded-2xl px-4 py-3 shadow-lg min-w-[80px] max-w-[200px]"
                style={{ borderBottomLeftRadius: '4px' }}
              >
                <p className="text-sm whitespace-pre-wrap break-words">
                  {sticker.customText || ''}
                </p>
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
                className="text-lg font-bold px-2 py-1 bg-white/80 rounded-lg shadow-sm"
                style={{ whiteSpace: 'nowrap' }}
              >
                {preset.text}
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}
