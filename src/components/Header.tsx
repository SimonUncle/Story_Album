'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getCurrentUser, signOut, onAuthStateChange } from '@/lib/supabase/auth'

export default function Header() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 초기 사용자 확인
    getCurrentUser().then((user) => {
      setUser(user)
      setLoading(false)
    })

    // 인증 상태 변경 리스너
    const { data: { subscription } } = onAuthStateChange((user) => {
      setUser(user)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await signOut()
    window.location.href = '/'
  }

  return (
    <header className="fixed top-0 left-0 right-0 bg-background/80 backdrop-blur-sm z-50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="album-title text-xl font-medium text-foreground">
          Story Album
        </Link>

        <nav className="flex items-center gap-4">
          {loading ? (
            <div className="w-20 h-8" />
          ) : user ? (
            <>
              <Link
                href="/my"
                className="text-sm text-muted hover:text-foreground transition-colors"
              >
                내 앨범
              </Link>
              <button
                onClick={handleSignOut}
                className="text-sm text-muted hover:text-foreground transition-colors"
              >
                로그아웃
              </button>
            </>
          ) : (
            <Link
              href="/auth/login"
              className="text-sm px-4 py-2 border border-foreground/20 rounded-full hover:bg-foreground hover:text-white transition-colors"
            >
              로그인
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
