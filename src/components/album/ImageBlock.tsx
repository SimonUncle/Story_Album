'use client'

import { useRef, useEffect, useState } from 'react'
import type { FilterType, Subtitle } from '@/lib/types'
import { getFilterStyle } from '@/lib/filters'
import SubtitleOverlay from './SubtitleOverlay'

interface ImageBlockProps {
  imageUrl: string
  size: 'full' | 'medium' | 'small'
  index: number
  mediaType?: 'image' | 'video'
  filter?: FilterType
  subtitle?: Subtitle
}

export default function ImageBlock({
  imageUrl,
  size,
  index,
  mediaType = 'image',
  filter = 'none',
  subtitle,
}: ImageBlockProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  const sizeClasses = {
    full: 'w-full max-w-5xl',
    medium: 'w-full max-w-3xl',
    small: 'w-full max-w-xl',
  }

  const aspectClasses = {
    full: 'aspect-[3/2]',
    medium: 'aspect-[4/3]',
    small: 'aspect-square',
  }

  const filterStyle = getFilterStyle(filter)

  // 영상일 경우 뷰포트 진입 시 자동 재생
  useEffect(() => {
    if (mediaType !== 'video' || !videoRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting)
          if (entry.isIntersecting) {
            videoRef.current?.play().catch(() => {})
          } else {
            videoRef.current?.pause()
          }
        })
      },
      { threshold: 0.5 }
    )

    observer.observe(videoRef.current)
    return () => observer.disconnect()
  }, [mediaType])

  return (
    <div
      className={`mx-auto px-4 md:px-6 ${sizeClasses[size]}`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div
        className={`${aspectClasses[size]} relative overflow-hidden rounded-lg bg-gray-100`}
      >
        {mediaType === 'video' ? (
          <video
            ref={videoRef}
            src={imageUrl}
            className="w-full h-full object-cover"
            style={filterStyle}
            autoPlay={isVisible}
            muted
            loop
            playsInline
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={`Photo ${index + 1}`}
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
            style={filterStyle}
            loading="lazy"
          />
        )}

        {/* 자막 오버레이 */}
        <SubtitleOverlay subtitle={subtitle} />
      </div>
    </div>
  )
}
