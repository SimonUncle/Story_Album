'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getCurrentUser, signOut, onAuthStateChange } from '@/lib/supabase/auth'
import { supabase } from '@/lib/supabase/client'
import type { Post } from '@/lib/types'

export default function MyAlbumsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [albums, setAlbums] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 인증 상태 리스너
    const { data: { subscription } } = onAuthStateChange((user) => {
      setUser(user)
      if (!user) {
        router.push('/auth/login')
      }
    })

    // 초기 사용자 확인 및 앨범 로드
    async function init() {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push('/auth/login')
        return
      }
      setUser(currentUser)

      // 내 앨범 로드
      const { data } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false })

      setAlbums(data || [])
      setLoading(false)
    }

    init()

    return () => subscription.unsubscribe()
  }, [router])

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted">로딩 중...</div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      {/* 헤더 */}
      <header className="sticky top-0 bg-background/80 backdrop-blur-sm border-b border-gray-100 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="album-title text-2xl font-medium text-foreground">
            Story Album
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted">
              {user?.email}
            </span>
            <button
              onClick={handleSignOut}
              className="text-sm text-muted hover:text-foreground transition-colors"
            >
              로그아웃
            </button>
          </div>
        </div>
      </header>

      {/* 내 앨범 목록 */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-medium">내 앨범</h1>
          <Link
            href="/create"
            className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-white rounded-full hover:bg-foreground/90 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            새 앨범
          </Link>
        </div>

        {albums.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted mb-4">아직 만든 앨범이 없어요</p>
            <Link
              href="/create"
              className="inline-flex items-center justify-center px-6 py-3 bg-foreground text-white rounded-full hover:bg-foreground/90 transition-colors"
            >
              첫 앨범 만들기
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {albums.map((album) => (
              <Link
                key={album.id}
                href={`/p/${album.id}`}
                className="group relative aspect-[3/4] rounded-xl overflow-hidden bg-gray-100"
              >
                {album.image_urls[0] && (
                  <Image
                    src={album.image_urls[0]}
                    alt={album.title || '앨범'}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-white font-medium truncate">
                    {album.title || '제목 없음'}
                  </h3>
                  <p className="text-white/70 text-sm">
                    {new Date(album.created_at).toLocaleDateString('ko-KR')}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
