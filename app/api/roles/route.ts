/**
 * GET /api/roles
 *
 * List all available target career roles with structured requirements.
 * Public endpoint (no auth required to browse available roles).
 */

import { NextResponse } from 'next/server'
import { getTargetRoles } from '@/services/roles'

export async function GET() {
  try {
    const roles = await getTargetRoles()
    return NextResponse.json({ roles }, { status: 200 })
  } catch (error) {
    console.error('[GET /api/roles]', error)
    return NextResponse.json({ error: 'Failed to retrieve target roles' }, { status: 500 })
  }
}
