'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Edit, Printer, Mail, CheckCircle, Calendar } from 'lucide-react'
import { Version } from '@/components/Version'
import { getDisplayConfig } from '@/lib/invoice-config-loader'
import { formatInvoiceDate } from '@/lib/date-formatter'
import { formatCurrency } from '@/lib/currency-formatter'

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
  const config = getDisplayConfig()

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

  const formatCurrencyAmount = (amount: number) => {
    return formatCurrency(amount, config.currency)
  }

  const formatDateString = (dateString: string | null) => {
    if (!dateString) return '-'
    return formatInvoiceDate(dateString, config.dateFormat.format, config.dateFormat.locale)
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
                📧 Sent {formatDateString(invoice.emailSentAt)}
              </span>
            )}
            {invoice.emailOpenedAt && (
              <span className="text-sm text-green-600 font-medium">
                ✓ Read {formatDateString(invoice.emailOpenedAt)}
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

      <div 
        className="bg-white rounded-lg shadow-sm border"
        style={{
          borderColor: `rgb(${config.colors.borderGray.join(',')})`,
          padding: `${config.layout.margin}px`,
        }}
      >
        {/* Header */}
        {config.sections.companyInfo && (
          <div className="flex justify-between mb-8">
            <div>
              <h2 
                className="font-bold"
                style={{
                  fontSize: `${config.typography.companyName.size}px`,
                  fontWeight: config.typography.companyName.style === 'bold' ? 'bold' : 'normal',
                  color: `rgb(${config.colors.darkGray.join(',')})`,
                }}
              >
                {invoice.company.name}
              </h2>
              {invoice.company.address && (
                <p 
                  className="mt-1"
                  style={{
                    fontSize: `${config.typography.body.size}px`,
                    color: `rgb(${config.colors.darkGray.join(',')})`,
                  }}
                >
                  {invoice.company.address}
                </p>
              )}
              {invoice.company.email && (
                <p 
                  style={{
                    fontSize: `${config.typography.body.size}px`,
                    color: `rgb(${config.colors.darkGray.join(',')})`,
                  }}
                >
                  {invoice.company.email}
                </p>
              )}
              {invoice.company.phone && (
                <p 
                  style={{
                    fontSize: `${config.typography.body.size}px`,
                    color: `rgb(${config.colors.darkGray.join(',')})`,
                  }}
                >
                  {invoice.company.phone}
                </p>
              )}
            </div>
            <div className="text-right">
              <h3 
                className="font-semibold"
                style={{
                  fontSize: `${config.typography.invoiceTitle.size}px`,
                  fontWeight: config.typography.invoiceTitle.style === 'bold' ? 'bold' : 'normal',
                  color: `rgb(${config.colors.primary.join(',')})`,
                }}
              >
                INVOICE
              </h3>
              <p 
                className="mt-1"
                style={{
                  fontSize: `${config.typography.invoiceNumber.size}px`,
                  color: `rgb(${config.colors.darkGray.join(',')})`,
                }}
              >
                #{invoice.invoiceNumber}
              </p>
            </div>
          </div>
        )}

        {/* Bill To */}
        {config.sections.billTo && (
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h3 
                className="font-semibold mb-2"
                style={{
                  fontSize: `${config.typography.body.size}px`,
                  color: `rgb(${config.colors.darkGray.join(',')})`,
                }}
              >
                Bill To:
              </h3>
              <p 
                className="font-medium"
                style={{
                  fontSize: `${config.typography.body.size}px`,
                  color: `rgb(${config.colors.darkGray.join(',')})`,
                }}
              >
                {invoice.customer.name}
              </p>
              {invoice.customer.address && (
                <p 
                  className="mt-1"
                  style={{
                    fontSize: `${config.typography.body.size}px`,
                    color: `rgb(${config.colors.darkGray.join(',')})`,
                  }}
                >
                  {invoice.customer.address}
                </p>
              )}
              {invoice.customer.email && (
                <p 
                  style={{
                    fontSize: `${config.typography.body.size}px`,
                    color: `rgb(${config.colors.darkGray.join(',')})`,
                  }}
                >
                  {invoice.customer.email}
                </p>
              )}
            </div>
            {config.sections.invoiceDates && (
              <div>
                <div className="flex items-center gap-2 mb-2" style={{ color: `rgb(${config.colors.darkGray.join(',')})` }}>
                  <Calendar className="w-4 h-4" />
                  <span 
                    className="font-semibold"
                    style={{ fontSize: `${config.typography.body.size}px` }}
                  >
                    Invoice Date:
                  </span>
                </div>
                <p style={{ fontSize: `${config.typography.body.size}px`, color: `rgb(${config.colors.darkGray.join(',')})` }}>
                  {formatDateString(invoice.date)}
                </p>
                {invoice.dueDate && (
                  <>
                    <div className="flex items-center gap-2 mt-3 mb-2" style={{ color: `rgb(${config.colors.darkGray.join(',')})` }}>
                      <Calendar className="w-4 h-4" />
                      <span 
                        className="font-semibold"
                        style={{ fontSize: `${config.typography.body.size}px` }}
                      >
                        Due Date:
                      </span>
                    </div>
                    <p style={{ fontSize: `${config.typography.body.size}px`, color: `rgb(${config.colors.darkGray.join(',')})` }}>
                      {formatDateString(invoice.dueDate)}
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* Line Items */}
        {config.sections.itemsTable && (
          <div className="mb-8">
            <table className="w-full">
              <thead>
                <tr 
                  style={{
                    borderBottom: `1px solid rgb(${config.colors.borderGray.join(',')})`,
                    backgroundColor: config.table.headerBackground 
                      ? `rgb(${config.table.headerBackground.join(',')})`
                      : 'transparent',
                  }}
                >
                  {config.table.columns.includes('Service') && (
                    <th 
                      className="text-left py-3 px-4 font-semibold"
                      style={{
                        fontSize: `${config.typography.tableHeader.size}px`,
                        fontWeight: config.typography.tableHeader.style === 'bold' ? 'bold' : 'normal',
                        color: config.table.headerTextColor
                          ? `rgb(${config.table.headerTextColor.join(',')})`
                          : `rgb(${config.colors.darkGray.join(',')})`,
                      }}
                    >
                      Service
                    </th>
                  )}
                  {config.table.columns.includes('Hours') && (
                    <th 
                      className="text-right py-3 px-4 font-semibold"
                      style={{
                        fontSize: `${config.typography.tableHeader.size}px`,
                        fontWeight: config.typography.tableHeader.style === 'bold' ? 'bold' : 'normal',
                        color: config.table.headerTextColor
                          ? `rgb(${config.table.headerTextColor.join(',')})`
                          : `rgb(${config.colors.darkGray.join(',')})`,
                      }}
                    >
                      Hours
                    </th>
                  )}
                  {config.table.columns.includes('Amount') && (
                    <th 
                      className="text-right py-3 px-4 font-semibold"
                      style={{
                        fontSize: `${config.typography.tableHeader.size}px`,
                        fontWeight: config.typography.tableHeader.style === 'bold' ? 'bold' : 'normal',
                        color: config.table.headerTextColor
                          ? `rgb(${config.table.headerTextColor.join(',')})`
                          : `rgb(${config.colors.darkGray.join(',')})`,
                      }}
                    >
                      Amount
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, index) => (
                  <tr 
                    key={item.id}
                    style={{
                      borderBottom: `1px solid rgb(${config.colors.borderGray.join(',')})`,
                      backgroundColor: config.table.showAlternatingRows && index % 2 === 1
                        ? `rgb(${config.colors.lightGray.join(',')})`
                        : 'transparent',
                    }}
                  >
                    {config.table.columns.includes('Service') && (
                      <td 
                        className="py-3 px-4"
                        style={{
                          fontSize: `${config.typography.body.size}px`,
                          color: `rgb(${config.colors.darkGray.join(',')})`,
                        }}
                      >
                        <div>
                          <p className="font-medium">{item.description}</p>
                          {item.longDescription && (
                            <p className="mt-1 whitespace-pre-wrap opacity-75">
                              {item.longDescription}
                            </p>
                          )}
                        </div>
                      </td>
                    )}
                    {config.table.columns.includes('Hours') && (
                      <td 
                        className="text-right py-3 px-4"
                        style={{
                          fontSize: `${config.typography.body.size}px`,
                          color: `rgb(${config.colors.darkGray.join(',')})`,
                        }}
                      >
                        {item.type === 'TIME'
                          ? (item.hours || 0).toFixed(2)
                          : (item.quantity || 0).toFixed(2)}
                      </td>
                    )}
                    {config.table.columns.includes('Amount') && (
                      <td 
                        className="text-right py-3 px-4 font-semibold"
                        style={{
                          fontSize: `${config.typography.body.size}px`,
                          color: `rgb(${config.colors.darkGray.join(',')})`,
                        }}
                      >
                        {formatCurrencyAmount(item.amount)}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Totals */}
        {config.sections.totals && (
          <div className="flex justify-end mb-8">
            <div className="w-full md:w-1/3 space-y-2">
              <div 
                className="flex justify-between"
                style={{
                  fontSize: `${config.typography.body.size}px`,
                  color: `rgb(${config.colors.darkGray.join(',')})`,
                }}
              >
                <span>Subtotal:</span>
                <span className="font-semibold">
                  {formatCurrencyAmount(invoice.subtotal)}
                </span>
              </div>
              <div 
                className="flex justify-between"
                style={{
                  fontSize: `${config.typography.body.size}px`,
                  color: `rgb(${config.colors.darkGray.join(',')})`,
                }}
              >
                <span>Tax:</span>
                <span className="font-semibold">
                  {formatCurrencyAmount(invoice.tax)}
                </span>
              </div>
              <div 
                className="flex justify-between pt-2 border-t"
                style={{
                  fontSize: `${config.typography.total.size}px`,
                  fontWeight: config.typography.total.style === 'bold' ? 'bold' : 'normal',
                  color: `rgb(${config.colors.darkGray.join(',')})`,
                  borderTopColor: `rgb(${config.colors.borderGray.join(',')})`,
                }}
              >
                <span>Total:</span>
                <span>{formatCurrencyAmount(invoice.total)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Notes */}
        {config.sections.notes && invoice.notes && (
          <div 
            className="pt-6 border-t"
            style={{
              borderTopColor: `rgb(${config.colors.borderGray.join(',')})`,
            }}
          >
            <h3 
              className="font-semibold mb-2"
              style={{
                fontSize: `${config.typography.body.size}px`,
                color: `rgb(${config.colors.darkGray.join(',')})`,
              }}
            >
              Notes:
            </h3>
            <p 
              className="whitespace-pre-wrap"
              style={{
                fontSize: `${config.typography.body.size}px`,
                color: `rgb(${config.colors.darkGray.join(',')})`,
              }}
            >
              {invoice.notes}
            </p>
          </div>
        )}
      </div>
      <Version />
    </div>
  )
}

