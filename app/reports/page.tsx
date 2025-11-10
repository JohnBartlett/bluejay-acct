'use client'

import { useState, useEffect } from 'react'
import { BarChart3, Download, FileText, DollarSign, Users, TrendingUp, Calendar } from 'lucide-react'
import { Version } from '@/components/Version'
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

interface ReportData {
  profitLoss?: {
    revenue: number
    expenses: number
    netIncome: number
    periods: Array<{ period: string; revenue: number; expenses: number; netIncome: number }>
  }
  accountsReceivable?: {
    current: number
    days30: number
    days60: number
    days90: number
    over90: number
    total: number
    agingDetails: Array<{ customer: string; total: number; current: number; days30: number; days60: number; days90: number; over90: number }>
  }
  salesByCustomer?: Array<{ customer: string; count: number; total: number }>
  salesByType?: Array<{ type: string; count: number; total: number; hours?: number }>
  taxSummary?: {
    totalTax: number
    byState: Array<{ state: string; tax: number }>
    byType: Array<{ type: string; tax: number }>
  }
  invoiceSummary?: {
    total: number
    byStatus: Array<{ status: string; count: number; total: number }>
    byMonth: Array<{ month: string; count: number; total: number }>
  }
}

const COLORS = ['#8b5cf6', '#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6']

