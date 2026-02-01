'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import type { Post, Sticker, Stroke } from '@/lib/types'
import { generateId } from '@/lib/id-utils'
import AlbumRenderer from '@/components/album/AlbumRenderer'
import EditToolbar from './EditToolbar'
import StickerLayer from './StickerLayer'
import DrawingCanvas from './DrawingCanvas'

type EditMode = 'sticker' | 'drawing' | null

export default function EditPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const containerRef = useRef<HTMLDivElement>(null)

  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editMode, setEditMode] = useState<EditMode>(null)

  // 편집 상태
  const [stickers, setStickers] = useState<Sticker[]>([])
  const [drawings, setDrawings] = useState<Stroke[]>([])
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null)

  // 그리기 상태
  const [drawingColor, setDrawingColor] = useState('#000000')
  const [drawingThickness, setDrawingThickness] = useState(4)

  // 포스트 로드
  useEffect(() => {
    async function loadPost() {
      try {
        const res = await fetch(`/api/get-post?id=${id}`)
        if (!res.ok) throw new Error('Failed to load post')
        const data = await res.json()
        setPost(data.post)
        setStickers(data.post.stickers || [])
        setDrawings(data.post.drawings || [])
      } catch (error) {
        console.error('Load error:', error)
        router.push(`/p/${id}`)
      } finally {
        setLoading(false)
      }
    }
    loadPost()
  }, [id, router])

  // 저장
  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/update-decorations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: id,
          stickers,
          drawings,
        }),
      })
      if (!res.ok) throw new Error('Save failed')
      toast.success('저장되었습니다')
      router.push(`/p/${id}`)
    } catch (error) {
      console.error('Save error:', error)
      toast.error('저장에 실패했습니다')
    } finally {
      setSaving(false)
    }
  }

  // 취소
  const handleCancel = () => {
    router.push(`/p/${id}`)
  }

  // 스티커 추가 (클릭 시 - 현재 보고 있는 화면 중앙에)
  const handleAddSticker = (type: string) => {
    const container = containerRef.current
    if (!container) return

    const rect = container.getBoundingClientRect()
    // window.scrollY를 사용해 현재 스크롤 위치 기준 뷰포트 중앙 계산
    const viewportCenterY = window.scrollY + window.innerHeight / 2
    const viewportCenterX = rect.width / 2 - 20

    const newSticker: Sticker = {
      id: generateId('sticker'),
      type,
      x: viewportCenterX,
      y: viewportCenterY,
      scale: 1,
      rotation: 0,
    }
    setStickers([...stickers, newSticker])
    setSelectedStickerId(newSticker.id)
  }

  // 스티커 드롭 (드래그앤드롭 시 - 드롭된 위치에)
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const stickerType = e.dataTransfer.getData('sticker-type')
    if (!stickerType) return

    const container = containerRef.current
    if (!container) return

    const rect = container.getBoundingClientRect()
    // 드롭 위치를 컨테이너 기준 좌표로 변환
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top + window.scrollY

    const newSticker: Sticker = {
      id: generateId('sticker'),
      type: stickerType,
      x: x - 20, // 스티커 중앙 정렬
      y: y - 20,
      scale: 1,
      rotation: 0,
    }
    setStickers([...stickers, newSticker])
    setSelectedStickerId(newSticker.id)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }

  // 스티커 업데이트
  const handleUpdateSticker = (id: string, updates: Partial<Sticker>) => {
    setStickers(stickers.map((s) => (s.id === id ? { ...s, ...updates } : s)))
  }

  // 스티커 삭제
  const handleDeleteSticker = (id: string) => {
    setStickers(stickers.filter((s) => s.id !== id))
    if (selectedStickerId === id) {
      setSelectedStickerId(null)
    }
  }

  // 그리기 추가
  const handleAddStroke = (stroke: Stroke) => {
    setDrawings([...drawings, stroke])
  }

  // 그리기 실행 취소
  const handleUndoDrawing = () => {
    if (drawings.length > 0) {
      setDrawings(drawings.slice(0, -1))
    }
  }

  // 그리기 전체 지우기
  const handleClearDrawings = () => {
    setDrawings([])
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-foreground/20 border-t-foreground rounded-full" />
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted">앨범을 찾을 수 없습니다</p>
      </div>
    )
  }

  // 스티커/그리기가 포함된 포스트 생성 (미리보기용)
  const previewPost: Post = {
    ...post,
    stickers: [],
    drawings: [],
  }

  return (
    <div className={`min-h-screen bg-background ${editMode === 'drawing' ? 'drawing-active' : ''}`}>
      {/* 앨범 영역 */}
      <div
        ref={containerRef}
        className={`pb-48 relative ${editMode === 'drawing' ? 'drawing-active' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={(e) => e.preventDefault()}
        onClick={(e) => {
          // 스티커나 컨트롤 클릭이 아닐 때만 선택 해제
          const target = e.target as HTMLElement
          const isSticker = target.closest('[data-sticker]')
          const isControl = target.closest('[data-control]')
          if (editMode === 'sticker' && !isSticker && !isControl) {
            setSelectedStickerId(null)
          }
        }}
      >
        {/* 기본 앨범 렌더링 (스티커/그림 없이) */}
        <AlbumRenderer post={previewPost} />

        {/* 드래그 오버레이 (드롭존) */}
        {editMode === 'sticker' && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ zIndex: 15 }}
          />
        )}

        {/* 스티커 레이어 */}
        <StickerLayer
          stickers={stickers}
          selectedId={selectedStickerId}
          onSelect={setSelectedStickerId}
          onUpdate={handleUpdateSticker}
          onDelete={handleDeleteSticker}
          editable={editMode === 'sticker'}
        />

        {/* 그리기 캔버스 */}
        <DrawingCanvas
          strokes={drawings}
          onAddStroke={handleAddStroke}
          color={drawingColor}
          thickness={drawingThickness}
          active={editMode === 'drawing'}
        />
      </div>

      {/* 하단 툴바 */}
      <EditToolbar
        editMode={editMode}
        onModeChange={setEditMode}
        onAddSticker={handleAddSticker}
        onSave={handleSave}
        onCancel={handleCancel}
        saving={saving}
        // 그리기 도구
        drawingColor={drawingColor}
        onColorChange={setDrawingColor}
        drawingThickness={drawingThickness}
        onThicknessChange={setDrawingThickness}
        onUndo={handleUndoDrawing}
        onClear={handleClearDrawings}
        canUndo={drawings.length > 0}
      />
    </div>
  )
}
