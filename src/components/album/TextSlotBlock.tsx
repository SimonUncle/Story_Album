'use client'

import type { UserText } from '@/lib/types'

interface TextSlotBlockProps {
  slotId: string
  userTexts: UserText[]
}

export default function TextSlotBlock({
  slotId,
  userTexts,
}: TextSlotBlockProps) {
  const userText = userTexts.find((t) => t.slotId === slotId)
  const text = userText?.polished || userText?.original

  // 텍스트가 없으면 여백만 표시
  if (!text) {
    return <div className="h-8 md:h-12" />
  }

  return (
    <div className="max-w-2xl mx-auto px-6 text-center">
      <p className="album-title text-xl md:text-2xl lg:text-3xl font-medium text-foreground/80 leading-relaxed">
        {text}
      </p>
    </div>
  )
}
