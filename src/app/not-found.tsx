import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <h1 className="album-title text-6xl font-medium text-foreground mb-4">
        404
      </h1>
      <p className="text-lg text-muted mb-8">
        찾으시는 앨범이 없습니다
      </p>
      <Link
        href="/"
        className="inline-flex items-center justify-center px-6 py-3 text-foreground border border-foreground/20 rounded-full hover:bg-foreground hover:text-white transition-colors"
      >
        홈으로 돌아가기
      </Link>
    </main>
  )
}
