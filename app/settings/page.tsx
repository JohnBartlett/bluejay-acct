'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Settings as SettingsIcon, Plus, Trash2 } from 'lucide-react'

interface CompanyData {
  name: string
  address: string
  email: string
  phone: string
  fiscalYearEnd: string
  currency: string
  defaultHourlyRate: number
}

interface TimeTemplate {
  id: string
  description: string
  hourlyRate: number | null
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(false)
  const [company, setCompany] = useState<CompanyData | null>(null)
  const [templates, setTemplates] = useState<TimeTemplate[]>([])
  const [showTemplateForm, setShowTemplateForm] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<TimeTemplate | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm<CompanyData>()

  const {
    register: registerTemplate,
    handleSubmit: handleTemplateSubmit,
    reset: resetTemplate,
    setValue: setTemplateValue,
  } = useForm<{ description: string; hourlyRate: number }>()

  useEffect(() => {
    fetchCompany()
    fetchTemplates()
  }, [])

  const fetchCompany = async () => {
    try {
      const response = await fetch('/api/company')
      if (response.ok) {
        const data = await response.json()
        setCompany(data)
        reset({
          name: data.name || '',
          address: data.address || '',
          email: data.email || '',
          phone: data.phone || '',
          fiscalYearEnd: data.fiscalYearEnd || 'December 31',
          currency: data.currency || 'USD',
          defaultHourlyRate: data.defaultHourlyRate || 0,
        })
      }
    } catch (error) {
      console.error('Error fetching company:', error)
    }
  }

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/time-templates')
      if (response.ok) {
        const data = await response.json()
        setTemplates(data)
      }
    } catch (error) {
      console.error('Error fetching templates:', error)
    }
  }

  const onCompanySubmit = async (data: CompanyData) => {
    setLoading(true)
    try {
      const response = await fetch('/api/company', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        const updated = await response.json()
        setCompany(updated)
        alert('Company settings saved successfully!')
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to save company settings')
      }
    } catch (error) {
      console.error('Error saving company:', error)
      alert('Failed to save company settings')
    } finally {
      setLoading(false)
    }
  }

  const onTemplateSubmit = async (data: { description: string; hourlyRate: number }) => {
    setLoading(true)
    try {
      const url = editingTemplate
        ? `/api/time-templates/${editingTemplate.id}`
        : '/api/time-templates'
      const method = editingTemplate ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        fetchTemplates()
        resetTemplate()
        setShowTemplateForm(false)
        setEditingTemplate(null)
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to save template')
      }
    } catch (error) {
      console.error('Error saving template:', error)
      alert('Failed to save template')
    } finally {
      setLoading(false)
    }
  }

  const handleEditTemplate = (template: TimeTemplate) => {
    setEditingTemplate(template)
    setTemplateValue('description', template.description)
    setTemplateValue('hourlyRate', template.hourlyRate || 0)
    setShowTemplateForm(true)
  }

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return

    try {
      const response = await fetch(`/api/time-templates/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchTemplates()
      } else {
        alert('Failed to delete template')
      }
    } catch (error) {
      console.error('Error deleting template:', error)
      alert('Failed to delete template')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <SettingsIcon className="w-8 h-8 text-gray-700" />
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
      </div>

      {/* Company Information */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Company Information</h2>
        <form onSubmit={handleSubmit(onCompanySubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company Name *
              </label>
              <input
                type="text"
                {...register('name', { required: 'Company name is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                {...register('email')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="tel"
                {...register('phone')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Currency
              </label>
              <select
                {...register('currency')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
                <option value="CAD">CAD - Canadian Dollar</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fiscal Year End
              </label>
              <input
                type="text"
                {...register('fiscalYearEnd')}
                placeholder="December 31"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Default Hourly Rate ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                {...register('defaultHourlyRate', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <textarea
              {...register('address')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Street address, City, State ZIP"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save Company Settings'}
            </button>
          </div>
        </form>
      </div>

      {/* Prepared Transactions (Time Entry Templates) */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Prepared Transactions</h2>
          <button
            type="button"
            onClick={() => {
              setEditingTemplate(null)
              resetTemplate()
              setShowTemplateForm(!showTemplateForm)
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Template
          </button>
        </div>

        {showTemplateForm && (
          <form
            onSubmit={handleTemplateSubmit(onTemplateSubmit)}
            className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <input
                  type="text"
                  {...registerTemplate('description', { required: 'Description is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Consulting, Development, Support"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hourly Rate ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  {...registerTemplate('hourlyRate', { valueAsNumber: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={() => {
                  setShowTemplateForm(false)
                  setEditingTemplate(null)
                  resetTemplate()
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingTemplate ? 'Update' : 'Add'} Template
              </button>
            </div>
          </form>
        )}

        {templates.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No prepared transactions yet. Click "Add Template" to create one.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {templates.map((template) => (
              <div
                key={template.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div>
                  <p className="font-medium text-gray-900">{template.description}</p>
                  {template.hourlyRate && (
                    <p className="text-sm text-gray-500">
                      ${template.hourlyRate.toFixed(2)}/hour
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleEditTemplate(template)}
                    className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteTemplate(template.id)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

