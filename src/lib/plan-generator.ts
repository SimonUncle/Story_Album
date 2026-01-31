import type {
  TripType,
  Mood,
  AlbumBlock,
  GeneratePlanResponse,
} from './types'
import { generatePlanWithAI } from './gemini'

// 결정론적 템플릿 기반 계획 생성
function generateTemplatePlan(
  imageCount: number,
  type: TripType,
  moods: Mood[],
  userTitle?: string
): GeneratePlanResponse {
  const blocks: AlbumBlock[] = []
  const textSlots: { slotId: string; hint: string }[] = []

  // 기본 제목 생성
  const title = userTitle || generateDefaultTitle(type, moods)

  // Hero 블록 (첫 번째 이미지)
  blocks.push({ type: 'hero', imageIndex: 0 })
  blocks.push({ type: 'spacer', height: 'lg' })

  // 첫 번째 텍스트 슬롯
  const slot1Id = 'intro'
  textSlots.push({ slotId: slot1Id, hint: '여행의 시작, 어떤 마음이었나요?' })
  blocks.push({ type: 'textSlot', slotId: slot1Id, hint: '여행의 시작, 어떤 마음이었나요?' })
  blocks.push({ type: 'spacer', height: 'md' })

  // 중간 이미지들 배치
  const middleImages = imageCount - 2 // hero와 ending 제외

  if (middleImages > 0) {
    const sizes: ('full' | 'medium' | 'small')[] = ['full', 'medium', 'small']

    for (let i = 1; i <= middleImages; i++) {
      const sizeIndex = (i - 1) % 3
      blocks.push({
        type: 'image',
        imageIndex: i,
        size: sizes[sizeIndex],
      })

      // 중간에 텍스트 슬롯 삽입 (3번째, 6번째 이미지 후)
      if (i === Math.floor(middleImages / 2) && middleImages >= 3) {
        blocks.push({ type: 'spacer', height: 'md' })
        const slotMidId = 'middle'
        textSlots.push({ slotId: slotMidId, hint: '가장 기억에 남는 순간은?' })
        blocks.push({
          type: 'textSlot',
          slotId: slotMidId,
          hint: '가장 기억에 남는 순간은?',
        })
        blocks.push({ type: 'spacer', height: 'md' })
      } else {
        blocks.push({ type: 'spacer', height: i % 2 === 0 ? 'lg' : 'md' })
      }
    }
  }

  // 마지막 전 텍스트 슬롯
  if (imageCount >= 3) {
    const slotEndId = 'closing'
    textSlots.push({ slotId: slotEndId, hint: '이 여행이 남긴 것은?' })
    blocks.push({
      type: 'textSlot',
      slotId: slotEndId,
      hint: '이 여행이 남긴 것은?',
    })
    blocks.push({ type: 'spacer', height: 'lg' })
  }

  // Ending 블록 (마지막 이미지)
  if (imageCount >= 2) {
    blocks.push({
      type: 'ending',
      imageIndex: imageCount - 1,
      closingHint: '다음 여행을 기약하며',
    })
  }

  return { title, editPlan: blocks, textSlots }
}

// 기본 제목 생성
function generateDefaultTitle(type: TripType, moods: Mood[]): string {
  const typeTitles: Record<TripType, string[]> = {
    couple: ['우리의 순간들', '함께한 시간', '둘이서 걷는 길'],
    friends: ['우정의 기록', '함께여서 좋았던', '친구들과의 하루'],
    solo: ['나만의 시간', '혼자 걷는 길', '오롯이 나'],
    family: ['가족의 추억', '함께한 시간들', '우리 가족 이야기'],
  }

  const moodSuffixes: Record<Mood, string> = {
    romantic: '로맨틱한',
    adventure: '모험적인',
    peaceful: '평화로운',
    fun: '신나는',
    emotional: '감성적인',
    nostalgic: '추억의',
  }

  const baseTitle = typeTitles[type][Math.floor(Math.random() * typeTitles[type].length)]

  if (moods.length > 0) {
    const moodPrefix = moodSuffixes[moods[0]]
    return `${moodPrefix} ${baseTitle}`
  }

  return baseTitle
}

// 메인 함수: AI 시도 후 실패 시 템플릿 사용
export async function generatePlan(
  imageCount: number,
  type: TripType,
  moods: Mood[],
  userTitle?: string
): Promise<GeneratePlanResponse> {
  // AI로 먼저 시도
  const aiPlan = await generatePlanWithAI(imageCount, type, moods, userTitle)

  if (aiPlan) {
    return aiPlan
  }

  // AI 실패 시 템플릿 사용
  console.log('Using template plan (AI unavailable or failed)')
  return generateTemplatePlan(imageCount, type, moods, userTitle)
}
