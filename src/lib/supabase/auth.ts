import { supabase } from './client'

// Google 소셜 로그인
export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  })
  return { data, error }
}

// 로그아웃
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  return { error }
}

// 현재 사용자 가져오기
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// 현재 세션 가져오기
export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

// 인증 상태 변경 리스너
export function onAuthStateChange(callback: (user: any) => void) {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(session?.user ?? null)
  })
}
