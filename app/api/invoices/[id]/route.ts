import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        customer: true,
        company: true,
        items: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    })

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(invoice)
  } catch (error) {
    console.error('Error fetching invoice:', error)
    return NextResponse.json(
      { error: 'Failed to fetch invoice' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status, items, subtotal, tax, total, notes } = body

    const updateData: any = {}
    if (status) updateData.status = status
    if (notes !== undefined) updateData.notes = notes
    if (subtotal !== undefined) updateData.subtotal = parseFloat(subtotal)
    if (tax !== undefined) updateData.tax = parseFloat(tax)
    if (total !== undefined) updateData.total = parseFloat(total)

    // If items are provided, update them
    // Use a transaction to ensure atomicity - if item creation fails, items aren't deleted
    if (items && Array.isArray(items)) {
      // Validate all items first before deleting anything
      const parseFloatSafe = (value: any): number | null => {
        if (value === null || value === undefined || value === '') return null
        const parsed = parseFloat(String(value))
        return isNaN(parsed) ? null : parsed
      }

      const parseDateSafe = (value: any): Date | null => {
        if (!value || value === '') return null
        try {
          const date = new Date(value)
          return isNaN(date.getTime()) ? null : date
        } catch {
          return null
        }
      }

      const itemsToCreate = items.map((item: any) => {
        // Validate required fields
        if (!item.type || !item.description) {
          throw new Error(`Invalid item: missing type or description`)
        }

        return {
          invoiceId: id,
          type: item.type,
          description: item.description || '',
          longDescription: item.longDescription || null,
          date: parseDateSafe(item.date),
          hours: parseFloatSafe(item.hours),
          hourlyRate: parseFloatSafe(item.hourlyRate),
          quantity: parseFloatSafe(item.quantity),
          unitPrice: parseFloatSafe(item.unitPrice) ?? 0,
          amount: parseFloatSafe(item.amount) ?? 0,
        }
      })

      // Use a transaction to ensure atomicity
      await prisma.$transaction(async (tx) => {
        // Delete existing items
        await tx.invoiceItem.deleteMany({
          where: { invoiceId: id },
        })

        // Create new items (only if there are items to create)
        if (itemsToCreate.length > 0) {
          await tx.invoiceItem.createMany({
            data: itemsToCreate,
          })
        }
      })
    }

    const invoice = await prisma.invoice.update({
      where: { id },
      data: updateData,
      include: {
        customer: true,
        company: true,
        items: true,
      },
    })

    return NextResponse.json(invoice)
  } catch (error) {
    console.error('Error updating invoice:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Failed to update invoice', details: errorMessage },
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
    await prisma.invoice.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting invoice:', error)
    return NextResponse.json(
      { error: 'Failed to delete invoice' },
      { status: 500 }
    )
  }
}

