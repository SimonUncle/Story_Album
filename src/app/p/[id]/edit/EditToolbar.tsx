'use client'

import { STICKER_PRESETS, DRAWING_COLORS, DRAWING_THICKNESSES } from '@/lib/types'

type EditMode = 'sticker' | 'drawing' | null

interface EditToolbarProps {
  editMode: EditMode
  onModeChange: (mode: EditMode) => void
  onAddSticker: (type: string) => void
  onSave: () => void
  onCancel: () => void
  saving: boolean
  // 그리기 도구
  drawingColor: string
  onColorChange: (color: string) => void
  drawingThickness: number
  onThicknessChange: (thickness: number) => void
  onUndo: () => void
  onClear: () => void
  canUndo: boolean
}

export default function EditToolbar({
  editMode,
  onModeChange,
  onAddSticker,
  onSave,
  onCancel,
  saving,
  drawingColor,
  onColorChange,
  drawingThickness,
  onThicknessChange,
  onUndo,
  onClear,
  canUndo,
}: EditToolbarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      {/* 모드 선택 탭 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex gap-2">
          <button
            onClick={() => onModeChange(editMode === 'sticker' ? null : 'sticker')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              editMode === 'sticker'
                ? 'bg-foreground text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            스티커
          </button>
          <button
            onClick={() => onModeChange(editMode === 'drawing' ? null : 'drawing')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              editMode === 'drawing'
                ? 'bg-foreground text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            그리기
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700"
          >
            취소
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="px-6 py-2 bg-foreground text-white rounded-full text-sm font-medium disabled:opacity-50"
          >
            {saving ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>

      {/* 스티커 팔레트 */}
      {editMode === 'sticker' && (
        <div className="px-4 py-4 overflow-x-auto">
          <p className="text-xs text-gray-400 mb-2">클릭하거나 드래그해서 추가하세요</p>
          <div className="flex gap-3">
            {STICKER_PRESETS.map((sticker) => (
              <button
                key={sticker.id}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('sticker-type', sticker.id)
                  e.dataTransfer.effectAllowed = 'copy'
                }}
                onClick={() => onAddSticker(sticker.id)}
                className="flex-shrink-0 flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-grab active:cursor-grabbing"
              >
                <span className="text-2xl">
                  {sticker.emoji || (
                    <span className="text-sm font-bold bg-gradient-to-r from-pink-400 to-purple-400 text-transparent bg-clip-text">
                      {sticker.text}
                    </span>
                  )}
                </span>
                <span className="text-xs text-gray-500">{sticker.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 그리기 도구 */}
      {editMode === 'drawing' && (
        <div className="px-4 py-4 space-y-4">
          {/* 색상 선택 */}
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-500 w-12">색상</span>
            <div className="flex gap-2">
              {DRAWING_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => onColorChange(color)}
                  className={`w-8 h-8 rounded-full border-2 transition-transform ${
                    drawingColor === color
                      ? 'border-foreground scale-110'
                      : 'border-gray-200'
                  }`}
                  style={{
                    backgroundColor: color,
                    boxShadow: color === '#FFFFFF' ? 'inset 0 0 0 1px #e5e5e5' : undefined,
                  }}
                />
              ))}
            </div>
          </div>

          {/* 굵기 선택 */}
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-500 w-12">굵기</span>
            <div className="flex gap-3 items-center">
              {DRAWING_THICKNESSES.map((thickness) => (
                <button
                  key={thickness}
                  onClick={() => onThicknessChange(thickness)}
                  className={`flex items-center justify-center w-10 h-10 rounded-lg transition-colors ${
                    drawingThickness === thickness
                      ? 'bg-foreground'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  <div
                    className={`rounded-full ${
                      drawingThickness === thickness ? 'bg-white' : 'bg-gray-600'
                    }`}
                    style={{
                      width: thickness * 2,
                      height: thickness * 2,
                    }}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* 실행취소 / 전체지우기 */}
          <div className="flex gap-2">
            <button
              onClick={onUndo}
              disabled={!canUndo}
              className="px-4 py-2 text-sm bg-gray-100 rounded-lg disabled:opacity-30 hover:bg-gray-200 transition-colors"
            >
              실행취소
            </button>
            <button
              onClick={onClear}
              disabled={!canUndo}
              className="px-4 py-2 text-sm bg-gray-100 rounded-lg disabled:opacity-30 hover:bg-gray-200 transition-colors"
            >
              전체지우기
            </button>
          </div>
        </div>
      )}

      {/* 도움말 */}
      {!editMode && (
        <div className="px-4 py-6 text-center text-sm text-gray-400">
          스티커 또는 그리기를 선택하세요
        </div>
      )}
    </div>
  )
}
