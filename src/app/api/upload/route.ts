import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/server'
import type { MediaItem } from '@/lib/types'

// 지원하는 미디어 타입
const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const SUPPORTED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/webm']

// 파일 크기 제한
const MAX_IMAGE_SIZE = 20 * 1024 * 1024 // 20MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024 // 100MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    const types = formData.getAll('types') as string[] // 'image' | 'video'

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: '파일이 없습니다' },
        { status: 400 }
      )
    }

    if (files.length > 10) {
      return NextResponse.json(
        { error: '최대 10개의 파일만 업로드할 수 있습니다' },
        { status: 400 }
      )
    }

    const supabase = createRouteHandlerClient(request)
    const mediaItems: MediaItem[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const fileType = types[i] || (file.type.startsWith('video/') ? 'video' : 'image')
      const isVideo = fileType === 'video'

      // 파일 타입 유효성 검사
      if (isVideo) {
        if (!SUPPORTED_VIDEO_TYPES.includes(file.type)) {
          return NextResponse.json(
            { error: `지원하지 않는 영상 형식입니다: ${file.type}` },
            { status: 400 }
          )
        }
        // 영상 크기 제한
        if (file.size > MAX_VIDEO_SIZE) {
          return NextResponse.json(
            { error: '영상 파일 크기는 50MB 이하여야 합니다' },
            { status: 400 }
          )
        }
      } else {
        if (!SUPPORTED_IMAGE_TYPES.includes(file.type)) {
          return NextResponse.json(
            { error: `지원하지 않는 이미지 형식입니다: ${file.type}` },
            { status: 400 }
          )
        }
        // 이미지 크기 제한
        if (file.size > MAX_IMAGE_SIZE) {
          return NextResponse.json(
            { error: '이미지 파일 크기는 5MB 이하여야 합니다' },
            { status: 400 }
          )
        }
      }

      // 고유 파일명 생성
      const timestamp = Date.now()
      const randomId = Math.random().toString(36).substring(2, 15)
      const extension = file.name.split('.').pop() || (isVideo ? 'mp4' : 'jpg')
      const folder = isVideo ? 'videos' : 'images'
      const fileName = `${folder}/${timestamp}-${randomId}.${extension}`

      // Supabase Storage에 업로드
      const { error: uploadError } = await supabase.storage
        .from('story-album')
        .upload(fileName, file, {
          contentType: file.type,
          upsert: false,
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        return NextResponse.json(
          { error: `업로드 실패: ${uploadError.message}` },
          { status: 500 }
        )
      }

      // Public URL 생성
      const { data: urlData } = supabase.storage
        .from('story-album')
        .getPublicUrl(fileName)

      mediaItems.push({
        url: urlData.publicUrl,
        type: isVideo ? 'video' : 'image',
      })
    }

    // 레거시 지원: urls 배열도 함께 반환
    const urls = mediaItems.map((m) => m.url)

    return NextResponse.json({ urls, mediaItems })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: '업로드 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
