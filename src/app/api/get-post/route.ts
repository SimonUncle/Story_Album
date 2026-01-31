import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import type { Post } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: '포스트 ID가 필요합니다' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: '포스트를 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    return NextResponse.json({ post: data as Post })
  } catch (error) {
    console.error('Get post error:', error)
    return NextResponse.json(
      { error: '포스트 조회 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
