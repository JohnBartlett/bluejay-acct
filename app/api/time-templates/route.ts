import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

const DEFAULT_COMPANY_ID = 'default-company-id'

export async function GET() {
  try {
    const templates = await prisma.timeEntryTemplate.findMany({
      where: { companyId: DEFAULT_COMPANY_ID },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(templates)
  } catch (error) {
    console.error('Error fetching time templates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch time templates' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { description, hourlyRate } = body

    if (!description) {
      return NextResponse.json(
        { error: 'Description is required' },
        { status: 400 }
      )
    }

    const template = await prisma.timeEntryTemplate.create({
      data: {
        description,
        hourlyRate: hourlyRate ? parseFloat(String(hourlyRate)) : null,
        companyId: DEFAULT_COMPANY_ID,
      },
    })

    return NextResponse.json(template)
  } catch (error) {
    console.error('Error creating time template:', error)
    return NextResponse.json(
      { error: 'Failed to create time template' },
      { status: 500 }
    )
  }
}

