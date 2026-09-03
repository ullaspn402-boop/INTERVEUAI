/**
 * POST /api/share — Create a safe public shareable result link
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const CreateShareableSchema = z.object({
  type: z.enum(['READINESS', 'INTERVIEW', 'QUIZ']),
  title: z.string().trim().min(1).max(200),
  summary: z.string().trim().min(1).max(500),
  metrics: z.record(z.string(), z.unknown()),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const parsed = CreateShareableSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid share payload' }, { status: 400 })
    }

    const share = await db.shareableResult.create({
      data: {
        userId: session.userId,
        type: parsed.data.type,
        title: parsed.data.title,
        summary: parsed.data.summary,
        metrics: parsed.data.metrics as any,
      },
      select: {
        publicId: true,
        type: true,
        title: true,
        createdAt: true,
      },
    })

    return NextResponse.json({
      publicId: share.publicId,
      shareUrl: `/share/${share.publicId}`,
    })
  } catch (error) {
    console.error('[POST /api/share]', error)
    return NextResponse.json({ error: 'Failed to generate share link' }, { status: 500 })
  }
}
