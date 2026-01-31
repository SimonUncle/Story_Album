'use client'

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { UploadedImage } from '@/lib/types'

interface ImageSortableProps {
  images: UploadedImage[]
  onReorder: (images: UploadedImage[]) => void
}

interface SortableImageProps {
  image: UploadedImage
  index: number
}

function SortableImage({ image, index }: SortableImageProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="aspect-square relative rounded-lg overflow-hidden bg-gray-100 cursor-grab active:cursor-grabbing"
      {...attributes}
      {...listeners}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image.preview}
        alt={`이미지 ${index + 1}`}
        className="w-full h-full object-cover pointer-events-none"
        draggable={false}
      />
      <div className="absolute bottom-1 left-1 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center text-white text-xs font-medium">
        {index + 1}
      </div>
      {index === 0 && (
        <div className="absolute top-1 left-1 px-2 py-0.5 bg-foreground text-white text-xs rounded">
          표지
        </div>
      )}
    </div>
  )
}

export default function ImageSortable({
  images,
  onReorder,
}: ImageSortableProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = images.findIndex((img) => img.id === active.id)
      const newIndex = images.findIndex((img) => img.id === over.id)
      onReorder(arrayMove(images, oldIndex, newIndex))
    }
  }

  if (images.length === 0) {
    return null
  }

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-foreground mb-3">
        순서 정렬 (드래그하여 변경)
      </label>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={images} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-5 gap-2">
            {images.map((image, index) => (
              <SortableImage key={image.id} image={image} index={index} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      <p className="mt-2 text-xs text-muted">
        첫 번째 사진이 앨범 표지가 됩니다
      </p>
    </div>
  )
}
