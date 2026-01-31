import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import type { CreatePostRequest } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const body: CreatePostRequest = await request.json()
    const {
      title,
      type,
      moods,
      startDate,
      endDate,
      imageUrls,
      editPlan,
      userTexts,
      // v2 fields
      mediaItems,
      subtitles,
      filter,
    } = body

    // 유효성 검사
    if (!imageUrls || imageUrls.length === 0) {
      return NextResponse.json(
        { error: '최소 1개의 이미지가 필요합니다' },
        { status: 400 }
      )
    }

    if (!type) {
      return NextResponse.json(
        { error: '여행 타입이 필요합니다' },
        { status: 400 }
      )
    }

    if (!editPlan || editPlan.length === 0) {
      return NextResponse.json(
        { error: '편집 계획이 필요합니다' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    // 포스트 생성 (v2 필드 포함)
    const { data, error } = await supabase
      .from('posts')
      .insert({
        title: title || null,
        type,
        moods: moods || [],
        start_date: startDate || null,
        end_date: endDate || null,
        image_urls: imageUrls,
        edit_plan: editPlan,
        user_texts: userTexts || [],
        is_public: true,
        // v2 fields
        media_items: mediaItems || [],
        subtitles: subtitles || [],
        filter: filter || 'none',
      })
      .select('id')
      .single()

    if (error) {
      console.error('Create post error:', error)
      return NextResponse.json(
        { error: `포스트 생성 실패: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ id: data.id })
  } catch (error) {
    console.error('Create post error:', error)
    return NextResponse.json(
      { error: '포스트 생성 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
