'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Edit, Printer, Mail, CheckCircle, Calendar } from 'lucide-react'

interface InvoiceItem {
  id: string
  type: 'TIME' | 'SERVICE' | 'PRODUCT'
  description: string
  longDescription?: string | null
  date?: string | null
  hours?: number | null
  hourlyRate?: number | null
  quantity?: number | null
  unitPrice: number
  amount: number
}

interface Invoice {
  id: string
  invoiceNumber: string
  customer: {
    id: string
    name: string
    email: string | null
    address: string | null
  }
  company: {
    name: string
    address: string | null
    email: string | null
    phone: string | null
  }
  date: string
  dueDate: string | null
  status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED'
  subtotal: number
  tax: number
  total: number
  notes: string | null
  items: InvoiceItem[]
  emailSentAt: string | null
  emailOpenedAt: string | null
}

interface InvoiceViewProps {
  invoiceId: string
}

export function InvoiceView({ invoiceId }: InvoiceViewProps) {
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)
  const [sendingEmail, setSendingEmail] = useState(false)

  useEffect(() => {
    fetchInvoice()
  }, [invoiceId])

  const fetchInvoice = async () => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}`)
      if (response.ok) {
        const data = await response.json()
        setInvoice(data)
      }
    } catch (error) {
      console.error('Error fetching invoice:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSendEmail = async () => {
    if (!invoice || !invoice.customer.email) {
      alert('Customer email is not available')
      return
    }

    setSendingEmail(true)
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/send-email`, {
        method: 'POST',
      })

      if (response.ok) {
        alert('Invoice sent successfully!')
        fetchInvoice() // Refresh to update status
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        const errorMessage = errorData.details || errorData.error || 'Failed to send email'
        console.error('Error sending email:', errorData)
        alert(`Failed to send invoice email: ${errorMessage}`)
      }
    } catch (error) {
      console.error('Error sending email:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to send invoice email'
      alert(`Failed to send invoice email: ${errorMessage}`)
    } finally {
      setSendingEmail(false)
    }
  }

  const handleMarkAsPaid = async () => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'PAID' }),
      })

      if (response.ok) {
        fetchInvoice()
      } else {
        throw new Error('Failed to update invoice')
      }
    } catch (error) {
      console.error('Error updating invoice:', error)
      alert('Failed to mark invoice as paid')
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800'
      case 'SENT':
        return 'bg-blue-100 text-blue-800'
      case 'PAID':
        return 'bg-green-100 text-green-800'
      case 'OVERDUE':
        return 'bg-red-100 text-red-800'
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-500'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500">Loading invoice...</p>
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500">Invoice not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Invoice {invoice.invoiceNumber}
          </h1>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span
              className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                invoice.status
              )}`}
            >
              {invoice.status}
            </span>
            {invoice.emailSentAt && (
              <span className="text-sm text-gray-600">
                📧 Sent {formatDate(invoice.emailSentAt)}
              </span>
            )}
            {invoice.emailOpenedAt && (
              <span className="text-sm text-green-600 font-medium">
                ✓ Read {formatDate(invoice.emailOpenedAt)}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/invoices/${invoiceId}/edit`}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Edit className="w-4 h-4" />
            Edit
          </Link>
          <Link
            href={`/invoices/${invoiceId}/print`}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print
          </Link>
          <button
            onClick={handleSendEmail}
            disabled={sendingEmail || !invoice.customer.email}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Mail className="w-4 h-4" />
            {sendingEmail ? 'Sending...' : 'Send Email'}
          </button>
          {invoice.status !== 'PAID' && (
            <button
              onClick={handleMarkAsPaid}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              Mark as Paid
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        {/* Header */}
        <div className="flex justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {invoice.company.name}
            </h2>
            {invoice.company.address && (
              <p className="text-gray-600 mt-1">{invoice.company.address}</p>
            )}
            {invoice.company.email && (
              <p className="text-gray-600">{invoice.company.email}</p>
            )}
            {invoice.company.phone && (
              <p className="text-gray-600">{invoice.company.phone}</p>
            )}
          </div>
          <div className="text-right">
            <h3 className="text-lg font-semibold text-gray-900">INVOICE</h3>
            <p className="text-gray-600 mt-1">#{invoice.invoiceNumber}</p>
          </div>
        </div>

        {/* Bill To */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              Bill To:
            </h3>
            <p className="font-medium text-gray-900">{invoice.customer.name}</p>
            {invoice.customer.address && (
              <p className="text-gray-600 mt-1">{invoice.customer.address}</p>
            )}
            {invoice.customer.email && (
              <p className="text-gray-600">{invoice.customer.email}</p>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 text-gray-600 mb-2">
              <Calendar className="w-4 h-4" />
              <span className="text-sm font-semibold">Invoice Date:</span>
            </div>
            <p className="text-gray-900">{formatDate(invoice.date)}</p>
            {invoice.dueDate && (
              <>
                <div className="flex items-center gap-2 text-gray-600 mt-3 mb-2">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm font-semibold">Due Date:</span>
                </div>
                <p className="text-gray-900">{formatDate(invoice.dueDate)}</p>
              </>
            )}
          </div>
        </div>

        {/* Line Items */}
        <div className="mb-8">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  Description
                </th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">
                  Type
                </th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">
                  Quantity/Hours
                </th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">
                  Rate/Price
                </th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item) => (
                <tr key={item.id} className="border-b border-gray-100">
                  <td className="py-3 px-4">
                    <div>
                      <p className="text-gray-900 font-medium">{item.description}</p>
                      {item.longDescription && (
                        <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">
                          {item.longDescription}
                        </p>
                      )}
                      {item.type === 'TIME' && item.date && (
                        <p className="text-sm text-gray-500 mt-1">
                          {formatDate(item.date)}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="text-center py-3 px-4">
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                        item.type === 'TIME'
                          ? 'bg-blue-100 text-blue-800'
                          : item.type === 'SERVICE'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {item.type}
                    </span>
                  </td>
                  <td className="text-right py-3 px-4 text-gray-900">
                    {item.type === 'TIME'
                      ? item.hours || 0
                      : item.quantity || 0}
                  </td>
                  <td className="text-right py-3 px-4 text-gray-900">
                    {item.type === 'TIME'
                      ? formatCurrency(item.hourlyRate || 0)
                      : formatCurrency(item.unitPrice)}
                  </td>
                  <td className="text-right py-3 px-4 font-semibold text-gray-900">
                    {formatCurrency(item.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-full md:w-1/3 space-y-2">
            <div className="flex justify-between text-gray-700">
              <span>Subtotal:</span>
              <span className="font-semibold">
                {formatCurrency(invoice.subtotal)}
              </span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>Tax:</span>
              <span className="font-semibold">
                {formatCurrency(invoice.tax)}
              </span>
            </div>
            <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t">
              <span>Total:</span>
              <span>{formatCurrency(invoice.total)}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className="pt-6 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Notes:</h3>
            <p className="text-gray-600 whitespace-pre-wrap">{invoice.notes}</p>
          </div>
        )}
      </div>
    </div>
  )
}

