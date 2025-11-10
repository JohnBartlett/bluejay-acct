'use client'

import { useRouter } from 'next/navigation'
import { InvoiceForm } from '@/components/invoices/InvoiceForm'

export default function CreateInvoicePage() {
  const router = useRouter()

  const handleSubmit = async (data: any) => {
    try {
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        const invoice = await response.json()
        router.push(`/invoices/${invoice.id}`)
      } else {
        throw new Error('Failed to create invoice')
      }
    } catch (error) {
      console.error('Error creating invoice:', error)
      alert('Failed to create invoice. Please try again.')
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Create Invoice</h1>
      <InvoiceForm onSubmit={handleSubmit} defaultHourlyRate={100} />
    </div>
  )
}

