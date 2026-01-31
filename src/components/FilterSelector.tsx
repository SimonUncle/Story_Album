'use client'

import type { FilterType, UploadedMedia } from '@/lib/types'
import { FILTERS } from '@/lib/types'
import { getFilterStyle } from '@/lib/filters'

interface FilterSelectorProps {
  selectedFilter: FilterType
  onFilterChange: (filter: FilterType) => void
  previewMedia?: UploadedMedia // 미리보기용 미디어
}

export default function FilterSelector({
  selectedFilter,
  onFilterChange,
  previewMedia,
}: FilterSelectorProps) {
  // 미리보기 이미지 URL
  const previewUrl = previewMedia?.type === 'video'
    ? previewMedia.thumbnail || previewMedia.preview
    : previewMedia?.preview

  return (
    <div className="w-full space-y-4">
      <label className="block text-sm font-medium text-foreground">
        색감 필터 선택
      </label>

      {/* Large preview with selected filter */}
      {previewUrl && (
        <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt="필터 미리보기"
            className="w-full h-full object-contain"
            style={getFilterStyle(selectedFilter)}
          />
          <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/50 rounded text-white text-sm">
            {FILTERS.find((f) => f.value === selectedFilter)?.label || '원본'}
          </div>
        </div>
      )}

      {/* Filter options */}
      <div className="grid grid-cols-4 gap-3">
        {FILTERS.map((filter) => (
          <button
            key={filter.value}
            type="button"
            onClick={() => onFilterChange(filter.value)}
            className={`relative rounded-lg overflow-hidden border-2 transition-all ${
              selectedFilter === filter.value
                ? 'border-foreground ring-2 ring-foreground/20 scale-105'
                : 'border-transparent hover:border-gray-300'
            }`}
          >
            {/* Filter preview thumbnail */}
            {previewUrl ? (
              <div className="aspect-square">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt={filter.label}
                  className="w-full h-full object-cover"
                  style={getFilterStyle(filter.value)}
                />
              </div>
            ) : (
              <div
                className="aspect-square bg-gradient-to-br from-pink-200 via-purple-200 to-blue-200"
                style={getFilterStyle(filter.value)}
              />
            )}

            {/* Filter label */}
            <div
              className={`py-2 text-center text-sm transition-colors ${
                selectedFilter === filter.value
                  ? 'bg-foreground text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {filter.label}
            </div>
          </button>
        ))}
      </div>

      {/* Selected filter description */}
      <p className="text-xs text-muted text-center">
        {FILTERS.find((f) => f.value === selectedFilter)?.description}
      </p>
    </div>
  )
}
