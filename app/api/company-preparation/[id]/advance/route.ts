/**
 * POST /api/company-preparation/[id]/advance — Advance current stage of preparation plan
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { IdSchema } from '@/lib/validation'
import { getCompanyPlanById, updateCompanyPlan } from '@/services/company-preparation'
import { z } from 'zod'

const AdvanceStageSchema = z.object({
  targetStage: z.coerce.number().int().min(1).max(12).optional(),
})

export async function POST(
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

    const existing = await getCompanyPlanById(session.userId, idParsed.data)
    if (!existing) {
      return NextResponse.json({ error: 'Preparation plan not found' }, { status: 404 })
    }

    const body = await request.json().catch(() => ({}))
    const parsed = AdvanceStageSchema.safeParse(body)
    const nextStage = parsed.success && parsed.data.targetStage ? parsed.data.targetStage : Math.min(12, existing.currentStage + 1)

    const updated = await updateCompanyPlan(session.userId, idParsed.data, { currentStage: nextStage })
    return NextResponse.json({ plan: updated })
  } catch (error) {
    console.error('Error advancing plan stage:', error)
    return NextResponse.json({ error: 'Failed to advance stage' }, { status: 500 })
  }
}