export default function ReportsPage() {
  const [activeReport, setActiveReport] = useState<string | null>(null)
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(false)
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0], // Start of year
    end: new Date().toISOString().split('T')[0], // Today
  })

  const reports = [
    {
      id: 'profit-loss',
      title: 'Profit & Loss',
      description: 'Revenue, expenses, and net income over time',
      icon: TrendingUp,
      color: 'bg-green-500',
    },
    {
      id: 'accounts-receivable',
      title: 'Accounts Receivable Aging',
      description: 'Outstanding invoices by aging period',
      icon: DollarSign,
      color: 'bg-blue-500',
    },
    {
      id: 'sales-by-customer',
      title: 'Sales by Customer',
      description: 'Total sales and invoice count per customer',
      icon: Users,
      color: 'bg-purple-500',
    },
    {
      id: 'sales-by-type',
      title: 'Sales by Type',
      description: 'Revenue breakdown by TIME, SERVICE, and PRODUCT',
      icon: BarChart3,
      color: 'bg-orange-500',
    },
    {
      id: 'tax-summary',
      title: 'Tax Summary',
      description: 'Total taxes collected by state and type',
      icon: FileText,
      color: 'bg-red-500',
    },
    {
      id: 'invoice-summary',
      title: 'Invoice Summary',
      description: 'Invoice statistics by status and month',
      icon: Calendar,
      color: 'bg-indigo-500',
    },
  ]

  const fetchReport = async (reportId: string) => {
    setLoading(true)
    try {
      const response = await fetch(
        `/api/reports/${reportId}?start=${dateRange.start}&end=${dateRange.end}`
      )
      if (response.ok) {
        const data = await response.json()
        setReportData(data)
        setActiveReport(reportId)
      } else {
        alert('Failed to load report')
      }
    } catch (error) {
      console.error('Error fetching report:', error)
      alert('Failed to load report')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const exportReport = () => {
    if (!reportData || !activeReport) return
    
    const report = reports.find((r) => r.id === activeReport)
    const filename = `${report?.title.replace(/\s+/g, '-')}-${dateRange.start}-to-${dateRange.end}.json`
    
    const dataStr = JSON.stringify(reportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-gray-700" />
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
        </div>
        <Version />
      </div>

      {/* Date Range Selector */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Date Range:</label>
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
          <span className="text-gray-500">to</span>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
          {activeReport && (
            <button
              onClick={() => fetchReport(activeReport)}
              className="ml-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              Refresh
            </button>
          )}
        </div>
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reports.map((report) => {
          const Icon = report.icon
          return (
            <button
              key={report.id}
              onClick={() => fetchReport(report.id)}
              disabled={loading}
              className={`bg-white rounded-lg shadow-sm border-2 p-6 text-left hover:border-blue-500 transition-colors ${
                activeReport === report.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`${report.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                {activeReport === report.id && (
                  <Download
                    className="w-5 h-5 text-blue-600"
                    onClick={(e) => {
                      e.stopPropagation()
                      exportReport()
                    }}
                  />
                )}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{report.title}</h3>
              <p className="text-sm text-gray-600">{report.description}</p>
            </button>
          )
        })}
      </div>

      {/* Report Display */}
      {loading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <p className="text-gray-500">Loading report...</p>
        </div>
      )}

      {!loading && activeReport && reportData && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {reports.find((r) => r.id === activeReport)?.title}
            </h2>
            <button
              onClick={exportReport}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export Report
            </button>
          </div>

          {/* Profit & Loss Report */}
          {activeReport === 'profit-loss' && reportData.profitLoss && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <p className="text-sm text-green-700 font-medium mb-1">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-900">
                    {formatCurrency(reportData.profitLoss.revenue)}
                  </p>
                </div>
                <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                  <p className="text-sm text-red-700 font-medium mb-1">Total Expenses</p>
                  <p className="text-2xl font-bold text-red-900">
                    {formatCurrency(reportData.profitLoss.expenses)}
                  </p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <p className="text-sm text-blue-700 font-medium mb-1">Net Income</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {formatCurrency(reportData.profitLoss.netIncome)}
                  </p>
                </div>
              </div>
              {reportData.profitLoss.periods.length > 0 && (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={reportData.profitLoss.periods}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis />
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#10b981"
                        strokeWidth={2}
                        name="Revenue"
                      />
                      <Line
                        type="monotone"
                        dataKey="expenses"
                        stroke="#ef4444"
                        strokeWidth={2}
                        name="Expenses"
                      />
                      <Line
                        type="monotone"
                        dataKey="netIncome"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        name="Net Income"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}

          {/* Accounts Receivable Aging Report */}
          {activeReport === 'accounts-receivable' && reportData.accountsReceivable && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <p className="text-xs text-blue-700 font-medium mb-1">Current</p>
                  <p className="text-xl font-bold text-blue-900">
                    {formatCurrency(reportData.accountsReceivable.current)}
                  </p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                  <p className="text-xs text-yellow-700 font-medium mb-1">1-30 Days</p>
                  <p className="text-xl font-bold text-yellow-900">
                    {formatCurrency(reportData.accountsReceivable.days30)}
                  </p>
                </div>
                <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                  <p className="text-xs text-orange-700 font-medium mb-1">31-60 Days</p>
                  <p className="text-xl font-bold text-orange-900">
                    {formatCurrency(reportData.accountsReceivable.days60)}
                  </p>
                </div>
                <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                  <p className="text-xs text-red-700 font-medium mb-1">61-90 Days</p>
                  <p className="text-xl font-bold text-red-900">
                    {formatCurrency(reportData.accountsReceivable.days90)}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-xs text-gray-700 font-medium mb-1">Over 90 Days</p>
                  <p className="text-xl font-bold text-gray-900">
                    {formatCurrency(reportData.accountsReceivable.over90)}
                  </p>
                </div>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <p className="text-sm text-blue-700 font-medium mb-1">Total Outstanding</p>
                <p className="text-3xl font-bold text-blue-900">
                  {formatCurrency(reportData.accountsReceivable.total)}
                </p>
              </div>
              {reportData.accountsReceivable.agingDetails.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Customer</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700">Total</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700">Current</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700">1-30</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700">31-60</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700">61-90</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700">90+</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.accountsReceivable.agingDetails.map((detail, index) => (
                        <tr key={index} className="border-b border-gray-100">
                          <td className="py-3 px-4 font-medium text-gray-900">{detail.customer}</td>
                          <td className="text-right py-3 px-4 text-gray-900">
                            {formatCurrency(detail.total)}
                          </td>
                          <td className="text-right py-3 px-4 text-gray-600">
                            {formatCurrency(detail.current)}
                          </td>
                          <td className="text-right py-3 px-4 text-gray-600">
                            {formatCurrency(detail.days30)}
                          </td>
                          <td className="text-right py-3 px-4 text-gray-600">
                            {formatCurrency(detail.days60)}
                          </td>
                          <td className="text-right py-3 px-4 text-gray-600">
                            {formatCurrency(detail.days90)}
                          </td>
                          <td className="text-right py-3 px-4 text-gray-600">
                            {formatCurrency(detail.over90)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Sales by Customer Report */}
          {activeReport === 'sales-by-customer' && reportData.salesByCustomer && (
            <div className="space-y-6">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={reportData.salesByCustomer}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="customer" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend />
                    <Bar dataKey="total" fill="#6366f1" name="Total Sales" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Customer</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Invoices</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Total Sales</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.salesByCustomer.map((item, index) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="py-3 px-4 font-medium text-gray-900">{item.customer}</td>
                        <td className="text-right py-3 px-4 text-gray-600">{item.count}</td>
                        <td className="text-right py-3 px-4 font-semibold text-gray-900">
                          {formatCurrency(item.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Sales by Type Report */}
          {activeReport === 'sales-by-type' && reportData.salesByType && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={reportData.salesByType}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="total"
                      >
                        {reportData.salesByType.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={reportData.salesByType}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="type" />
                      <YAxis />
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      <Legend />
                      <Bar dataKey="total" fill="#6366f1" name="Total Revenue" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Type</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Items</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Hours</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Total Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.salesByType.map((item, index) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="py-3 px-4 font-medium text-gray-900">{item.type}</td>
                        <td className="text-right py-3 px-4 text-gray-600">{item.count}</td>
                        <td className="text-right py-3 px-4 text-gray-600">
                          {item.hours ? item.hours.toFixed(2) : '-'}
                        </td>
                        <td className="text-right py-3 px-4 font-semibold text-gray-900">
                          {formatCurrency(item.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tax Summary Report */}
          {activeReport === 'tax-summary' && reportData.taxSummary && (
            <div className="space-y-6">
              <div className="bg-red-50 rounded-lg p-6 border border-red-200">
                <p className="text-sm text-red-700 font-medium mb-1">Total Taxes Collected</p>
                <p className="text-3xl font-bold text-red-900">
                  {formatCurrency(reportData.taxSummary.totalTax)}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {reportData.taxSummary.byState.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Tax by State</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={reportData.taxSummary.byState}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="state" />
                          <YAxis />
                          <Tooltip formatter={(value: number) => formatCurrency(value)} />
                          <Bar dataKey="tax" fill="#ef4444" name="Tax" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-4 space-y-2">
                      {reportData.taxSummary.byState.map((item, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center p-2 bg-gray-50 rounded"
                        >
                          <span className="font-medium text-gray-700">{item.state || 'Unknown'}</span>
                          <span className="text-gray-900">{formatCurrency(item.tax)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {reportData.taxSummary.byType.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Tax by Item Type</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={reportData.taxSummary.byType}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="tax"
                          >
                            {reportData.taxSummary.byType.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: number) => formatCurrency(value)} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-4 space-y-2">
                      {reportData.taxSummary.byType.map((item, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center p-2 bg-gray-50 rounded"
                        >
                          <span className="font-medium text-gray-700">{item.type}</span>
                          <span className="text-gray-900">{formatCurrency(item.tax)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Invoice Summary Report */}
          {activeReport === 'invoice-summary' && reportData.invoiceSummary && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {reportData.invoiceSummary.byStatus.map((status, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-sm text-gray-700 font-medium mb-1">{status.status}</p>
                    <p className="text-xl font-bold text-gray-900">{status.count}</p>
                    <p className="text-sm text-gray-600">{formatCurrency(status.total)}</p>
                  </div>
                ))}
              </div>
              {reportData.invoiceSummary.byMonth.length > 0 && (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={reportData.invoiceSummary.byMonth}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      <Legend />
                      <Bar dataKey="total" fill="#6366f1" name="Total Sales" />
                      <Bar dataKey="count" fill="#10b981" name="Invoice Count" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Month</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Invoices</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Total Sales</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.invoiceSummary.byMonth.map((item, index) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="py-3 px-4 font-medium text-gray-900">{item.month}</td>
                        <td className="text-right py-3 px-4 text-gray-600">{item.count}</td>
                        <td className="text-right py-3 px-4 font-semibold text-gray-900">
                          {formatCurrency(item.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

