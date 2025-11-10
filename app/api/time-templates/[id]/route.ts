import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { description, hourlyRate } = body

    if (!description) {
      return NextResponse.json(
        { error: 'Description is required' },
        { status: 400 }
      )
    }

    const template = await prisma.timeEntryTemplate.update({
      where: { id },
      data: {
        description,
        hourlyRate: hourlyRate ? parseFloat(String(hourlyRate)) : null,
      },
    })

    return NextResponse.json(template)
  } catch (error) {
    console.error('Error updating time template:', error)
    return NextResponse.json(
      { error: 'Failed to update time template' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.timeEntryTemplate.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting time template:', error)
    return NextResponse.json(
      { error: 'Failed to delete time template' },
      { status: 500 }
    )
  }
}

