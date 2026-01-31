'use client'

import { Mood, MOODS } from '@/lib/types'

interface MoodSelectorProps {
  value: Mood[]
  onChange: (moods: Mood[]) => void
  maxSelect?: number
}

export default function MoodSelector({
  value,
  onChange,
  maxSelect = 2,
}: MoodSelectorProps) {
  const toggleMood = (mood: Mood) => {
    if (value.includes(mood)) {
      onChange(value.filter((m) => m !== mood))
    } else if (value.length < maxSelect) {
      onChange([...value, mood])
    }
  }

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-foreground mb-3">
        분위기 (최대 {maxSelect}개)
      </label>
      <div className="flex flex-wrap gap-2">
        {MOODS.map((mood) => {
          const isSelected = value.includes(mood.value)
          const isDisabled = !isSelected && value.length >= maxSelect

          return (
            <button
              key={mood.value}
              type="button"
              onClick={() => toggleMood(mood.value)}
              disabled={isDisabled}
              className={`
                px-4 py-2 rounded-full border text-sm transition-all
                ${
                  isSelected
                    ? 'border-foreground bg-foreground text-white'
                    : isDisabled
                    ? 'border-gray-100 text-gray-300 cursor-not-allowed'
                    : 'border-gray-200 hover:border-foreground/30 text-foreground'
                }
              `}
            >
              <span className="mr-1">{mood.emoji}</span>
              {mood.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
