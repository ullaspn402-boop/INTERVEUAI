import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://intervue.ai'

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/login', '/register', '/privacy', '/terms', '/share/'],
        disallow: ['/api/', '/dashboard', '/preparation', '/tutor', '/quizzes', '/coding', '/interview', '/gd', '/company-prep', '/role-prep', '/analytics', '/profile'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
