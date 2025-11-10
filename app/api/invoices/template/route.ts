import { NextRequest, NextResponse } from 'next/server'

// Simple template storage - in production, store in database
let savedTemplate: any = null

export async function GET() {
  return NextResponse.json(savedTemplate || { fields: [] })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    savedTemplate = body
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving template:', error)
    return NextResponse.json(
      { error: 'Failed to save template' },
      { status: 500 }
    )
  }
}

