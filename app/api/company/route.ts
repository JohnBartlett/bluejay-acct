import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

const DEFAULT_COMPANY_ID = 'default-company-id'

export async function GET() {
  try {
    let company = await prisma.company.findUnique({
      where: { id: DEFAULT_COMPANY_ID },
    })

    // Create default company if it doesn't exist
    if (!company) {
      company = await prisma.company.create({
        data: {
          id: DEFAULT_COMPANY_ID,
          name: 'My Company',
          currency: 'USD',
          fiscalYearEnd: 'December 31',
        },
      })
    }

    return NextResponse.json(company)
  } catch (error) {
    console.error('Error fetching company:', error)
    return NextResponse.json(
      { error: 'Failed to fetch company' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, address, email, phone, fiscalYearEnd, currency, defaultHourlyRate } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Company name is required' },
        { status: 400 }
      )
    }

    let company = await prisma.company.findUnique({
      where: { id: DEFAULT_COMPANY_ID },
    })

    if (company) {
      company = await prisma.company.update({
        where: { id: DEFAULT_COMPANY_ID },
        data: {
          name,
          address: address || null,
          email: email || null,
          phone: phone || null,
          fiscalYearEnd: fiscalYearEnd || 'December 31',
          currency: currency || 'USD',
          defaultHourlyRate: defaultHourlyRate ? parseFloat(String(defaultHourlyRate)) : null,
        },
      })
    } else {
      company = await prisma.company.create({
        data: {
          id: DEFAULT_COMPANY_ID,
          name,
          address: address || null,
          email: email || null,
          phone: phone || null,
          fiscalYearEnd: fiscalYearEnd || 'December 31',
          currency: currency || 'USD',
          defaultHourlyRate: defaultHourlyRate ? parseFloat(String(defaultHourlyRate)) : null,
        },
      })
    }

    return NextResponse.json(company)
  } catch (error) {
    console.error('Error updating company:', error)
    return NextResponse.json(
      { error: 'Failed to update company' },
      { status: 500 }
    )
  }
}

