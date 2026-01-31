'use client'

import { useState, useCallback } from 'react'
import type { Subtitle, UploadedMedia, FilterType } from '@/lib/types'
import { SPECIAL_CHARS } from '@/lib/types'
import { getFilterStyle } from '@/lib/filters'

interface SubtitleEditorProps {
  media: UploadedMedia[]
  subtitles: Subtitle[]
  onSubtitlesChange: (subtitles: Subtitle[]) => void
  filter?: FilterType
}

export default function SubtitleEditor({
  media,
  subtitles,
  onSubtitlesChange,
  filter = 'none',
}: SubtitleEditorProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  const currentSubtitle = subtitles.find((s) => s.mediaIndex === selectedIndex)
  const currentMedia = media[selectedIndex]

  const updateSubtitle = useCallback(
    (mediaIndex: number, updates: Partial<Subtitle>) => {
      const existing = subtitles.find((s) => s.mediaIndex === mediaIndex)
      if (existing) {
        onSubtitlesChange(
          subtitles.map((s) =>
            s.mediaIndex === mediaIndex ? { ...s, ...updates } : s
          )
        )
      } else {
        const newSubtitle: Subtitle = {
          id: `subtitle-${mediaIndex}-${Date.now()}`,
          mediaIndex,
          text: '',
          position: { x: 50, y: 80 },
          ...updates,
        }
        onSubtitlesChange([...subtitles, newSubtitle])
      }
    },
    [subtitles, onSubtitlesChange]
  )

  const handleTextChange = (text: string) => {
    updateSubtitle(selectedIndex, { text })
  }

  const addSpecialChar = (char: string) => {
    const currentText = currentSubtitle?.text || ''
    updateSubtitle(selectedIndex, { text: currentText + char })
  }

  const handleDragStart = () => {
    setIsDragging(true)
  }

  const handleDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return

    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100

    // 범위 제한 (5% ~ 95%)
    const clampedX = Math.max(5, Math.min(95, x))
    const clampedY = Math.max(5, Math.min(95, y))

    updateSubtitle(selectedIndex, { position: { x: clampedX, y: clampedY } })
  }

  const handleDragEnd = () => {
    setIsDragging(false)
  }

  const filterStyle = getFilterStyle(filter)

  if (media.length === 0) {
    return (
      <div className="text-center text-muted py-8">
        먼저 사진/영상을 업로드해주세요
      </div>
    )
  }

  return (
    <div className="w-full space-y-4">
      <label className="block text-sm font-medium text-foreground">
        자막 추가 (브이로그 스타일)
      </label>

      {/* Media selector thumbnails */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {media.map((item, index) => (
          <button
            key={item.id}
            onClick={() => setSelectedIndex(index)}
            className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
              selectedIndex === index
                ? 'border-foreground scale-105'
                : 'border-transparent hover:border-gray-300'
            }`}
          >
            {item.type === 'video' ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.thumbnail || item.preview}
                alt={`미디어 ${index + 1}`}
                className="w-full h-full object-cover"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.preview}
                alt={`미디어 ${index + 1}`}
                className="w-full h-full object-cover"
              />
            )}
            {item.type === 'video' && (
              <div className="absolute inset-0 flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-white drop-shadow"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            )}
            {subtitles.find((s) => s.mediaIndex === index)?.text && (
              <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-foreground" />
            )}
          </button>
        ))}
      </div>

      {/* Preview area with draggable subtitle */}
      <div
        className="relative aspect-[4/3] bg-gray-900 rounded-lg overflow-hidden cursor-crosshair"
        onMouseMove={handleDrag}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
      >
        {currentMedia && (
          <>
            {currentMedia.type === 'video' ? (
              <video
                src={currentMedia.preview}
                className="w-full h-full object-contain"
                style={filterStyle}
                autoPlay
                muted
                loop
                playsInline
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={currentMedia.preview}
                alt="미리보기"
                className="w-full h-full object-contain"
                style={filterStyle}
              />
            )}

            {/* Subtitle overlay */}
            {currentSubtitle?.text && (
              <div
                className="absolute cursor-move select-none"
                style={{
                  left: `${currentSubtitle.position.x}%`,
                  top: `${currentSubtitle.position.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                onMouseDown={handleDragStart}
              >
                <span
                  className="text-white text-lg md:text-xl font-handwriting px-2"
                  style={{
                    textShadow:
                      '2px 2px 4px rgba(0,0,0,0.5), -1px -1px 2px rgba(0,0,0,0.3)',
                  }}
                >
                  {currentSubtitle.text}
                </span>
              </div>
            )}

            {/* Position hint */}
            <div className="absolute bottom-2 left-2 text-xs text-white/70 bg-black/30 px-2 py-1 rounded">
              자막을 드래그해서 위치 조정
            </div>
          </>
        )}
      </div>

      {/* Text input */}
      <div className="space-y-2">
        <input
          type="text"
          value={currentSubtitle?.text || ''}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder="자막을 입력하세요 (예: 한강 + 피자 = ♡)"
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20 font-handwriting text-lg"
          maxLength={50}
        />

        {/* Special characters */}
        <div className="flex flex-wrap gap-1">
          {SPECIAL_CHARS.map((char) => (
            <button
              key={char}
              type="button"
              onClick={() => addSpecialChar(char)}
              className="w-9 h-9 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg text-lg transition-colors"
            >
              {char}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <p className="text-xs text-muted text-center">
        {subtitles.filter((s) => s.text).length}/{media.length} 미디어에 자막 추가됨
      </p>
    </div>
  )
}
