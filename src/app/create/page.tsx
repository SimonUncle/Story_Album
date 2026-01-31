'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import MediaUploader from '@/components/MediaUploader'
import MediaSortable from '@/components/MediaSortable'
import SubtitleEditor from '@/components/SubtitleEditor'
import FilterSelector from '@/components/FilterSelector'
import TripTypeSelector from '@/components/TripTypeSelector'
import MoodSelector from '@/components/MoodSelector'
import DateRangePicker from '@/components/DateRangePicker'
import TextSlotEditor from '@/components/TextSlotEditor'
import type {
  TripType,
  Mood,
  UploadedMedia,
  UserText,
  AlbumBlock,
  GeneratePlanResponse,
  Subtitle,
  FilterType,
  MediaItem,
} from '@/lib/types'

// 새 플로우: 업로드 → 정렬 → 자막 → 필터 → 정보 → 생성 → 완료
type Step = 'upload' | 'sort' | 'subtitle' | 'filter' | 'details' | 'text' | 'creating' | 'done'

const STEPS: { key: Step; label: string }[] = [
  { key: 'upload', label: '업로드' },
  { key: 'sort', label: '정렬' },
  { key: 'subtitle', label: '자막' },
  { key: 'filter', label: '필터' },
  { key: 'details', label: '정보' },
  { key: 'text', label: '텍스트' },
]

