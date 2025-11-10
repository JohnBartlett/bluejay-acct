import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// For now, using a default company ID - in production, get from auth session
const DEFAULT_COMPANY_ID = 'default-company-id'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    const where: any = {
      companyId: DEFAULT_COMPANY_ID,
    }

    if (status && status !== 'all') {
      where.status = status
    }

    if (search) {
      where.OR = [
        { invoiceNumber: { contains: search, mode: 'insensitive' } },
        { customer: { name: { contains: search, mode: 'insensitive' } } },
      ]
    }

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        customer: {
          select: {
            name: true,
            email: true,
          },
        },
        items: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(invoices)
  } catch (error) {
    console.error('Error fetching invoices:', error)
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      customerId,
      invoiceNumber,
      date,
      dueDate,
      items,
      notes,
      subtotal,
      tax,
      total,
    } = body

    // Generate invoice number if not provided
    let finalInvoiceNumber = invoiceNumber
    if (!finalInvoiceNumber) {
      const count = await prisma.invoice.count({
        where: { companyId: DEFAULT_COMPANY_ID },
      })
      finalInvoiceNumber = `INV-${String(count + 1).padStart(6, '0')}`
    }

    // Check if invoice number already exists
    const existing = await prisma.invoice.findUnique({
      where: { invoiceNumber: finalInvoiceNumber },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Invoice number already exists' },
        { status: 400 }
      )
    }

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber: finalInvoiceNumber,
        customerId,
        date: new Date(date),
        dueDate: dueDate ? new Date(dueDate) : null,
        status: 'DRAFT',
        subtotal: parseFloat(subtotal) || 0,
        tax: parseFloat(tax) || 0,
        total: parseFloat(total) || 0,
        notes: notes || null,
        companyId: DEFAULT_COMPANY_ID,
        items: {
          create: items.map((item: any) => ({
            type: item.type,
            description: item.description,
            longDescription: item.longDescription || null,
            date: item.date ? new Date(item.date) : null,
            hours: item.hours ? parseFloat(item.hours) : null,
            hourlyRate: item.hourlyRate ? parseFloat(item.hourlyRate) : null,
            quantity: item.quantity ? parseFloat(item.quantity) : null,
            unitPrice: parseFloat(item.unitPrice) || 0,
            amount: parseFloat(item.amount) || 0,
          })),
        },
      },
      include: {
        customer: true,
        items: true,
      },
    })

    return NextResponse.json(invoice)
  } catch (error) {
    console.error('Error creating invoice:', error)
    return NextResponse.json(
      { error: 'Failed to create invoice' },
      { status: 500 }
    )
  }
}

