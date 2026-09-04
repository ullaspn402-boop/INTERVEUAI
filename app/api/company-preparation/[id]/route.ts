/**
 * GET   /api/company-preparation/[id] — Fetch plan details with user isolation
 * PATCH /api/company-preparation/[id] — Update plan status/stage
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { IdSchema, UpdateCompanyPlanSchema } from '@/lib/validation'
import { getCompanyPlanById, updateCompanyPlan } from '@/services/company-preparation'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const idParsed = IdSchema.safeParse(id)
    if (!idParsed.success) {
      return NextResponse.json({ error: 'Invalid plan ID' }, { status: 400 })
    }

    const plan = await getCompanyPlanById(session.userId, idParsed.data)
    if (!plan) {
      return NextResponse.json({ error: 'Preparation plan not found' }, { status: 404 })
    }

    return NextResponse.json({ plan })
  } catch (error) {
    console.error('Error fetching plan:', error)
    return NextResponse.json({ error: 'Failed to fetch preparation plan' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const idParsed = IdSchema.safeParse(id)
    if (!idParsed.success) {
      return NextResponse.json({ error: 'Invalid plan ID' }, { status: 400 })
    }

    const body = await request.json().catch(() => ({}))
    const parsed = UpdateCompanyPlanSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid update payload' }, { status: 400 })
    }

    const updated = await updateCompanyPlan(session.userId, idParsed.data, parsed.data)
    if (!updated) {
      return NextResponse.json({ error: 'Preparation plan not found' }, { status: 404 })
    }

    return NextResponse.json({ plan: updated })
  } catch (error) {
    console.error('Error updating plan:', error)
    return NextResponse.json({ error: 'Failed to update preparation plan' }, { status: 500 })
  }
}
