/**
 * GET & DELETE /api/resume
 *
 * GET: Retrieves the authenticated user's uploaded resume metadata (private, isolated).
 * DELETE: Removes the user's uploaded resume.
 */

import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { deleteUserResume, getUserResume } from '@/services/resume'

export async function GET() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const resume = await getUserResume(session.userId)
    return NextResponse.json({ resume }, { status: 200 })
  } catch (error) {
    console.error('[GET /api/resume]', error)
    return NextResponse.json({ error: 'Failed to retrieve resume' }, { status: 500 })
  }
}

export async function DELETE() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const deleted = await deleteUserResume(session.userId)
    return NextResponse.json({ success: true, deleted }, { status: 200 })
  } catch (error) {
    console.error('[DELETE /api/resume]', error)
    return NextResponse.json({ error: 'Failed to delete resume' }, { status: 500 })
  }
}
