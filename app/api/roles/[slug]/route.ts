/**
 * GET /api/roles/[slug]
 *
 * Get single target career role details and structured requirements.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getRoleBySlug } from '@/services/roles'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  if (!slug?.trim()) {
    return NextResponse.json({ error: 'Role slug is required' }, { status: 400 })
  }

  try {
    const role = await getRoleBySlug(slug)
    if (!role) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 })
    }

    return NextResponse.json({ role }, { status: 200 })
  } catch (error) {
    console.error('[GET /api/roles/[slug]]', error)
    return NextResponse.json({ error: 'Failed to retrieve role details' }, { status: 500 })
  }
}
