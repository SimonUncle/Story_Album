import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import Header from '@/components/Header'

export const revalidate = 60 // 1분마다 재검증

async function getRecentAlbums() {
  try {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('posts')
      .select('id, title, created_at, image_urls, type')
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(6)

    if (error) throw error
    return data || []
  } catch {
    return []
  }
}

export default async function Home() {
  const recentAlbums = await getRecentAlbums()

  return (
    <main className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center">
        <h1 className="album-title text-4xl md:text-6xl lg:text-7xl font-medium text-foreground mb-6">
          Story Album
        </h1>
        <p className="text-muted text-lg md:text-xl max-w-md mb-12">
          여행의 순간을 시네마틱한 앨범으로
          <br />
          만들고 공유하세요
        </p>
        <Link
          href="/create"
          className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white bg-foreground rounded-full hover:bg-foreground/90 transition-colors"
        >
          앨범 만들기
        </Link>
      </section>

      {/* Recent Albums Section */}
      {recentAlbums.length > 0 && (
        <section className="py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="album-title text-2xl md:text-3xl font-medium text-foreground mb-12 text-center">
              최근 앨범
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {recentAlbums.map((album) => (
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
      )}

      {/* Footer */}
      <footer className="py-12 px-6 text-center text-sm text-muted">
        <p>Story Album</p>
      </footer>
    </main>
  )
}
