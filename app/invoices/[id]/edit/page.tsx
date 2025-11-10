'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect, use } from 'react'
import { InvoiceForm } from '@/components/invoices/InvoiceForm'

export default function EditInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const router = useRouter()
  const { id } = use(params)
  const [invoice, setInvoice] = useState<any>(null)
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

  const handleSubmit = async (data: any) => {
    try {
      const response = await fetch(`/api/invoices/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        router.push(`/invoices/${id}`)
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('Error updating invoice:', errorData)
        alert(`Failed to update invoice: ${errorData.details || errorData.error || 'Unknown error'}`)
        throw new Error(errorData.details || errorData.error || 'Failed to update invoice')
      }
    } catch (error) {
      console.error('Error updating invoice:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to update invoice. Please try again.'
      alert(errorMessage)
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
      <h1 className="text-3xl font-bold text-gray-900">
        Edit Invoice {invoice.invoiceNumber}
      </h1>
      <InvoiceForm
        invoiceId={id}
        defaultHourlyRate={100}
        onSubmit={handleSubmit}
      />
    </div>
  )
}

