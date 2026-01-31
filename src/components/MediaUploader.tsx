'use client'

import { useCallback, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import type { UploadedMedia } from '@/lib/types'
import { compressImage } from '@/lib/image-utils'
import { generateId } from '@/lib/id-utils'

interface MediaUploaderProps {
  media: UploadedMedia[]
  onMediaChange: (media: UploadedMedia[]) => void
  maxItems?: number
  maxVideoDuration?: number // 초 단위
}

export default function MediaUploader({
  media,
  onMediaChange,
  maxItems = 10,
  maxVideoDuration = 15,
}: MediaUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isCompressing, setIsCompressing] = useState(false)

  const generateVideoThumbnail = (videoFile: File): Promise<string> => {
    return new Promise((resolve) => {
      const video = document.createElement('video')
      video.preload = 'metadata'
      video.src = URL.createObjectURL(videoFile)
      video.currentTime = 0.5

      video.onloadeddata = () => {
        const canvas = document.createElement('canvas')
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        const ctx = canvas.getContext('2d')
        ctx?.drawImage(video, 0, 0, canvas.width, canvas.height)
        const thumbnail = canvas.toDataURL('image/jpeg', 0.7)
        URL.revokeObjectURL(video.src)
        resolve(thumbnail)
      }

      video.onerror = () => {
        URL.revokeObjectURL(video.src)
        resolve('')
      }
    })
  }

  const getVideoDuration = (videoFile: File): Promise<number> => {
    return new Promise((resolve) => {
      const video = document.createElement('video')
      video.preload = 'metadata'
      video.src = URL.createObjectURL(videoFile)

      video.onloadedmetadata = () => {
        URL.revokeObjectURL(video.src)
        resolve(video.duration)
      }

      video.onerror = () => {
        URL.revokeObjectURL(video.src)
        resolve(0)
      }
    })
  }

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (!files) return

      const remainingSlots = maxItems - media.length
      const filesToAdd = Array.from(files).slice(0, remainingSlots)

      setIsCompressing(true)
      const newMedia: UploadedMedia[] = []

      for (const file of filesToAdd) {
        const isVideo = file.type.startsWith('video/')
        const isImage = file.type.startsWith('image/')

        if (!isVideo && !isImage) continue

        if (isVideo) {
          const duration = await getVideoDuration(file)
          if (duration > maxVideoDuration) {
            toast.error(`영상은 ${maxVideoDuration}초 이하만 가능합니다. (현재: ${Math.round(duration)}초)`)
            continue
          }

          const thumbnail = await generateVideoThumbnail(file)
          newMedia.push({
            id: generateId('video'),
            file,
            preview: URL.createObjectURL(file),
            type: 'video',
            duration,
            thumbnail,
          })
        } else {
          // 이미지 자동 압축
          const compressedFile = await compressImage(file, {
            maxWidth: 1920,
            maxHeight: 1920,
            quality: 0.85,
          })

          newMedia.push({
            id: generateId('image'),
            file: compressedFile,
            preview: URL.createObjectURL(compressedFile),
            type: 'image',
          })
        }
      }

      setIsCompressing(false)
      onMediaChange([...media, ...newMedia])
      e.target.value = ''
    },
    [media, maxItems, maxVideoDuration, onMediaChange]
  )

  const removeMedia = useCallback(
    (id: string) => {
      const item = media.find((m) => m.id === id)
      if (item) {
        URL.revokeObjectURL(item.preview)
      }
      onMediaChange(media.filter((m) => m.id !== id))
    },
    [media, onMediaChange]
  )

  const videoCount = media.filter((m) => m.type === 'video').length
  const imageCount = media.filter((m) => m.type === 'image').length

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-foreground mb-1">
        사진/영상 업로드 ({media.length}/{maxItems})
      </label>
      <p className="text-xs text-muted mb-3">
        사진 {imageCount}장, 영상 {videoCount}개 (영상 {maxVideoDuration}초 이하)
      </p>

      {/* Upload Area */}
      {media.length < maxItems && (
        <label className={`block mb-4 ${isCompressing ? 'pointer-events-none' : 'cursor-pointer'}`}>
          <div className={`border-2 border-dashed border-gray-200 rounded-lg p-8 text-center transition-colors ${isCompressing ? 'bg-gray-50' : 'hover:border-foreground/30'}`}>
            {isCompressing ? (
              <div className="flex flex-col items-center">
                <div className="animate-spin w-10 h-10 border-4 border-foreground/20 border-t-foreground rounded-full mb-2" />
                <p className="text-sm text-muted">이미지 압축 중...</p>
              </div>
            ) : (
              <>
            <div className="flex justify-center gap-2 mb-2">
              {/* Image icon */}
              <svg
                className="h-10 w-10 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              {/* Video icon */}
              <svg
                className="h-10 w-10 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </div>
            <p className="text-sm text-muted">
              클릭하거나 드래그하여 추가하세요
            </p>
            <p className="mt-1 text-xs text-gray-400">
              사진 (JPG, PNG) 또는 영상 (MP4, {maxVideoDuration}초 이하)
            </p>
              </>
            )}
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime,video/webm"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
        </label>
      )}

      {/* Preview Grid */}
      {media.length > 0 && (
        <div className="grid grid-cols-5 gap-2">
          {media.map((item, index) => (
            <div
              key={item.id}
              className="aspect-square relative rounded-lg overflow-hidden bg-gray-100"
            >
              {item.type === 'video' ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.thumbnail || item.preview}
                    alt={`영상 ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {/* Video indicator */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 bg-black/50 rounded-full flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-white ml-0.5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                  {/* Duration badge */}
                  {item.duration && (
                    <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/60 rounded text-white text-xs">
                      {Math.round(item.duration)}s
                    </div>
                  )}
                </>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.preview}
                  alt={`이미지 ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              )}
              {/* Remove button */}
              <button
                type="button"
                onClick={() => removeMedia(item.id)}
                className="absolute top-1 right-1 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
              {/* Index badge */}
              <div className="absolute bottom-1 left-1 w-5 h-5 bg-black/50 rounded-full flex items-center justify-center text-white text-xs">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
