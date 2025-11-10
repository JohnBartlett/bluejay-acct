'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { Printer, Download, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

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
  status: string
  subtotal: number
  tax: number
  total: number
  notes: string | null
  items: InvoiceItem[]
}

export default function PrintInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { id } = use(params)
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchInvoice()
  }, [id])

  const fetchInvoice = async () => {
    try {
      const response = await fetch(`/api/invoices/${id}`)
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

  const handlePrint = () => {
    window.print()
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
      {/* Print controls - hidden when printing */}
      <div className="no-print flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <Link
          href={`/invoices/${id}`}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Invoice
        </Link>
        <div className="flex gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
        </div>
      </div>

      {/* Invoice content */}
      <div className="invoice-print-container bg-white p-8 md:p-12 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {invoice.company.name}
            </h1>
            {invoice.company.address && (
              <p className="text-gray-600 mt-2">{invoice.company.address}</p>
            )}
            {invoice.company.email && (
              <p className="text-gray-600">{invoice.company.email}</p>
            )}
            {invoice.company.phone && (
              <p className="text-gray-600">{invoice.company.phone}</p>
            )}
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-bold text-gray-900">INVOICE</h2>
            <p className="text-gray-600 mt-2 text-lg">#{invoice.invoiceNumber}</p>
          </div>
        </div>

        {/* Bill To */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2 uppercase">
              Bill To:
            </h3>
            <p className="font-medium text-gray-900 text-lg">
              {invoice.customer.name}
            </p>
            {invoice.customer.address && (
              <p className="text-gray-600 mt-1">{invoice.customer.address}</p>
            )}
            {invoice.customer.email && (
              <p className="text-gray-600">{invoice.customer.email}</p>
            )}
          </div>
          <div className="text-right">
            <div className="text-gray-600 mb-2">
              <span className="font-semibold">Invoice Date:</span>{' '}
              {formatDate(invoice.date)}
            </div>
            {invoice.dueDate && (
              <div className="text-gray-600">
                <span className="font-semibold">Due Date:</span>{' '}
                {formatDate(invoice.dueDate)}
              </div>
            )}
          </div>
        </div>

        {/* Line Items */}
        <div className="mb-8">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-300">
                <th className="text-left py-4 px-4 font-bold text-gray-900">
                  Description
                </th>
                <th className="text-center py-4 px-4 font-bold text-gray-900">
                  Type
                </th>
                <th className="text-right py-4 px-4 font-bold text-gray-900">
                  Qty/Hrs
                </th>
                <th className="text-right py-4 px-4 font-bold text-gray-900">
                  Rate/Price
                </th>
                <th className="text-right py-4 px-4 font-bold text-gray-900">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, index) => (
                <tr
                  key={item.id}
                  className={`border-b border-gray-200 ${
                    index % 2 === 0 ? 'bg-gray-50' : ''
                  }`}
                >
                  <td className="py-4 px-4">
                    <div>
                      <p className="font-medium text-gray-900">
                        {item.description}
                      </p>
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
                  <td className="text-center py-4 px-4">
                    <span className="text-sm text-gray-600">{item.type}</span>
                  </td>
                  <td className="text-right py-4 px-4 text-gray-900">
                    {item.type === 'TIME'
                      ? item.hours?.toFixed(2) || '0.00'
                      : item.quantity?.toFixed(2) || '0.00'}
                  </td>
                  <td className="text-right py-4 px-4 text-gray-900">
                    {item.type === 'TIME'
                      ? formatCurrency(item.hourlyRate || 0)
                      : formatCurrency(item.unitPrice)}
                  </td>
                  <td className="text-right py-4 px-4 font-semibold text-gray-900">
                    {formatCurrency(item.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-full md:w-1/3 space-y-3">
            <div className="flex justify-between text-gray-700 text-lg">
              <span>Subtotal:</span>
              <span className="font-semibold">
                {formatCurrency(invoice.subtotal)}
              </span>
            </div>
            <div className="flex justify-between text-gray-700 text-lg">
              <span>Tax:</span>
              <span className="font-semibold">
                {formatCurrency(invoice.tax)}
              </span>
            </div>
            <div className="flex justify-between text-2xl font-bold text-gray-900 pt-3 border-t-2 border-gray-300">
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

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
          <p>Thank you for your business!</p>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          @media print {
            /* Hide print controls */
            .no-print {
              display: none !important;
            }
            
            /* Hide sidebar */
            [data-app-layout] > aside {
              display: none !important;
            }
            
            /* Hide header */
            [data-app-layout] > div > header {
              display: none !important;
            }
            
            /* Make the main flex container full width and remove flex */
            [data-app-layout] {
              display: block !important;
              width: 100% !important;
              height: auto !important;
              background: white !important;
            }
            
            /* Remove padding from main content area */
            [data-app-layout] > div > main {
              padding: 0 !important;
              margin: 0 !important;
              overflow: visible !important;
              width: 100% !important;
              max-width: 100% !important;
            }
            
            /* Ensure invoice container is visible and properly sized */
            .invoice-print-container {
              display: block !important;
              width: 100% !important;
              max-width: 100% !important;
              margin: 0 !important;
              padding: 1cm !important;
              background: white !important;
            }
            
            /* Reset body */
            body {
              background: white !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            
            /* Page setup */
            @page {
              margin: 1cm;
              size: letter;
            }
            
            /* Prevent page breaks in tables */
            table {
              page-break-inside: avoid;
            }
            
            tr {
              page-break-inside: avoid;
            }
          }
        `
      }} />
    </div>
  )
}

