import { NextResponse } from 'next/server'
import { getAllSubjects } from '@/services/subjects'

export async function GET() {
  try {
    const subjects = await getAllSubjects()
    return NextResponse.json({ subjects })
  } catch (error) {
    console.error('[GET /api/subjects]', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred while fetching subjects.' },
      { status: 500 }
    )
  }
}
