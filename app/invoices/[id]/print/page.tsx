'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { Printer, Download, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
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
  const config = getDisplayConfig()

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

  const formatCurrencyAmount = (amount: number) => {
    return formatCurrency(amount, config.currency)
  }

  const formatDateString = (dateString: string | null) => {
    if (!dateString) return '-'
    return formatInvoiceDate(dateString, config.dateFormat.format, config.dateFormat.locale)
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
      <div 
        className="invoice-print-container bg-white max-w-4xl mx-auto"
        style={{
          padding: `${config.layout.margin}px`,
        }}
      >
        {/* Header */}
        {config.sections.companyInfo && (
          <div className="flex justify-between mb-8">
            <div>
              <h1 
                className="font-bold"
                style={{
                  fontSize: `${config.typography.companyName.size}px`,
                  fontWeight: config.typography.companyName.style === 'bold' ? 'bold' : 'normal',
                  color: `rgb(${config.colors.darkGray.join(',')})`,
                }}
              >
                {invoice.company.name}
              </h1>
              {invoice.company.address && (
                <p 
                  className="mt-2"
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
              <h2 
                className="font-bold"
                style={{
                  fontSize: `${config.typography.invoiceTitle.size}px`,
                  fontWeight: config.typography.invoiceTitle.style === 'bold' ? 'bold' : 'normal',
                  color: `rgb(${config.colors.primary.join(',')})`,
                }}
              >
                INVOICE
              </h2>
              <p 
                className="mt-2"
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
                className="font-semibold mb-2 uppercase"
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
              <div className="text-right">
                <div 
                  className="mb-2"
                  style={{
                    fontSize: `${config.typography.body.size}px`,
                    color: `rgb(${config.colors.darkGray.join(',')})`,
                  }}
                >
                  <span className="font-semibold">Invoice Date:</span>{' '}
                  {formatDateString(invoice.date)}
                </div>
                {invoice.dueDate && (
                  <div 
                    style={{
                      fontSize: `${config.typography.body.size}px`,
                      color: `rgb(${config.colors.darkGray.join(',')})`,
                    }}
                  >
                    <span className="font-semibold">Due Date:</span>{' '}
                    {formatDateString(invoice.dueDate)}
                  </div>
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
                      className="text-left py-4 px-4 font-bold"
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
                      className="text-right py-4 px-4 font-bold"
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
                      className="text-right py-4 px-4 font-bold"
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
                        className="py-4 px-4"
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
                        className="text-right py-4 px-4"
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
                        className="text-right py-4 px-4 font-semibold"
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
            <div className="w-full md:w-1/3 space-y-3">
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
                className="flex justify-between pt-3 border-t-2"
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

        {/* Footer */}
        {config.sections.footer && config.footer && config.footer.showThankYou && (
          <div 
            className="mt-12 pt-6 border-t text-center"
            style={{
              borderTopColor: `rgb(${config.colors.borderGray.join(',')})`,
              fontSize: `${config.typography.body.size}px`,
              color: `rgb(${config.colors.darkGray.join(',')})`,
            }}
          >
            <p>Thank you for your business!</p>
          </div>
        )}
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

