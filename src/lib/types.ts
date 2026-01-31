// 미디어 아이템 (사진/영상)
export interface MediaItem {
  url: string
  type: 'image' | 'video'
  thumbnail?: string
}

// 자막 타입
export interface Subtitle {
  id: string
  mediaIndex: number
  text: string
  position: { x: number; y: number }
}

// 필터 타입
export type FilterType = 'none' | 'warm' | 'film' | 'mono'

export const FILTERS: { value: FilterType; label: string; description: string }[] = [
  { value: 'none', label: '원본', description: '필터 없음' },
  { value: 'warm', label: '웜톤', description: '따뜻한 브이로그 감성' },
  { value: 'film', label: '필름', description: '빈티지 느낌' },
  { value: 'mono', label: '모노', description: '흑백' },
]

// 특수문자 (자막용)
export const SPECIAL_CHARS = ['♡', '♪', '★', '✿', '☀', '♥', '◡', '˘', '~', '!']

// Post 타입
export interface Post {
  id: string
  created_at: string
  title: string | null
  type: TripType
  moods: Mood[]
  start_date: string | null
  end_date: string | null
  image_urls: string[]
  media_items: MediaItem[]
  subtitles: Subtitle[]
  filter: FilterType
  edit_plan: AlbumBlock[]
  user_texts: UserText[]
  is_public: boolean
  // v3: 스티커 & 그리기
  stickers?: Sticker[]
  drawings?: Stroke[]
}

// 여행 타입
export type TripType = 'couple' | 'friends' | 'solo' | 'family'

export const TRIP_TYPES: { value: TripType; label: string; emoji: string }[] = [
  { value: 'couple', label: '커플', emoji: '💑' },
  { value: 'friends', label: '친구', emoji: '👯' },
  { value: 'solo', label: '솔로', emoji: '🚶' },
  { value: 'family', label: '가족', emoji: '👨‍👩‍👧‍👦' },
]

// 무드 타입
export type Mood =
  | 'romantic'
  | 'adventure'
  | 'peaceful'
  | 'fun'
  | 'emotional'
  | 'nostalgic'

export const MOODS: { value: Mood; label: string; emoji: string }[] = [
  { value: 'romantic', label: '로맨틱', emoji: '💕' },
  { value: 'adventure', label: '모험', emoji: '🏔️' },
  { value: 'peaceful', label: '평화로운', emoji: '🌿' },
  { value: 'fun', label: '신나는', emoji: '🎉' },
  { value: 'emotional', label: '감성적인', emoji: '🌙' },
  { value: 'nostalgic', label: '추억', emoji: '📷' },
]

// 앨범 블록 타입들
export type AlbumBlock =
  | HeroBlock
  | ImageBlock
  | TextSlotBlock
  | SpacerBlock
  | EndingBlock

export interface HeroBlock {
  type: 'hero'
  imageIndex: number
}

export interface ImageBlock {
  type: 'image'
  imageIndex: number
  size: 'full' | 'medium' | 'small'
}

export interface TextSlotBlock {
  type: 'textSlot'
  slotId: string
  hint: string
}

export interface SpacerBlock {
  type: 'spacer'
  height: 'sm' | 'md' | 'lg'
}

export interface EndingBlock {
  type: 'ending'
  imageIndex: number
  closingHint: string
}

// 사용자 텍스트
export interface UserText {
  slotId: string
  original: string
  polished?: string
}

// API 타입들
export interface GeneratePlanRequest {
  imageCount: number
  type: TripType
  moods: Mood[]
  title?: string
}

export interface GeneratePlanResponse {
  title: string
  editPlan: AlbumBlock[]
  textSlots: { slotId: string; hint: string }[]
}

export interface CreatePostRequest {
  title: string
  type: TripType
  moods: Mood[]
  startDate?: string
  endDate?: string
  imageUrls: string[]
  editPlan: AlbumBlock[]
  userTexts: UserText[]
  // v2 fields
  mediaItems?: MediaItem[]
  subtitles?: Subtitle[]
  filter?: FilterType
}

// 이미지 업로드용 (레거시)
export interface UploadedImage {
  id: string
  file: File
  preview: string
  url?: string
}

// 미디어 업로드용 (사진/영상)
export interface UploadedMedia {
  id: string
  file: File
  preview: string
  type: 'image' | 'video'
  duration?: number // 영상 길이 (초)
  thumbnail?: string // 영상 썸네일
  url?: string
}

// ===== v3: 스티커 & 그리기 =====

// 스티커
export interface Sticker {
  id: string
  type: string // 스티커 종류 (heart, star, fighting 등)
  x: number // px (앨범 왼쪽 기준)
  y: number // px (앨범 상단 기준)
  scale: number // 0.5 ~ 2.0
  rotation: number // 0 ~ 360
  customText?: string // 말풍선용 사용자 텍스트
}

// 그리기 선
export interface Stroke {
  id: string
  points: { x: number; y: number }[] // px 좌표
  color: string
  thickness: number
}

// 스티커 프리셋
export interface StickerPreset {
  id: string
  emoji?: string
  text?: string
  label: string
}

export const STICKER_PRESETS: StickerPreset[] = [
  { id: 'heart', emoji: '❤️', label: '하트' },
  { id: 'star', emoji: '⭐', label: '별' },
  { id: 'sparkle', emoji: '✨', label: '반짝' },
  { id: 'flower', emoji: '🌸', label: '꽃' },
  { id: 'rainbow', emoji: '🌈', label: '무지개' },
  { id: 'cloud', emoji: '☁️', label: '구름' },
  { id: 'sun', emoji: '☀️', label: '태양' },
  { id: 'moon', emoji: '🌙', label: '달' },
  { id: 'speech', emoji: '💬', label: '말풍선' }, // 말풍선 (텍스트 입력 가능)
  { id: 'fighting', text: '화이팅!', label: '화이팅' },
  { id: 'love', text: '사랑해', label: '사랑해' },
  { id: 'best', text: '최고!', label: '최고' },
  { id: 'good', text: '굿굿', label: '굿굿' },
  { id: 'healing', text: '힐링', label: '힐링' },
  { id: 'happy', text: '행복', label: '행복' },
]

// 그리기 색상
export const DRAWING_COLORS = [
  '#000000', // 검정
  '#FF0000', // 빨강
  '#FF6B6B', // 연빨강
  '#FFE66D', // 노랑
  '#4ECDC4', // 청록
  '#45B7D1', // 하늘
  '#96CEB4', // 연두
  '#FFFFFF', // 흰색
]

// 그리기 펜 굵기
export const DRAWING_THICKNESSES = [2, 4, 6, 8]
