'use client'

import { useRef, useEffect } from 'react'
import type { FilterType, Subtitle } from '@/lib/types'
import { getFilterStyle } from '@/lib/filters'
import SubtitleOverlay from './SubtitleOverlay'

interface HeroBlockProps {
  imageUrl: string
  title?: string
  mediaType?: 'image' | 'video'
  filter?: FilterType
  subtitle?: Subtitle
}

export default function HeroBlock({
  imageUrl,
  title,
  mediaType = 'image',
  filter = 'none',
  subtitle,
}: HeroBlockProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  const filterStyle = getFilterStyle(filter)

  // 히어로 영상 자동 재생
  useEffect(() => {
    if (mediaType === 'video' && videoRef.current) {
      videoRef.current.play().catch(() => {})
    }
  }, [mediaType])

  return (
    <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background media */}
      {mediaType === 'video' ? (
        <video
          ref={videoRef}
          src={imageUrl}
          className="absolute inset-0 w-full h-full object-cover"
          style={filterStyle}
          autoPlay
          muted
          loop
          playsInline
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt="Hero"
          className="absolute inset-0 w-full h-full object-cover"
          style={filterStyle}
        />
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Title */}
      {title && (
        <div className="relative z-10 text-center px-6">
          <h1 className="album-title text-4xl md:text-6xl lg:text-7xl font-medium text-white drop-shadow-lg animate-fade-in">
            {title}
          </h1>
        </div>
      )}

      {/* 자막 오버레이 */}
      <SubtitleOverlay subtitle={subtitle} />

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce z-10">
        <svg
          className="w-6 h-6 text-white/80"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </div>
    </section>
  )
}
