import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

const DEFAULT_COMPANY_ID = 'default-company-id'

/**
 * GET /api/reports/[reportId]
 * Generates financial reports based on invoice data
 * Query params: start (ISO date), end (ISO date)
 * Report IDs: profit-loss, accounts-receivable, sales-by-customer, sales-by-type, tax-summary, invoice-summary
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ reportId: string }> }
) {
  try {
    const { reportId } = await params
    const searchParams = request.nextUrl.searchParams
    const startDate = searchParams.get('start')
    const endDate = searchParams.get('end')

    const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), 0, 1)
    const end = endDate ? new Date(endDate) : new Date()
    // Set end date to end of day
    end.setHours(23, 59, 59, 999)

    const where = {
      companyId: DEFAULT_COMPANY_ID,
      date: {
        gte: start,
        lte: end,
      },
    }

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        customer: true,
        items: true,
      },
      orderBy: {
        date: 'asc',
      },
    })

    switch (reportId) {
      case 'profit-loss':
        return NextResponse.json(generateProfitLossReport(invoices, start, end))
      case 'accounts-receivable':
        return NextResponse.json(generateAccountsReceivableReport(invoices))
      case 'sales-by-customer':
        return NextResponse.json(generateSalesByCustomerReport(invoices))
      case 'sales-by-type':
        return NextResponse.json(generateSalesByTypeReport(invoices))
      case 'tax-summary':
        return NextResponse.json(generateTaxSummaryReport(invoices))
      case 'invoice-summary':
        return NextResponse.json(generateInvoiceSummaryReport(invoices))
      default:
        return NextResponse.json({ error: 'Invalid report ID' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error generating report:', error)
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    )
  }
}

function generateProfitLossReport(invoices: any[], start: Date, end: Date) {
  const revenue = invoices
    .filter((inv) => inv.status === 'PAID')
    .reduce((sum, inv) => sum + (inv.total || 0), 0)

  // For now, expenses are 0 (no expense tracking yet)
  const expenses = 0
  const netIncome = revenue - expenses

  // Group by month
  const monthlyData: { [key: string]: { revenue: number; expenses: number; netIncome: number } } = {}
  
  invoices
    .filter((inv) => inv.status === 'PAID')
    .forEach((inv) => {
      const month = new Date(inv.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
      if (!monthlyData[month]) {
        monthlyData[month] = { revenue: 0, expenses: 0, netIncome: 0 }
      }
      monthlyData[month].revenue += inv.total || 0
      monthlyData[month].netIncome += inv.total || 0
    })

  const periods = Object.entries(monthlyData).map(([period, data]) => ({
    period,
    ...data,
  }))

  return {
    profitLoss: {
      revenue,
      expenses,
      netIncome,
      periods,
    },
  }
}

function generateAccountsReceivableReport(invoices: any[]) {
  const unpaidInvoices = invoices.filter(
    (inv) => inv.status !== 'PAID' && inv.status !== 'CANCELLED'
  )

  let current = 0
  let days30 = 0
  let days60 = 0
  let days90 = 0
  let over90 = 0

  const now = new Date()
  const agingDetails: { [key: string]: { customer: string; total: number; current: number; days30: number; days60: number; days90: number; over90: number } } = {}

  unpaidInvoices.forEach((inv) => {
    const dueDate = inv.dueDate ? new Date(inv.dueDate) : new Date(inv.date)
    const daysPastDue = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
    const amount = inv.total || 0

    const customerName = inv.customer?.name || 'Unknown'

    if (!agingDetails[customerName]) {
      agingDetails[customerName] = {
        customer: customerName,
        total: 0,
        current: 0,
        days30: 0,
        days60: 0,
        days90: 0,
        over90: 0,
      }
    }

    agingDetails[customerName].total += amount

    if (daysPastDue <= 0) {
      current += amount
      agingDetails[customerName].current += amount
    } else if (daysPastDue <= 30) {
      days30 += amount
      agingDetails[customerName].days30 += amount
    } else if (daysPastDue <= 60) {
      days60 += amount
      agingDetails[customerName].days60 += amount
    } else if (daysPastDue <= 90) {
      days90 += amount
      agingDetails[customerName].days90 += amount
    } else {
      over90 += amount
      agingDetails[customerName].over90 += amount
    }
  })

  return {
    accountsReceivable: {
      current,
      days30,
      days60,
      days90,
      over90,
      total: current + days30 + days60 + days90 + over90,
      agingDetails: Object.values(agingDetails),
    },
  }
}

function generateSalesByCustomerReport(invoices: any[]) {
  const paidInvoices = invoices.filter((inv) => inv.status === 'PAID')
  const customerData: { [key: string]: { customer: string; count: number; total: number } } = {}

  paidInvoices.forEach((inv) => {
    const customerName = inv.customer?.name || 'Unknown'
    if (!customerData[customerName]) {
      customerData[customerName] = {
        customer: customerName,
        count: 0,
        total: 0,
      }
    }
    customerData[customerName].count++
    customerData[customerName].total += inv.total || 0
  })

  return {
    salesByCustomer: Object.values(customerData).sort((a, b) => b.total - a.total),
  }
}

function generateSalesByTypeReport(invoices: any[]) {
  const paidInvoices = invoices.filter((inv) => inv.status === 'PAID')
  const typeData: { [key: string]: { type: string; count: number; total: number; hours: number } } = {
    TIME: { type: 'TIME', count: 0, total: 0, hours: 0 },
    SERVICE: { type: 'SERVICE', count: 0, total: 0, hours: 0 },
    PRODUCT: { type: 'PRODUCT', count: 0, total: 0, hours: 0 },
  }

  paidInvoices.forEach((inv) => {
    inv.items?.forEach((item: any) => {
      const type = item.type || 'UNKNOWN'
      if (!typeData[type]) {
        typeData[type] = { type, count: 0, total: 0, hours: 0 }
      }
      typeData[type].count++
      typeData[type].total += item.amount || 0
      if (item.type === 'TIME' && item.hours) {
        typeData[type].hours += item.hours
      }
    })
  })

  return {
    salesByType: Object.values(typeData).filter((item) => item.count > 0),
  }
}

function generateTaxSummaryReport(invoices: any[]) {
  const paidInvoices = invoices.filter((inv) => inv.status === 'PAID')
  let totalTax = 0
  const byState: { [key: string]: number } = {}
  const byType: { [key: string]: number } = {
    TIME: 0,
    SERVICE: 0,
    PRODUCT: 0,
  }

  paidInvoices.forEach((inv) => {
    const tax = inv.tax || 0
    totalTax += tax

    // Extract state from customer address if available
    const address = inv.customer?.address || ''
    const stateMatch = address.match(/\b([A-Z]{2})\s+\d{5}\b/)
    const state = stateMatch ? stateMatch[1] : 'Unknown'
    byState[state] = (byState[state] || 0) + tax

    // Tax by item type (simplified - assumes tax is distributed proportionally)
    inv.items?.forEach((item: any) => {
      const itemTax = (item.amount || 0) * (tax / (inv.subtotal || 1))
      byType[item.type] = (byType[item.type] || 0) + itemTax
    })
  })

  return {
    taxSummary: {
      totalTax,
      byState: Object.entries(byState).map(([state, tax]) => ({ state, tax })),
      byType: Object.entries(byType)
        .map(([type, tax]) => ({ type, tax }))
        .filter((item) => item.tax > 0),
    },
  }
}

function generateInvoiceSummaryReport(invoices: any[]) {
  const byStatus: { [key: string]: { status: string; count: number; total: number } } = {}
  const byMonth: { [key: string]: { month: string; count: number; total: number } } = {}

  invoices.forEach((inv) => {
    // By status
    const status = inv.status || 'UNKNOWN'
    if (!byStatus[status]) {
      byStatus[status] = { status, count: 0, total: 0 }
    }
    byStatus[status].count++
    byStatus[status].total += inv.total || 0

    // By month
    const month = new Date(inv.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
    if (!byMonth[month]) {
      byMonth[month] = { month, count: 0, total: 0 }
    }
    byMonth[month].count++
    byMonth[month].total += inv.total || 0
  })

  return {
    invoiceSummary: {
      total: invoices.length,
      byStatus: Object.values(byStatus),
      byMonth: Object.entries(byMonth)
        .map(([month, data]) => ({ ...data, month }))
        .sort((a, b) => {
          const dateA = new Date(a.month + ' 1, ' + a.month.split(' ')[1])
          const dateB = new Date(b.month + ' 1, ' + b.month.split(' ')[1])
          return dateA.getTime() - dateB.getTime()
        }),
    },
  }
}

