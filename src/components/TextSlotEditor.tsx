'use client'

import type { UserText } from '@/lib/types'

interface TextSlotEditorProps {
  textSlots: { slotId: string; hint: string }[]
  userTexts: UserText[]
  onUserTextsChange: (texts: UserText[]) => void
}

export default function TextSlotEditor({
  textSlots,
  userTexts,
  onUserTextsChange,
}: TextSlotEditorProps) {
  const handleTextChange = (slotId: string, text: string) => {
    const existing = userTexts.find((t) => t.slotId === slotId)
    if (existing) {
      onUserTextsChange(
        userTexts.map((t) =>
          t.slotId === slotId ? { ...t, original: text } : t
        )
      )
    } else {
      onUserTextsChange([...userTexts, { slotId, original: text }])
    }
  }

  const getTextValue = (slotId: string) => {
    return userTexts.find((t) => t.slotId === slotId)?.original || ''
  }

  if (textSlots.length === 0) {
    return null
  }

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-foreground mb-3">
        한 줄 일기 (선택)
      </label>
      <p className="text-xs text-muted mb-4">
        각 구간에 짧은 문구를 남겨보세요. 비워두어도 괜찮아요.
      </p>
      <div className="space-y-4">
        {textSlots.map((slot, index) => (
          <div key={slot.slotId} className="relative">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 bg-foreground text-white rounded-full flex items-center justify-center text-xs">
                {index + 1}
              </span>
              <span className="text-sm text-muted">{slot.hint}</span>
            </div>
            <input
              type="text"
              value={getTextValue(slot.slotId)}
              onChange={(e) => handleTextChange(slot.slotId, e.target.value)}
              placeholder="한 줄로 기록해보세요..."
              maxLength={100}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg text-foreground placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-foreground/10 focus:border-foreground/30"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
