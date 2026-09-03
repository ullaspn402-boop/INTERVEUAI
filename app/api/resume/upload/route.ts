/**
 * POST /api/resume/upload
 *
 * Upload an optional resume file (multipart/form-data or JSON base64 text payload).
 * Enforces 2MB size limit, extension restrictions (.pdf, .docx, .txt, .md),
 * user isolation (session.userId), and prompt injection defenses.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { processResumeUpload } from '@/services/resume'

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const contentType = request.headers.get('content-type') || ''

    let fileName = 'resume.txt'
    let fileBuffer: Buffer | null = null
    let mimeType = 'text/plain'

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      const file = formData.get('file') as File | null
      if (!file) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 })
      }

      fileName = file.name
      mimeType = file.type
      const arrayBuffer = await file.arrayBuffer()
      fileBuffer = Buffer.from(arrayBuffer)
    } else {
      let body: any
      try {
        body = await request.json()
      } catch {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
      }

      if (!body.text || typeof body.text !== 'string') {
        return NextResponse.json({ error: 'Resume text is required' }, { status: 400 })
      }

      fileName = body.fileName || 'resume.txt'
      fileBuffer = Buffer.from(body.text, 'utf-8')
    }

    const result = await processResumeUpload(session.userId, fileName, fileBuffer, mimeType)

    return NextResponse.json({ success: true, resume: result }, { status: 200 })
  } catch (error: any) {
    if (error.message === 'FILE_TOO_LARGE') {
      return NextResponse.json({ error: 'File size exceeds maximum 2MB limit' }, { status: 400 })
    }
    if (error.message === 'INVALID_FILE_TYPE') {
      return NextResponse.json({ error: 'Invalid file type. Supported formats: .pdf, .docx, .txt, .md' }, { status: 400 })
    }
    console.error('[POST /api/resume/upload]', error)
    return NextResponse.json({ error: 'Failed to upload and process resume' }, { status: 500 })
  }
}
