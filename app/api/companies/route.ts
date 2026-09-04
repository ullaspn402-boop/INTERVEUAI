/**
 * GET /api/companies — List & search company catalog
 */

import { NextRequest, NextResponse } from 'next/server'
import { CompanyQuerySchema } from '@/lib/validation'
import { getCompanyCatalog } from '@/services/company-preparation'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const parsed = CompanyQuerySchema.safeParse({
      search: searchParams.get('search') || undefined,
      industry: searchParams.get('industry') || undefined,
      limit: searchParams.get('limit') || undefined,
    })

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid query parameters' }, { status: 400 })
    }

    const companies = await getCompanyCatalog(parsed.data)
    return NextResponse.json({ companies })
  } catch (error) {
    console.error('Error fetching companies:', error)
    return NextResponse.json({ error: 'Failed to fetch companies' }, { status: 500 })
  }
}
