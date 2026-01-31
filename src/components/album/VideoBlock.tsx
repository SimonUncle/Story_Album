'use client'

import { useRef, useState, useEffect } from 'react'
import type { FilterType } from '@/lib/types'
import { getFilterStyle } from '@/lib/filters'

interface VideoBlockProps {
  url: string
  size?: 'full' | 'medium' | 'small'
  filter?: FilterType
  autoPlay?: boolean
  muted?: boolean
  loop?: boolean
  children?: React.ReactNode // 자막 오버레이 등
}

export default function VideoBlock({
  url,
  size = 'full',
  filter = 'none',
  autoPlay = true,
  muted = true,
  loop = true,
  children,
}: VideoBlockProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  // Intersection Observer로 뷰포트 진입 시 재생
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting)
          if (entry.isIntersecting && autoPlay) {
            video.play().catch(() => {})
          } else {
            video.pause()
          }
        })
      },
      { threshold: 0.5 }
    )

    observer.observe(video)
    return () => observer.disconnect()
  }, [autoPlay])

  const handlePlay = () => setIsPlaying(true)
  const handlePause = () => setIsPlaying(false)

  const sizeClasses = {
    full: 'w-full aspect-video',
    medium: 'w-3/4 mx-auto aspect-video',
    small: 'w-1/2 mx-auto aspect-video',
  }

  const filterStyle = getFilterStyle(filter)

  return (
    <div className={`relative ${sizeClasses[size]}`}>
      <video
        ref={videoRef}
        src={url}
        className="w-full h-full object-cover rounded-lg"
        style={filterStyle}
        autoPlay={autoPlay && isVisible}
        muted={muted}
        loop={loop}
        playsInline
        onPlay={handlePlay}
        onPause={handlePause}
      />

      {/* Play/Pause overlay (영상이 뮤트 상태일 때만 표시) */}
      {muted && !isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg">
          <div className="w-16 h-16 bg-white/80 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-gray-800 ml-1"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      )}

      {/* Muted indicator */}
      {muted && isPlaying && (
        <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/50 rounded-full flex items-center gap-1">
          <svg
            className="w-4 h-4 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
            />
          </svg>
          <span className="text-xs text-white">음소거</span>
        </div>
      )}

      {/* 자막 등 오버레이 */}
      {children}
    </div>
  )
}
