/**
 * GET & POST /api/user/target-role
 *
 * GET: Retrieve the authenticated user's current target role details.
 * POST: Update the authenticated user's target role (retains all historical progress).
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { getRoleBySlug, setUserTargetRole } from '@/services/roles'
import { z } from 'zod'

const TargetRoleInputSchema = z.object({
  roleSlug: z.string().trim().min(1, 'Role slug is required'),
})

export async function GET() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const user = await db.user.findUnique({
      where: { id: session.userId },
      select: { targetRole: true },
    })

    const roleSlug = user?.targetRole || 'software-engineer'
    const role = await getRoleBySlug(roleSlug)

    return NextResponse.json({ targetRole: roleSlug, role }, { status: 200 })
  } catch (error) {
    console.error('[GET /api/user/target-role]', error)
    return NextResponse.json({ error: 'Failed to retrieve target role' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
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

  const parsed = TargetRoleInputSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation error', issues: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  try {
    const updatedRole = await setUserTargetRole(session.userId, parsed.data.roleSlug)

    // Create activity record for changing target role
    await db.activity.create({
      data: {
        userId: session.userId,
        type: 'SUBJECT_STARTED',
        title: `Selected Target Role: ${updatedRole.name}`,
        description: `Set target role to ${updatedRole.name}`,
      },
    }).catch(() => {})

    return NextResponse.json({ success: true, targetRole: updatedRole.slug, role: updatedRole }, { status: 200 })
  } catch (error: any) {
    if (error.message === 'ROLE_NOT_FOUND') {
      return NextResponse.json({ error: 'Target role not found' }, { status: 404 })
    }
    console.error('[POST /api/user/target-role]', error)
    return NextResponse.json({ error: 'Failed to update target role' }, { status: 500 })
  }
}
