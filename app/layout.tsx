import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://intervue.ai'

export const metadata: Metadata = {
  title: 'INTERVUE AI — AI Mock Interview & Technical Placement Preparation Platform',
  description:
    'Master technical and behavioral interviews with real-time AI feedback, timed DSA quizzes, interactive coding practice, and personalized learning paths.',
  keywords: [
    'AI mock interview',
    'AI interview practice',
    'coding interview preparation',
    'technical interview preparation',
    'placement preparation',
    'DSA practice',
    'system design interview',
    'behavioral interview AI',
  ],
  authors: [{ name: 'INTERVUE AI Team' }],
  metadataBase: new URL(baseUrl),
  openGraph: {
    title: 'INTERVUE AI — AI Mock Interview & Technical Placement Preparation',
    description:
      'Practice technical and behavioral mock interviews with instant AI evaluation across relevance, correctness, clarity, and depth.',
    url: baseUrl,
    siteName: 'INTERVUE AI',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'INTERVUE AI — Master Technical Interviews with AI',
    description:
      'Real-time AI mock interviews, DSA coding problems, and personalized readiness tracking for campus and tech industry placements.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: '#f7f8fc',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="bg-background">
      <body className="antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
