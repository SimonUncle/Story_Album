'use client'

import { useEffect, useState } from 'react'
import type { Post, AlbumBlock, MediaItem, Subtitle, FilterType, Sticker, Stroke } from '@/lib/types'
import HeroBlock from './HeroBlock'
import ImageBlock from './ImageBlock'
import TextSlotBlock from './TextSlotBlock'
import SpacerBlock from './SpacerBlock'
import EndingBlock from './EndingBlock'
import DecorationOverlay from './DecorationOverlay'

interface AlbumRendererProps {
  post: Post
}

export default function AlbumRenderer({ post }: AlbumRendererProps) {
  // 클라이언트에서만 stickers/drawings 로드 (하이드레이션 에러 방지)
  const [stickers, setStickers] = useState<Sticker[]>([])
  const [drawings, setDrawings] = useState<Stroke[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    async function loadDecorations() {
      try {
        const res = await fetch(`/api/get-post?id=${post.id}`)
        if (res.ok) {
          const data = await res.json()
          setStickers(data.post.stickers || [])
          setDrawings(data.post.drawings || [])
        }
      } catch (error) {
        console.error('Failed to load decorations:', error)
      }
    }
    loadDecorations()
  }, [post.id])

  const {
    image_urls,
    edit_plan,
    user_texts,
    title,
    // v2 fields
    media_items,
    subtitles,
    filter,
  } = post

  // v2: 미디어 아이템 또는 레거시 이미지 URL 사용
  const mediaItems: MediaItem[] = media_items?.length
    ? media_items
    : image_urls.map((url) => ({ url, type: 'image' as const }))

  // 미디어 인덱스로 자막 찾기
  const getSubtitle = (mediaIndex: number): Subtitle | undefined => {
    return subtitles?.find((s) => s.mediaIndex === mediaIndex)
  }

  const renderBlock = (block: AlbumBlock, index: number) => {
    switch (block.type) {
      case 'hero': {
        const mediaItem = mediaItems[block.imageIndex]
        return (
          <HeroBlock
            key={`hero-${index}`}
            imageUrl={mediaItem?.url || image_urls[block.imageIndex]}
            title={title || undefined}
            mediaType={mediaItem?.type}
            filter={filter as FilterType}
            subtitle={getSubtitle(block.imageIndex)}
          />
        )
      }

      case 'image': {
        const mediaItem = mediaItems[block.imageIndex]
        return (
          <ImageBlock
            key={`image-${index}`}
            imageUrl={mediaItem?.url || image_urls[block.imageIndex]}
            size={block.size}
            index={block.imageIndex}
            mediaType={mediaItem?.type}
            filter={filter as FilterType}
            subtitle={getSubtitle(block.imageIndex)}
          />
        )
      }

      case 'textSlot':
        return (
          <TextSlotBlock
            key={`text-${index}`}
            slotId={block.slotId}
            userTexts={user_texts}
          />
        )

      case 'spacer':
        return <SpacerBlock key={`spacer-${index}`} height={block.height} />

      case 'ending': {
        const mediaItem = mediaItems[block.imageIndex]
        return (
          <EndingBlock
            key={`ending-${index}`}
            imageUrl={mediaItem?.url || image_urls[block.imageIndex]}
            closingHint={block.closingHint}
            mediaType={mediaItem?.type}
            filter={filter as FilterType}
            subtitle={getSubtitle(block.imageIndex)}
          />
        )
      }

      default:
        return null
    }
  }

  return (
    <article className="w-full relative">
      {edit_plan.map((block, index) => renderBlock(block, index))}
      {/* v3: 스티커 & 그리기 오버레이 - 클라이언트에서만 렌더링 */}
      {mounted && <DecorationOverlay stickers={stickers} drawings={drawings} />}
    </article>
  )
}
