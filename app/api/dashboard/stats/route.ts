import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

const DEFAULT_COMPANY_ID = 'default-company-id'

export async function GET() {
  try {
    const invoices = await prisma.invoice.findMany({
      where: {
        companyId: DEFAULT_COMPANY_ID,
      },
      include: {
        items: true,
      },
    })

    const totalRevenue = invoices
      .filter((inv) => inv.status === 'PAID')
      .reduce((sum, inv) => sum + inv.total, 0)

    const overdueInvoices = invoices.filter(
      (inv) => inv.status === 'OVERDUE'
    ).length

    const totalInvoices = invoices.length

    const stats = {
      totalRevenue,
      overdueInvoices,
      totalInvoices,
      paidInvoices: invoices.filter((inv) => inv.status === 'PAID').length,
      draftInvoices: invoices.filter((inv) => inv.status === 'DRAFT').length,
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    )
  }
}

