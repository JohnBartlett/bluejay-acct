'use client'

import { useState } from 'react'
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

const cashFlowData = [
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

const profitLossData = [
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

const expenseData = [
  { name: 'Merchant Account', value: 100 },
]

const COLORS = ['#8b5cf6', '#6366f1', '#ec4899', '#f59e0b', '#10b981']

export default function Dashboard() {
  const [timeRange, setTimeRange] = useState('12months')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
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
                Overdue invoices (3)
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-red-50 rounded">
                  <div>
                    <p className="font-medium text-gray-900">John Willis</p>
                    <p className="text-sm text-gray-500">Overdue 1 month ago</p>
                  </div>
                  <p className="font-semibold text-gray-900">$2,444.68</p>
                </div>
                <div className="flex items-center justify-between p-2 bg-red-50 rounded">
                  <div>
                    <p className="font-medium text-gray-900">Catharine Hamilton</p>
                    <p className="text-sm text-gray-500">Overdue 1 month ago</p>
                  </div>
                  <p className="font-semibold text-gray-900">$2,195.00</p>
                </div>
                <div className="flex items-center justify-between p-2 bg-red-50 rounded">
                  <div>
                    <p className="font-medium text-gray-900">John Willis</p>
                    <p className="text-sm text-gray-500">Overdue 2 months ago</p>
                  </div>
                  <p className="font-semibold text-gray-900">$2,027.03</p>
                </div>
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
            <BarChart data={[{ name: 'Previous', value: 32140.16 }, { name: 'Current', value: 10996.93 }]}>
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
                <span className="text-gray-900">$32,598.89</span>
                <span className="text-gray-900">$11,042.50</span>
              </div>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Expenses</span>
              <div className="flex gap-8">
                <span className="text-gray-900">$458.73</span>
                <span className="text-gray-900">$45.57</span>
              </div>
            </div>
            <div className="flex justify-between text-sm font-semibold pt-2 border-t">
              <span className="text-gray-900">Net Income</span>
              <div className="flex gap-8">
                <span className="text-gray-900">$32,140.16</span>
                <span className="text-gray-900">$10,996.93</span>
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
                  <span className="text-gray-900">$0.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">1-30 days overdue</span>
                  <span className="text-gray-900">$0.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">31-60 days overdue</span>
                  <span className="text-gray-900">$2,444.68</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">61-90 days overdue</span>
                  <span className="text-gray-900">$2,027.03</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">&gt; 90 days overdue</span>
                  <span className="text-gray-900">$2,195.00</span>
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

