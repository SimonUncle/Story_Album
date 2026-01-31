'use client'

import { useCallback } from 'react'
import type { UploadedImage } from '@/lib/types'
import { generateId } from '@/lib/id-utils'

interface ImageUploaderProps {
  images: UploadedImage[]
  onImagesChange: (images: UploadedImage[]) => void
  maxImages?: number
}

export default function ImageUploader({
  images,
  onImagesChange,
  maxImages = 10,
}: ImageUploaderProps) {
  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (!files) return

      const remainingSlots = maxImages - images.length
      const filesToAdd = Array.from(files).slice(0, remainingSlots)

      const newImages: UploadedImage[] = filesToAdd.map((file) => ({
        id: generateId('image'),
        file,
        preview: URL.createObjectURL(file),
      }))

      onImagesChange([...images, ...newImages])
      e.target.value = '' // Reset input
    },
    [images, maxImages, onImagesChange]
  )

  const removeImage = useCallback(
    (id: string) => {
      const image = images.find((img) => img.id === id)
      if (image) {
        URL.revokeObjectURL(image.preview)
      }
      onImagesChange(images.filter((img) => img.id !== id))
    },
    [images, onImagesChange]
  )

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-foreground mb-3">
        사진 업로드 ({images.length}/{maxImages})
      </label>

      {/* Upload Area */}
      {images.length < maxImages && (
        <label className="block cursor-pointer mb-4">
          <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center hover:border-foreground/30 transition-colors">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
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
            <p className="mt-2 text-sm text-muted">
              클릭하거나 드래그하여 사진을 추가하세요
            </p>
            <p className="mt-1 text-xs text-gray-400">
              최대 {maxImages}장까지 (JPG, PNG)
            </p>
          </div>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
        </label>
      )}

      {/* Preview Grid (for reference only - actual sorting in ImageSortable) */}
      {images.length > 0 && (
        <div className="grid grid-cols-5 gap-2">
          {images.map((image, index) => (
            <div
              key={image.id}
              className="aspect-square relative rounded-lg overflow-hidden bg-gray-100"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.preview}
                alt={`이미지 ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(image.id)}
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
