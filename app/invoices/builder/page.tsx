'use client'

import { useState } from 'react'
import { Save, Eye, GripVertical } from 'lucide-react'

interface TemplateField {
  id: string
  type: 'logo' | 'company-info' | 'customer-info' | 'line-items' | 'totals' | 'notes' | 'footer'
  label: string
  enabled: boolean
  position: number
}

const defaultFields: TemplateField[] = [
  { id: '1', type: 'logo', label: 'Company Logo', enabled: true, position: 1 },
  { id: '2', type: 'company-info', label: 'Company Information', enabled: true, position: 2 },
  { id: '3', type: 'customer-info', label: 'Customer Information', enabled: true, position: 3 },
  { id: '4', type: 'line-items', label: 'Line Items Table', enabled: true, position: 4 },
  { id: '5', type: 'totals', label: 'Totals Section', enabled: true, position: 5 },
  { id: '6', type: 'notes', label: 'Notes Section', enabled: true, position: 6 },
  { id: '7', type: 'footer', label: 'Footer', enabled: true, position: 7 },
]

export default function InvoiceBuilderPage() {
  const [fields, setFields] = useState<TemplateField[]>(defaultFields)
  const [showPreview, setShowPreview] = useState(false)

  const toggleField = (id: string) => {
    setFields((prev) =>
      prev.map((field) =>
        field.id === id ? { ...field, enabled: !field.enabled } : field
      )
    )
  }

  const moveField = (id: string, direction: 'up' | 'down') => {
    setFields((prev) => {
      const index = prev.findIndex((f) => f.id === id)
      if (index === -1) return prev
      if (direction === 'up' && index === 0) return prev
      if (direction === 'down' && index === prev.length - 1) return prev

      const newFields = [...prev]
      const targetIndex = direction === 'up' ? index - 1 : index + 1
      ;[newFields[index], newFields[targetIndex]] = [
        newFields[targetIndex],
        newFields[index],
      ]
      return newFields.map((f, i) => ({ ...f, position: i + 1 }))
    })
  }

  const handleSave = async () => {
    try {
      // Save template configuration
      const response = await fetch('/api/invoices/template', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fields }),
      })

      if (response.ok) {
        alert('Template saved successfully!')
      } else {
        throw new Error('Failed to save template')
      }
    } catch (error) {
      console.error('Error saving template:', error)
      alert('Failed to save template')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Invoice Form Builder</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Eye className="w-4 h-4" />
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Save className="w-4 h-4" />
            Save Template
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Builder Panel */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Customize Invoice Layout
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            Drag and drop fields to reorder, or toggle fields on/off to customize
            your invoice template.
          </p>

          <div className="space-y-2">
            {fields.map((field) => (
              <div
                key={field.id}
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />
                <div className="flex-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={field.enabled}
                      onChange={() => toggleField(field.id)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="font-medium text-gray-900">
                      {field.label}
                    </span>
                  </label>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => moveField(field.id, 'up')}
                    disabled={field.position === 1}
                    className="px-2 py-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => moveField(field.id, 'down')}
                    disabled={field.position === fields.length}
                    className="px-2 py-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ↓
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">
              Tips:
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Enable/disable fields to show or hide sections</li>
              <li>• Reorder fields to change the layout</li>
              <li>• Preview your changes before saving</li>
            </ul>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Invoice Preview
          </h2>
          <div className="border border-gray-200 rounded-lg p-6 bg-white">
            {fields
              .filter((f) => f.enabled)
              .map((field) => (
                <div key={field.id} className="mb-6 last:mb-0">
                  {field.type === 'logo' && (
                    <div className="h-16 bg-gray-100 rounded flex items-center justify-center mb-4">
                      <span className="text-gray-400 text-sm">Company Logo</span>
                    </div>
                  )}
                  {field.type === 'company-info' && (
                    <div className="mb-4">
                      <h3 className="text-lg font-bold text-gray-900">
                        Your Company Name
                      </h3>
                      <p className="text-gray-600">123 Business St</p>
                      <p className="text-gray-600">City, State 12345</p>
                      <p className="text-gray-600">email@company.com</p>
                    </div>
                  )}
                  {field.type === 'customer-info' && (
                    <div className="mb-4 p-4 bg-gray-50 rounded">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">
                        Bill To:
                      </h4>
                      <p className="text-gray-900">Customer Name</p>
                      <p className="text-gray-600">Customer Address</p>
                    </div>
                  )}
                  {field.type === 'line-items' && (
                    <div className="mb-4">
                      <table className="w-full border border-gray-200">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="text-left p-2 border-b">Description</th>
                            <th className="text-right p-2 border-b">Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="p-2 border-b">Sample Item</td>
                            <td className="p-2 border-b text-right">$100.00</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}
                  {field.type === 'totals' && (
                    <div className="mb-4 flex justify-end">
                      <div className="w-64 space-y-2">
                        <div className="flex justify-between">
                          <span>Subtotal:</span>
                          <span>$100.00</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tax:</span>
                          <span>$10.00</span>
                        </div>
                        <div className="flex justify-between font-bold border-t pt-2">
                          <span>Total:</span>
                          <span>$110.00</span>
                        </div>
                      </div>
                    </div>
                  )}
                  {field.type === 'notes' && (
                    <div className="mb-4 p-4 bg-gray-50 rounded">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">
                        Notes:
                      </h4>
                      <p className="text-gray-600 text-sm">
                        Payment terms and additional notes appear here.
                      </p>
                    </div>
                  )}
                  {field.type === 'footer' && (
                    <div className="text-center text-sm text-gray-500 border-t pt-4">
                      <p>Thank you for your business!</p>
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}

