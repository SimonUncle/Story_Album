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
import type { UploadedMedia } from '@/lib/types'

interface MediaSortableProps {
  media: UploadedMedia[]
  onReorder: (media: UploadedMedia[]) => void
}

interface SortableMediaProps {
  item: UploadedMedia
  index: number
}

function SortableMedia({ item, index }: SortableMediaProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id })

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
      {item.type === 'video' ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.thumbnail || item.preview}
            alt={`영상 ${index + 1}`}
            className="w-full h-full object-cover pointer-events-none"
            draggable={false}
          />
          {/* Video play icon */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
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
            <div className="absolute bottom-7 right-1 px-1.5 py-0.5 bg-black/60 rounded text-white text-xs pointer-events-none">
              {Math.round(item.duration)}s
            </div>
          )}
        </>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.preview}
          alt={`이미지 ${index + 1}`}
          className="w-full h-full object-cover pointer-events-none"
          draggable={false}
        />
      )}

      {/* Index badge */}
      <div className="absolute bottom-1 left-1 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center text-white text-xs font-medium pointer-events-none">
        {index + 1}
      </div>

      {/* Cover badge for first item */}
      {index === 0 && (
        <div className="absolute top-1 left-1 px-2 py-0.5 bg-foreground text-white text-xs rounded pointer-events-none">
          표지
        </div>
      )}
    </div>
  )
}

export default function MediaSortable({
  media,
  onReorder,
}: MediaSortableProps) {
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
      const oldIndex = media.findIndex((m) => m.id === active.id)
      const newIndex = media.findIndex((m) => m.id === over.id)
      onReorder(arrayMove(media, oldIndex, newIndex))
    }
  }

  if (media.length === 0) {
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
        <SortableContext items={media} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-5 gap-2">
            {media.map((item, index) => (
              <SortableMedia key={item.id} item={item} index={index} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      <p className="mt-2 text-xs text-muted">
        첫 번째 사진/영상이 앨범 표지가 됩니다
      </p>
    </div>
  )
}
