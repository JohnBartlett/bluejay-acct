'use client'

import { useState, useEffect } from 'react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { Version } from '@/components/Version'

// Dummy data
const dummyCashFlowData = [
  { month: 'Jan', inflow: 2000, outflow: 1500, net: 500 },
  { month: 'Feb', inflow: 3000, outflow: 2000, net: 1000 },
  { month: 'Mar', inflow: 2500, outflow: 1800, net: 700 },
  { month: 'Apr', inflow: 4000, outflow: 2200, net: 1800 },
  { month: 'May', inflow: 3500, outflow: 2000, net: 1500 },
  { month: 'Jun', inflow: 3000, outflow: 2500, net: 500 },
  { month: 'Jul', inflow: 3200, outflow: 2100, net: 1100 },
  { month: 'Aug', inflow: 2800, outflow: 1900, net: 900 },
  { month: 'Sep', inflow: 3600, outflow: 2300, net: 1300 },
  { month: 'Oct', inflow: 3100, outflow: 2000, net: 1100 },
  { month: 'Nov', inflow: 2900, outflow: 1800, net: 1100 },
]

const dummyProfitLossData = [
  { month: 'Jan', income: 2000, expenses: 1500 },
  { month: 'Feb', income: 3000, expenses: 2000 },
  { month: 'Mar', income: 2500, expenses: 1800 },
  { month: 'Apr', income: 4000, expenses: 2200 },
  { month: 'May', income: 3500, expenses: 2000 },
  { month: 'Jun', income: 3000, expenses: 2500 },
  { month: 'Jul', income: 3200, expenses: 2100 },
  { month: 'Aug', income: 2800, expenses: 1900 },
  { month: 'Sep', income: 3600, expenses: 2300 },
  { month: 'Oct', income: 3100, expenses: 2000 },
  { month: 'Nov', income: 2900, expenses: 1800 },
]

const dummyExpenseData = [
  { name: 'Merchant Account', value: 100 },
]

const dummyOverdueInvoices = [
  { name: 'John Willis', amount: 2444.68, overdue: '1 month ago' },
  { name: 'Catharine Hamilton', amount: 2195.00, overdue: '1 month ago' },
  { name: 'John Willis', amount: 2027.03, overdue: '2 months ago' },
]

const dummyPayableData = {
  comingDue: 0,
  overdue1to30: 0,
  overdue31to60: 2444.68,
  overdue61to90: 2027.03,
  overdue90plus: 2195.00,
}

const dummyNetIncome = {
  previous: { income: 32598.89, expenses: 458.73, net: 32140.16 },
  current: { income: 11042.50, expenses: 45.57, net: 10996.93 },
}

const COLORS = ['#8b5cf6', '#6366f1', '#ec4899', '#f59e0b', '#10b981']

