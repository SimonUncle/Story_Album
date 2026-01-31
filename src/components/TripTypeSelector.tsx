'use client'

import { TripType, TRIP_TYPES } from '@/lib/types'

interface TripTypeSelectorProps {
  value: TripType | null
  onChange: (type: TripType) => void
}

export default function TripTypeSelector({
  value,
  onChange,
}: TripTypeSelectorProps) {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-foreground mb-3">
        여행 타입
      </label>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {TRIP_TYPES.map((type) => (
          <button
            key={type.value}
            type="button"
            onClick={() => onChange(type.value)}
            className={`
              px-4 py-3 rounded-lg border text-center transition-all
              ${
                value === type.value
                  ? 'border-foreground bg-foreground text-white'
                  : 'border-gray-200 hover:border-foreground/30 text-foreground'
              }
            `}
          >
            <span className="text-xl mb-1 block">{type.emoji}</span>
            <span className="text-sm">{type.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
