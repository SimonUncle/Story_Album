'use client'

import { useRef, useEffect, useState } from 'react'
import type { FilterType, Subtitle } from '@/lib/types'
import { getFilterStyle } from '@/lib/filters'
import SubtitleOverlay from './SubtitleOverlay'

interface EndingBlockProps {
  imageUrl: string
  closingHint?: string
  mediaType?: 'image' | 'video'
  filter?: FilterType
  subtitle?: Subtitle
}

export default function EndingBlock({
  imageUrl,
  closingHint,
  mediaType = 'image',
  filter = 'none',
  subtitle,
}: EndingBlockProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isVisible, setIsVisible] = useState(false)

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
    <section className="relative w-full py-20 md:py-32">
      {/* Media container */}
      <div className="max-w-4xl mx-auto px-4 md:px-6">
        <div className="aspect-[16/9] relative overflow-hidden rounded-lg bg-gray-100">
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
              alt="Ending"
              className="w-full h-full object-cover"
              style={filterStyle}
              loading="lazy"
            />
          )}

          {/* 자막 오버레이 */}
          <SubtitleOverlay subtitle={subtitle} />
        </div>
      </div>

      {/* Closing text */}
      {closingHint && (
        <div className="mt-12 md:mt-16 text-center px-6">
          <p className="album-title text-lg md:text-xl text-muted italic">
            {closingHint}
          </p>
        </div>
      )}
    </section>
  )
}
