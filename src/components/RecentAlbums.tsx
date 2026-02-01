'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getCurrentUser, onAuthStateChange } from '@/lib/supabase/auth'
import { supabase } from '@/lib/supabase/client'

interface Album {
  id: string
  title: string | null
  created_at: string
  image_urls: string[]
  type: string
}

export default function RecentAlbums() {
  const [user, setUser] = useState<any>(null)
  const [albums, setAlbums] = useState<Album[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 인증 상태 리스너
    const { data: { subscription } } = onAuthStateChange((user) => {
      setUser(user)
      loadAlbums(user)
    })

    // 초기 로드
    async function init() {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
      await loadAlbums(currentUser)
    }
    init()

    return () => subscription.unsubscribe()
  }, [])

  async function loadAlbums(currentUser: any) {
    setLoading(true)
    try {
      let query = supabase
        .from('posts')
        .select('id, title, created_at, image_urls, type')
        .order('created_at', { ascending: false })
        .limit(6)

      if (currentUser) {
        // 로그인: 내 앨범만
        query = query.eq('user_id', currentUser.id)
      } else {
        // 비로그인: 공개 앨범
        query = query.eq('is_public', true)
      }

      const { data } = await query
      setAlbums(data || [])
    } catch (error) {
      console.error('Failed to load albums:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="animate-pulse text-muted">로딩 중...</div>
        </div>
      </section>
    )
  }

  if (albums.length === 0) {
    return (
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="album-title text-2xl md:text-3xl font-medium text-foreground mb-6">
            {user ? '내 앨범' : '최근 앨범'}
          </h2>
          <p className="text-muted mb-8">
            {user ? '아직 만든 앨범이 없어요' : '아직 앨범이 없어요'}
          </p>
          <Link
            href="/create"
            className="inline-flex items-center justify-center px-6 py-3 bg-foreground text-white rounded-full hover:bg-foreground/90 transition-colors"
          >
            첫 앨범 만들기
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="album-title text-2xl md:text-3xl font-medium text-foreground mb-12 text-center">
          {user ? '내 앨범' : '최근 앨범'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {albums.map((album) => (
            <Link
              key={album.id}
              href={`/p/${album.id}`}
              className="group block"
            >
              <div className="aspect-[4/5] relative overflow-hidden rounded-lg bg-gray-100">
                {album.image_urls?.[0] && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={album.image_urls[0]}
                    alt={album.title || '앨범'}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}
              </div>
              <div className="mt-4">
                <h3 className="album-title text-lg font-medium text-foreground">
                  {album.title || '제목 없음'}
                </h3>
                <p className="text-sm text-muted mt-1">
                  {new Date(album.created_at).toLocaleDateString('ko-KR')}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
