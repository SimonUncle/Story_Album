import { GoogleGenerativeAI } from '@google/generative-ai'
import type { TripType, Mood, AlbumBlock, GeneratePlanResponse } from './types'

const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null

export async function generatePlanWithAI(
  imageCount: number,
  type: TripType,
  moods: Mood[],
  userTitle?: string
): Promise<GeneratePlanResponse | null> {
  if (!genAI) {
    return null
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' })

    const prompt = `당신은 사진 에디터입니다. 여행 앨범의 레이아웃을 설계해주세요.

입력 정보:
- 사진 수: ${imageCount}장
- 여행 타입: ${type}
- 분위기: ${moods.join(', ')}
${userTitle ? `- 사용자 제목: ${userTitle}` : '- 제목 없음 (제안 필요)'}

다음 JSON 형식으로 응답해주세요:
{
  "title": "앨범 제목 (사용자가 제공하지 않았다면 여행 타입과 분위기에 맞는 감성적인 제목)",
  "editPlan": [
    앨범 블록들의 배열
  ],
  "textSlots": [
    { "slotId": "고유ID", "hint": "이 슬롯에 어울리는 한 줄 일기 힌트" }
  ]
}

블록 타입들:
1. hero: 첫 번째 풀블리드 이미지 {"type": "hero", "imageIndex": 0}
2. image: 일반 이미지 {"type": "image", "imageIndex": 번호, "size": "full"|"medium"|"small"}
3. textSlot: 텍스트 슬롯 {"type": "textSlot", "slotId": "고유ID", "hint": "힌트"}
4. spacer: 여백 {"type": "spacer", "height": "sm"|"md"|"lg"}
5. ending: 마지막 이미지 {"type": "ending", "imageIndex": 마지막번호, "closingHint": "마무리 문구 힌트"}

규칙:
- hero는 항상 첫 번째 (imageIndex: 0)
- ending은 항상 마지막 이미지
- 각 사진 사이에 적절히 spacer나 textSlot 배치
- textSlot은 2-4개 정도 (사진 수에 따라)
- 사진은 순서대로 모두 사용
- 중간 이미지들의 size는 다양하게 섞기 (리듬감)

JSON만 응답하세요.`

    const result = await model.generateContent(prompt)
    const response = result.response
    const text = response.text()

    // JSON 파싱 (마크다운 코드 블록 제거)
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error('Failed to extract JSON from response')
      return null
    }

    const parsed = JSON.parse(jsonMatch[0]) as GeneratePlanResponse
    return parsed
  } catch (error) {
    console.error('Gemini API error:', error)
    return null
  }
}

export async function suggestTitle(
  type: TripType,
  moods: Mood[]
): Promise<string | null> {
  if (!genAI) {
    return null
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' })

    const prompt = `여행 앨범 제목을 하나만 제안해주세요.
여행 타입: ${type}
분위기: ${moods.join(', ')}

감성적이고 간결한 한국어 제목만 응답해주세요. 따옴표나 설명 없이 제목만.`

    const result = await model.generateContent(prompt)
    const response = result.response
    return response.text().trim()
  } catch (error) {
    console.error('Gemini API error:', error)
    return null
  }
}
