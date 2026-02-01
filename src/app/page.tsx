import Link from 'next/link'
import Header from '@/components/Header'
import RecentAlbums from '@/components/RecentAlbums'

export default function Home() {

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

      {/* Recent Albums Section - 로그인 시 내 앨범, 비로그인 시 공개 앨범 */}
      <RecentAlbums />

      {/* Footer */}
      <footer className="py-12 px-6 text-center text-sm text-muted">
        <p>Story Album</p>
      </footer>
    </main>
  )
}
