/**
 * GET /api/share/[publicId]
 *
 * Public unauthenticated route returning sanitized shareable result metrics.
 * Zero user emails, transcripts, or secrets exposed.
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ publicId: string }> }
) {
  try {
    const { publicId } = await params
    if (!publicId || publicId.length > 128) {
      return NextResponse.json({ error: 'Invalid share ID' }, { status: 400 })
    }

    const share = await db.shareableResult.findUnique({
      where: { publicId },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
    })

    if (!share) {
      return NextResponse.json({ error: 'Shared result not found' }, { status: 404 })
    }

    const userFirstName = share.user.name.split(' ')[0]

    return NextResponse.json({
      publicId: share.publicId,
      type: share.type,
      title: share.title,
      summary: share.summary,
      metrics: share.metrics,
      author: `${userFirstName}`,
      createdAt: share.createdAt.toISOString(),
    })
  } catch (error) {
    console.error('[GET /api/share/[publicId]]', error)
    return NextResponse.json({ error: 'Failed to fetch shared result' }, { status: 500 })
  }
}