export default function Dashboard() {
  const [timeRange, setTimeRange] = useState('12months')
  const [useDummyData, setUseDummyData] = useState(true)
  const [realStats, setRealStats] = useState<any>(null)
  const [realInvoices, setRealInvoices] = useState<any[]>([])

  useEffect(() => {
    if (!useDummyData) {
      // Fetch real data
      Promise.all([
        fetch('/api/dashboard/stats').then(r => r.json()),
        fetch('/api/invoices').then(r => r.json()),
      ]).then(([stats, invoices]) => {
        setRealStats(stats)
        setRealInvoices(invoices)
      }).catch(err => {
        console.error('Error fetching real data:', err)
        setUseDummyData(true) // Fallback to dummy data on error
      })
    }
  }, [useDummyData])

  // Helper function to calculate days overdue
  const getDaysOverdue = (dueDate: string | null): number => {
    if (!dueDate) return 0
    const due = new Date(dueDate)
    const now = new Date()
    const diffTime = now.getTime() - due.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
  }

  // Helper function to format overdue time
  const formatOverdueTime = (days: number): string => {
    if (days === 0) return 'Due today'
    if (days < 30) return `${days} day${days > 1 ? 's' : ''} overdue`
    const months = Math.floor(days / 30)
    const remainingDays = days % 30
    if (months === 1 && remainingDays === 0) return '1 month ago'
    if (remainingDays === 0) return `${months} months ago`
    return `${months} month${months > 1 ? 's' : ''} ${remainingDays} day${remainingDays > 1 ? 's' : ''} ago`
  }

  // Calculate cash flow data from real invoices
  const calculateCashFlowData = (invoices: any[], months: number = 12) => {
    const now = new Date()
    const monthData: { [key: string]: { inflow: number; outflow: number } } = {}
    
    // Initialize months
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthKey = date.toLocaleDateString('en-US', { month: 'short' })
      monthData[monthKey] = { inflow: 0, outflow: 0 }
    }

    // Process invoices
    invoices.forEach((inv) => {
      const invoiceDate = new Date(inv.date)
      const monthKey = invoiceDate.toLocaleDateString('en-US', { month: 'short' })
      
      if (monthData[monthKey]) {
        if (inv.status === 'PAID') {
          monthData[monthKey].inflow += inv.total || 0
        }
        // Outflow: credit card fees (if any)
        if (inv.creditCardFee) {
          monthData[monthKey].outflow += inv.creditCardFee
        }
      }
    })

    return Object.entries(monthData).map(([month, data]) => ({
      month,
      inflow: data.inflow,
      outflow: data.outflow,
      net: data.inflow - data.outflow,
    }))
  }

  // Calculate profit and loss data from real invoices
  const calculateProfitLossData = (invoices: any[], months: number = 12) => {
    const now = new Date()
    const monthData: { [key: string]: { income: number; expenses: number } } = {}
    
    // Initialize months
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthKey = date.toLocaleDateString('en-US', { month: 'short' })
      monthData[monthKey] = { income: 0, expenses: 0 }
    }

    // Process invoices
    invoices.forEach((inv) => {
      const invoiceDate = new Date(inv.date)
      const monthKey = invoiceDate.toLocaleDateString('en-US', { month: 'short' })
      
      if (monthData[monthKey]) {
        // Income: all invoices (not just PAID, as they represent revenue)
        monthData[monthKey].income += inv.subtotal || 0
        
        // Expenses: taxes and credit card fees
        if (inv.tax) {
          monthData[monthKey].expenses += inv.tax
        }
        if (inv.creditCardFee) {
          monthData[monthKey].expenses += inv.creditCardFee
        }
      }
    })

    return Object.entries(monthData).map(([month, data]) => ({
      month,
      income: data.income,
      expenses: data.expenses,
    }))
  }

  // Calculate expense breakdown from real invoices
  const calculateExpenseData = (invoices: any[]) => {
    const expenses: { [key: string]: number } = {}
    
    invoices.forEach((inv) => {
      if (inv.tax && inv.tax > 0) {
        expenses['Taxes'] = (expenses['Taxes'] || 0) + inv.tax
      }
      if (inv.creditCardFee && inv.creditCardFee > 0) {
        expenses['Credit Card Fees'] = (expenses['Credit Card Fees'] || 0) + inv.creditCardFee
      }
    })

    return Object.entries(expenses).map(([name, value]) => ({ name, value }))
  }

  // Calculate overdue invoices with proper time formatting
  const calculateOverdueInvoices = (invoices: any[]) => {
    return invoices
      .filter((inv) => {
        if (inv.status === 'OVERDUE') return true
        if (inv.dueDate && inv.status !== 'PAID' && inv.status !== 'CANCELLED') {
          const daysOverdue = getDaysOverdue(inv.dueDate)
          return daysOverdue > 0
        }
        return false
      })
      .map((inv) => {
        const daysOverdue = getDaysOverdue(inv.dueDate)
        return {
          name: inv.customer?.name || 'Unknown',
          amount: inv.total || 0,
          overdue: formatOverdueTime(daysOverdue),
          daysOverdue,
        }
      })
      .sort((a, b) => b.daysOverdue - a.daysOverdue)
  }

  // Calculate payable data from real invoices
  const calculatePayableData = (invoices: any[]) => {
    const now = new Date()
    const data = {
      comingDue: 0,
      overdue1to30: 0,
      overdue31to60: 0,
      overdue61to90: 0,
      overdue90plus: 0,
    }

    invoices
      .filter((inv) => inv.status !== 'PAID' && inv.status !== 'CANCELLED')
      .forEach((inv) => {
        if (!inv.dueDate) {
          data.comingDue += inv.total || 0
          return
        }

        const daysOverdue = getDaysOverdue(inv.dueDate)
        const amount = inv.total || 0

        if (daysOverdue <= 0) {
          data.comingDue += amount
        } else if (daysOverdue <= 30) {
          data.overdue1to30 += amount
        } else if (daysOverdue <= 60) {
          data.overdue31to60 += amount
        } else if (daysOverdue <= 90) {
          data.overdue61to90 += amount
        } else {
          data.overdue90plus += amount
        }
      })

    return data
  }

  // Calculate net income by fiscal year
  const calculateNetIncome = (invoices: any[]) => {
    const now = new Date()
    const currentYear = now.getFullYear()
    const previousYear = currentYear - 1

    const calculateYearData = (year: number) => {
      let income = 0
      let expenses = 0

      invoices.forEach((inv) => {
        const invoiceDate = new Date(inv.date)
        if (invoiceDate.getFullYear() === year) {
          income += inv.subtotal || 0
          if (inv.tax) expenses += inv.tax
          if (inv.creditCardFee) expenses += inv.creditCardFee
        }
      })

      return {
        income,
        expenses,
        net: income - expenses,
      }
    }

    return {
      previous: calculateYearData(previousYear),
      current: calculateYearData(currentYear),
    }
  }

  // Determine months to show based on timeRange
  const getMonthsCount = () => {
    switch (timeRange) {
      case '3months': return 3
      case '6months': return 6
      case '12months': return 12
      default: return 12
    }
  }

  // Use real or dummy data based on switch
  const monthsCount = getMonthsCount()
  const cashFlowData = useDummyData 
    ? dummyCashFlowData 
    : calculateCashFlowData(realInvoices, monthsCount)
  
  const profitLossData = useDummyData 
    ? dummyProfitLossData 
    : calculateProfitLossData(realInvoices, monthsCount)
  
  const expenseData = useDummyData 
    ? dummyExpenseData 
    : (calculateExpenseData(realInvoices).length > 0 
        ? calculateExpenseData(realInvoices) 
        : [{ name: 'No expenses', value: 0 }])
  
  const overdueInvoices = useDummyData 
    ? dummyOverdueInvoices 
    : calculateOverdueInvoices(realInvoices)
  
  const payableData = useDummyData 
    ? dummyPayableData 
    : calculatePayableData(realInvoices)
  
  const netIncome = useDummyData 
    ? dummyNetIncome 
    : calculateNetIncome(realInvoices)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={useDummyData}
              onChange={(e) => setUseDummyData(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Use Dummy Data</span>
          </label>
          <Version />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Overdue Invoices */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Overdue invoices and bills
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Overdue invoices ({overdueInvoices.length})
              </h3>
              <div className="space-y-2">
                {overdueInvoices.length > 0 ? (
                  overdueInvoices.map((invoice, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-red-50 rounded">
                      <div>
                        <p className="font-medium text-gray-900">{invoice.name}</p>
                        <p className="text-sm text-gray-500">{invoice.overdue}</p>
                      </div>
                      <p className="font-semibold text-gray-900">${invoice.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No overdue invoices</p>
                )}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Overdue bills
              </h3>
              <p className="text-sm text-gray-500">
                You don't have any overdue bills. Nice!
              </p>
            </div>
          </div>
        </div>

        {/* Cash Flow */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Cash Flow</h2>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              <option value="12months">Last 12 months</option>
              <option value="6months">Last 6 months</option>
              <option value="3months">Last 3 months</option>
            </select>
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Inflow</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Outflow</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-600"></div>
              <span className="text-sm text-gray-600">Net change</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={cashFlowData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="inflow"
                stroke="#10b981"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="outflow"
                stroke="#ef4444"
                strokeWidth={2}
              />
              <Bar dataKey="net" fill="#10b981" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Profit and Loss */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Profit and Loss
            </h2>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              <option value="12months">Last 12 months</option>
              <option value="6months">Last 6 months</option>
              <option value="3months">Last 3 months</option>
            </select>
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500"></div>
              <span className="text-sm text-gray-600">Income</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500"></div>
              <span className="text-sm text-gray-600">Expenses</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={profitLossData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="income" fill="#10b981" />
              <Bar dataKey="expenses" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Expenses Breakdown */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Expenses Breakdown
            </h2>
            <select className="text-sm border border-gray-300 rounded px-2 py-1">
              <option>Year to date</option>
              <option>Last 12 months</option>
              <option>Last 6 months</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={expenseData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {expenseData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Net Income */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Net Income
          </h2>
          <p className="text-sm text-gray-600 mb-4">Comparison by fiscal year</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={[{ name: 'Previous', value: netIncome.previous.net }, { name: 'Current', value: netIncome.current.net }]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Income</span>
              <div className="flex gap-8">
                <span className="text-gray-900">${netIncome.previous.income.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                <span className="text-gray-900">${netIncome.current.income.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Expenses</span>
              <div className="flex gap-8">
                <span className="text-gray-900">${netIncome.previous.expenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                <span className="text-gray-900">${netIncome.current.expenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
            <div className="flex justify-between text-sm font-semibold pt-2 border-t">
              <span className="text-gray-900">Net Income</span>
              <div className="flex gap-8">
                <span className="text-gray-900">${netIncome.previous.net.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                <span className="text-gray-900">${netIncome.current.net.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payable and Owing */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Payable and owing
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Invoices payable to you
              </h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Coming due</span>
                  <span className="text-gray-900">${payableData.comingDue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">1-30 days overdue</span>
                  <span className="text-gray-900">${payableData.overdue1to30.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">31-60 days overdue</span>
                  <span className="text-gray-900">${payableData.overdue31to60.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">61-90 days overdue</span>
                  <span className="text-gray-900">${payableData.overdue61to90.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">&gt; 90 days overdue</span>
                  <span className="text-gray-900">${payableData.overdue90plus.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Bills you owe
              </h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Coming due</span>
                  <span className="text-gray-900">$0.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">1-30 days overdue</span>
                  <span className="text-gray-900">$0.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">31-60 days overdue</span>
                  <span className="text-gray-900">$0.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">61-90 days overdue</span>
                  <span className="text-gray-900">$0.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">&gt; 90 days overdue</span>
                  <span className="text-gray-900">$0.00</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

