import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Metadata } from 'next'
import { createServerClient } from '@/lib/supabase/server'
import AlbumRenderer from '@/components/album/AlbumRenderer'
import CopyLinkButton from './CopyLinkButton'
import type { Post } from '@/lib/types'

// 캐시 비활성화 - 항상 최신 데이터 가져오기
export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

async function getPost(id: string): Promise<Post | null> {
  try {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .eq('is_public', true)
      .single()

    if (error || !data) return null
    return data as Post
  } catch {
    return null
  }
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params
  const post = await getPost(id)

  if (!post) {
    return {
      title: '앨범을 찾을 수 없습니다',
    }
  }

  return {
    title: post.title ? `${post.title} | Story Album` : 'Story Album',
    description: '시네마틱한 여행 앨범',
    openGraph: {
      title: post.title || 'Story Album',
      description: '시네마틱한 여행 앨범',
      images: post.image_urls[0] ? [post.image_urls[0]] : [],
    },
  }
}

export default async function AlbumPage({ params }: PageProps) {
  const { id } = await params
  const post = await getPost(id)

  if (!post) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Album content */}
      <AlbumRenderer post={post} />

      {/* Footer section */}
      <footer className="py-20 px-6 text-center border-t border-gray-100">
        <div className="max-w-md mx-auto space-y-4">
          {/* Copy link & Decorate */}
          <div className="flex gap-3">
            <CopyLinkButton />
            <Link
              href={`/p/${id}/edit`}
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 bg-foreground text-white rounded-full hover:bg-foreground/90 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              꾸미기
            </Link>
          </div>

          {/* Create CTA */}
          <Link
            href="/create"
            className="inline-flex items-center justify-center w-full px-6 py-4 text-foreground border border-foreground/20 rounded-full hover:bg-foreground hover:text-white transition-colors"
          >
            나도 앨범 만들기
          </Link>

          {/* Branding */}
          <p className="text-sm text-muted pt-8">
            Made with{' '}
            <Link href="/" className="hover:text-foreground transition-colors">
              Story Album
            </Link>
          </p>
        </div>
      </footer>
    </main>
  )
}
