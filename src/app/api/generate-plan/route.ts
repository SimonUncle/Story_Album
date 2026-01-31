import { NextRequest, NextResponse } from 'next/server'
import { generatePlan } from '@/lib/plan-generator'
import type { GeneratePlanRequest } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const body: GeneratePlanRequest = await request.json()
    const { imageCount, type, moods, title } = body

    // 유효성 검사
    if (!imageCount || imageCount < 1 || imageCount > 10) {
      return NextResponse.json(
        { error: '이미지 수는 1~10개여야 합니다' },
        { status: 400 }
      )
    }

    if (!type) {
      return NextResponse.json(
        { error: '여행 타입이 필요합니다' },
        { status: 400 }
      )
    }

    if (!moods || moods.length === 0) {
      return NextResponse.json(
        { error: '최소 1개의 분위기를 선택해주세요' },
        { status: 400 }
      )
    }

    // 계획 생성 (AI 또는 템플릿)
    const plan = await generatePlan(imageCount, type, moods, title)

    return NextResponse.json(plan)
  } catch (error) {
    console.error('Generate plan error:', error)
    return NextResponse.json(
      { error: '계획 생성 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
