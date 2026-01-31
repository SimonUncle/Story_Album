import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import type { Sticker, Stroke } from '@/lib/types'

interface UpdateDecorationsRequest {
  postId: string
  stickers: Sticker[]
  drawings: Stroke[]
}

export async function POST(request: NextRequest) {
  try {
    const body: UpdateDecorationsRequest = await request.json()
    const { postId, stickers, drawings } = body

    if (!postId) {
      return NextResponse.json(
        { error: '포스트 ID가 필요합니다' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    // 포스트 업데이트
    const { error } = await supabase
      .from('posts')
      .update({
        stickers: stickers || [],
        drawings: drawings || [],
      })
      .eq('id', postId)

    if (error) {
      console.error('Update error:', error)
      return NextResponse.json(
        { error: '저장 실패: ' + error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Update decorations error:', error)
    return NextResponse.json(
      { error: '저장 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
