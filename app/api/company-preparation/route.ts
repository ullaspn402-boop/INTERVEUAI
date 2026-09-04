/**
 * GET  /api/company-preparation — List authenticated user's company preparation plans
 * POST /api/company-preparation — Create a personalized company preparation plan
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { CreateCompanyPlanSchema } from '@/lib/validation'
import { createCompanyPlan, getUserCompanyPlans } from '@/services/company-preparation'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const plans = await getUserCompanyPlans(session.userId)
    return NextResponse.json({ plans })
  } catch (error) {
    console.error('Error fetching company plans:', error)
    return NextResponse.json({ error: 'Failed to fetch preparation plans' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const parsed = CreateCompanyPlanSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid plan input', details: parsed.error.format() },
        { status: 400 }
      )
    }

    const plan = await createCompanyPlan(session.userId, parsed.data)
    return NextResponse.json({ plan }, { status: 201 })
  } catch (error) {
    console.error('Error creating company plan:', error)
    return NextResponse.json({ error: 'Failed to create company preparation plan' }, { status: 500 })
  }
}
