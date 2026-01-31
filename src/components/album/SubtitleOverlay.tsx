'use client'

import type { Subtitle } from '@/lib/types'

interface SubtitleOverlayProps {
  subtitle?: Subtitle
  className?: string
}

export default function SubtitleOverlay({
  subtitle,
  className = '',
}: SubtitleOverlayProps) {
  if (!subtitle?.text) return null

  return (
    <div
      className={`absolute pointer-events-none ${className}`}
      style={{
        left: `${subtitle.position.x}%`,
        top: `${subtitle.position.y}%`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <span
        className="text-white text-lg md:text-xl lg:text-2xl font-handwriting px-2 whitespace-nowrap"
        style={{
          textShadow:
            '2px 2px 4px rgba(0,0,0,0.5), -1px -1px 2px rgba(0,0,0,0.3)',
        }}
      >
        {subtitle.text}
      </span>
    </div>
  )
}
