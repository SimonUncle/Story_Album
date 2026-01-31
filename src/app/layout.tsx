import type { Metadata } from 'next'
import { Inter, Playfair_Display, Gowun_Dodum } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

// 손글씨 폰트 (자막용)
const gowunDodum = Gowun_Dodum({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-handwriting',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Story Album - 여행의 순간을 앨범으로',
  description: '최대 10장의 사진으로 시네마틱한 여행 앨범을 만들고 공유하세요.',
  openGraph: {
    title: 'Story Album',
    description: '최대 10장의 사진으로 시네마틱한 여행 앨범을 만들고 공유하세요.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" className={`${inter.variable} ${playfair.variable} ${gowunDodum.variable}`}>
      <body className="min-h-screen bg-background antialiased">
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#1A1A1A',
              color: '#FAFAFA',
              borderRadius: '12px',
            },
          }}
        />
      </body>
    </html>
  )
}
