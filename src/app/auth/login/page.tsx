'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signInWithGoogle, getCurrentUser } from '@/lib/supabase/auth'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)

  // 이미 로그인되어 있으면 리다이렉트
  useEffect(() => {
    async function checkUser() {
      const user = await getCurrentUser()
      if (user) {
        router.push('/my')
      } else {
        setChecking(false)
      }
    }
    checkUser()
  }, [router])

  const handleGoogleLogin = async () => {
    setLoading(true)
    const { error } = await signInWithGoogle()
    if (error) {
      console.error('Login error:', error)
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted">로딩 중...</div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-8">
        {/* 로고 */}
        <div className="text-center">
          <Link href="/" className="inline-block">
            <h1 className="album-title text-4xl font-medium text-foreground">
              Story Album
            </h1>
          </Link>
          <p className="mt-2 text-muted">
            로그인하고 내 앨범을 관리하세요
          </p>
        </div>

        {/* Google 로그인 버튼 */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          {loading ? (
            <span className="text-gray-600">로그인 중...</span>
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="text-gray-700 font-medium">Google로 계속하기</span>
            </>
          )}
        </button>

        {/* 비로그인 안내 */}
        <p className="text-center text-sm text-muted">
          로그인 없이도{' '}
          <Link href="/create" className="text-foreground hover:underline">
            앨범 만들기
          </Link>
          가 가능해요
        </p>
      </div>
    </main>
  )
}
