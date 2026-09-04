/**
 * GET /api/companies/[slug] — Fetch company profile & requirements by slug
 */

import { NextRequest, NextResponse } from 'next/server'
import { IdSchema } from '@/lib/validation'
import { getCompanyBySlug } from '@/services/company-preparation'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const slugParsed = IdSchema.safeParse(slug)
    if (!slugParsed.success) {
      return NextResponse.json({ error: 'Invalid company slug' }, { status: 400 })
    }

    const company = await getCompanyBySlug(slugParsed.data)
    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    return NextResponse.json({ company })
  } catch (error) {
    console.error('Error fetching company:', error)
    return NextResponse.json({ error: 'Failed to fetch company profile' }, { status: 500 })
  }
}
