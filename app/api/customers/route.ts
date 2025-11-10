import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

const DEFAULT_COMPANY_ID = 'default-company-id'

export async function GET(request: NextRequest) {
  try {
    const customers = await prisma.customer.findMany({
      where: {
        companyId: DEFAULT_COMPANY_ID,
      },
      orderBy: {
        name: 'asc',
      },
    })

    return NextResponse.json(customers)
  } catch (error) {
    console.error('Error fetching customers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, address, phone } = body

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'Customer name is required' },
        { status: 400 }
      )
    }

    const customer = await prisma.customer.create({
      data: {
        name: name.trim(),
        email: email?.trim() || null,
        address: address?.trim() || null,
        phone: phone?.trim() || null,
        companyId: DEFAULT_COMPANY_ID,
      },
    })

    return NextResponse.json(customer)
  } catch (error: any) {
    console.error('Error creating customer:', error)
    // Return more detailed error message
    const errorMessage = error?.message || 'Failed to create customer'
    return NextResponse.json(
      { error: errorMessage, details: error?.code },
      { status: 500 }
    )
  }
}