export default function CreatePage() {
  const router = useRouter()

  // Step management
  const [step, setStep] = useState<Step>('upload')

  // Media state (v2: 사진 + 영상)
  const [media, setMedia] = useState<UploadedMedia[]>([])
  const [subtitles, setSubtitles] = useState<Subtitle[]>([])
  const [filter, setFilter] = useState<FilterType>('none')

  // Form state
  const [title, setTitle] = useState('')
  const [tripType, setTripType] = useState<TripType | null>(null)
  const [moods, setMoods] = useState<Mood[]>([])
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  // Plan state
  const [editPlan, setEditPlan] = useState<AlbumBlock[]>([])
  const [textSlots, setTextSlots] = useState<{ slotId: string; hint: string }[]>([])
  const [userTexts, setUserTexts] = useState<UserText[]>([])
  const [generatedTitle, setGeneratedTitle] = useState('')

  // Loading state
  const [isGenerating, setIsGenerating] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState('')
  const [createdId, setCreatedId] = useState<string | null>(null)

  // Step 1: Upload media
  const handleMediaChange = useCallback((newMedia: UploadedMedia[]) => {
    setMedia(newMedia)
    setError('')
  }, [])

  const goToSort = () => {
    if (media.length === 0) {
      setError('최소 1개의 사진 또는 영상을 업로드해주세요')
      return
    }
    setStep('sort')
  }

  // Step 2: Sort
  const goToSubtitle = () => {
    setStep('subtitle')
  }

  // Step 3: Subtitle (optional)
  const goToFilter = () => {
    setStep('filter')
  }

  // Step 4: Filter
  const goToDetails = () => {
    setStep('details')
  }

  // Step 5: Generate plan
  const generatePlan = async () => {
    if (!tripType) {
      setError('여행 타입을 선택해주세요')
      return
    }
    if (moods.length === 0) {
      setError('최소 1개의 분위기를 선택해주세요')
      return
    }

    setIsGenerating(true)
    setError('')

    try {
      const response = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageCount: media.length,
          type: tripType,
          moods,
          title: title || undefined,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || '계획 생성 실패')
      }

      const data: GeneratePlanResponse = await response.json()
      setEditPlan(data.editPlan)
      setTextSlots(data.textSlots)
      setGeneratedTitle(data.title)
      setStep('text')
    } catch (err) {
      setError(err instanceof Error ? err.message : '계획 생성 중 오류 발생')
    } finally {
      setIsGenerating(false)
    }
  }

  // Step 6: Create album
  const createAlbum = async () => {
    setIsCreating(true)
    setStep('creating')
    setError('')

    try {
      // 1. Upload media files
      const formData = new FormData()
      for (const item of media) {
        formData.append('files', item.file)
        formData.append('types', item.type)
      }

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!uploadResponse.ok) {
        const data = await uploadResponse.json()
        throw new Error(data.error || '미디어 업로드 실패')
      }

      const { urls, mediaItems } = await uploadResponse.json() as {
        urls: string[]
        mediaItems: MediaItem[]
      }

      // 2. Create post with v2 features
      const createResponse = await fetch('/api/create-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title || generatedTitle,
          type: tripType,
          moods,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          imageUrls: urls, // 레거시 지원
          mediaItems, // v2: 미디어 아이템
          subtitles, // v2: 자막
          filter, // v2: 필터
          editPlan,
          userTexts,
        }),
      })

      if (!createResponse.ok) {
        const data = await createResponse.json()
        throw new Error(data.error || '앨범 생성 실패')
      }

      const { id } = await createResponse.json()
      setCreatedId(id)
      setStep('done')
    } catch (err) {
      setError(err instanceof Error ? err.message : '앨범 생성 중 오류 발생')
      setStep('text')
    } finally {
      setIsCreating(false)
    }
  }

  // Get current step index for progress indicator
  const currentStepIndex = STEPS.findIndex((s) => s.key === step)

  return (
    <main className="min-h-screen py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <Link
            href="/"
            className="text-sm text-muted hover:text-foreground transition-colors"
          >
            ← 홈으로
          </Link>
          <h1 className="album-title text-3xl md:text-4xl font-medium mt-4">
            앨범 만들기
          </h1>
          <p className="text-muted mt-2">
            {step === 'upload' && '사진/영상을 업로드해주세요 (영상 15초 이하)'}
            {step === 'sort' && '순서를 드래그로 정해주세요'}
            {step === 'subtitle' && '브이로그 자막을 추가해주세요 (선택)'}
            {step === 'filter' && '색감 필터를 선택해주세요'}
            {step === 'details' && '여행에 대해 알려주세요'}
            {step === 'text' && '한 줄 일기를 남겨주세요 (선택)'}
            {step === 'creating' && '앨범을 생성하고 있어요...'}
            {step === 'done' && ''}
          </p>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center gap-1 mb-8 overflow-x-auto pb-2">
          {STEPS.map((s, i) => (
            <div key={s.key} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${
                  currentStepIndex >= i
                    ? 'bg-foreground text-white'
                    : 'bg-gray-200 text-muted'
                }`}
              >
                {i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`w-6 md:w-10 h-0.5 ${
                    currentStepIndex > i ? 'bg-foreground' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Step 1: Upload */}
        {step === 'upload' && (
          <div className="space-y-8">
            <MediaUploader
              media={media}
              onMediaChange={handleMediaChange}
              maxItems={10}
              maxVideoDuration={15}
            />

            <div className="flex justify-end">
              <Button
                onClick={goToSort}
                disabled={media.length === 0}
                size="lg"
              >
                다음
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Sort */}
        {step === 'sort' && (
          <div className="space-y-8">
            <MediaSortable media={media} onReorder={setMedia} />

            <div className="flex justify-between">
              <Button variant="secondary" onClick={() => setStep('upload')}>
                이전
              </Button>
              <Button onClick={goToSubtitle} size="lg">
                다음
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Subtitle */}
        {step === 'subtitle' && (
          <div className="space-y-8">
            <SubtitleEditor
              media={media}
              subtitles={subtitles}
              onSubtitlesChange={setSubtitles}
              filter={filter}
            />

            <div className="flex justify-between">
              <Button variant="secondary" onClick={() => setStep('sort')}>
                이전
              </Button>
              <Button onClick={goToFilter} size="lg">
                {subtitles.length > 0 ? '다음' : '건너뛰기'}
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Filter */}
        {step === 'filter' && (
          <div className="space-y-8">
            <FilterSelector
              selectedFilter={filter}
              onFilterChange={setFilter}
              previewMedia={media[0]}
            />

            <div className="flex justify-between">
              <Button variant="secondary" onClick={() => setStep('subtitle')}>
                이전
              </Button>
              <Button onClick={goToDetails} size="lg">
                다음
              </Button>
            </div>
          </div>
        )}

        {/* Step 5: Details */}
        {step === 'details' && (
          <div className="space-y-8">
            <Input
              label="앨범 제목 (선택)"
              placeholder="제목을 입력하지 않으면 자동 생성됩니다"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <TripTypeSelector value={tripType} onChange={setTripType} />

            <MoodSelector value={moods} onChange={setMoods} maxSelect={2} />

            <DateRangePicker
              startDate={startDate}
              endDate={endDate}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
            />

            <div className="flex justify-between">
              <Button variant="secondary" onClick={() => setStep('filter')}>
                이전
              </Button>
              <Button
                onClick={generatePlan}
                disabled={!tripType || moods.length === 0}
                isLoading={isGenerating}
                size="lg"
              >
                앨범 구성하기
              </Button>
            </div>
          </div>
        )}

        {/* Step 6: Text */}
        {step === 'text' && (
          <div className="space-y-8">
            {/* Preview title */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-muted mb-1">앨범 제목</p>
              <p className="album-title text-xl font-medium">
                {title || generatedTitle}
              </p>
            </div>

            <TextSlotEditor
              textSlots={textSlots}
              userTexts={userTexts}
              onUserTextsChange={setUserTexts}
            />

            <div className="flex justify-between">
              <Button variant="secondary" onClick={() => setStep('details')}>
                이전
              </Button>
              <Button onClick={createAlbum} size="lg">
                앨범 완성하기
              </Button>
            </div>
          </div>
        )}

        {/* Step 7: Creating */}
        {step === 'creating' && (
          <div className="text-center py-20">
            <div className="animate-spin w-12 h-12 border-4 border-foreground/20 border-t-foreground rounded-full mx-auto mb-6" />
            <p className="text-lg text-muted">앨범을 만들고 있어요...</p>
            <p className="text-sm text-gray-400 mt-2">잠시만 기다려주세요</p>
          </div>
        )}

        {/* Step 8: Done */}
        {step === 'done' && createdId && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-medium mb-2">앨범 완성!</h2>
            <p className="text-muted mb-8">이제 스티커와 그림으로 꾸며보세요</p>

            <div className="space-y-3 max-w-sm mx-auto">
              <Link
                href={`/p/${createdId}/edit`}
                className="flex items-center justify-center gap-2 w-full px-6 py-4 bg-foreground text-white rounded-full hover:bg-foreground/90 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                꾸미기
              </Link>
              <Link
                href={`/p/${createdId}`}
                className="flex items-center justify-center w-full px-6 py-4 text-foreground border border-foreground/20 rounded-full hover:bg-gray-50 transition-colors"
              >
                앨범 보기
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
