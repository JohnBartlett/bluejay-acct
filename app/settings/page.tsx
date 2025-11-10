'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Settings as SettingsIcon, Plus, Trash2, Printer, Eye } from 'lucide-react'
import { Version } from '@/components/Version'
import { InvoiceConfig } from '@/lib/invoice-config'

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
  const [activeTab, setActiveTab] = useState<'company' | 'templates' | 'invoice-display' | 'invoice-print'>('company')
  const [displayConfig, setDisplayConfig] = useState<InvoiceConfig | null>(null)
  const [printConfig, setPrintConfig] = useState<InvoiceConfig | null>(null)

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
    fetchInvoiceConfigs()
  }, [])

  const fetchInvoiceConfigs = async () => {
    try {
      const [displayRes, printRes] = await Promise.all([
        fetch('/api/invoice-config?type=display'),
        fetch('/api/invoice-config?type=print'),
      ])
      if (displayRes.ok) {
        const display = await displayRes.json()
        setDisplayConfig(display)
      }
      if (printRes.ok) {
        const print = await printRes.json()
        setPrintConfig(print)
      }
    } catch (error) {
      console.error('Error fetching invoice configs:', error)
    }
  }

  const saveInvoiceConfig = async (type: 'display' | 'print', config: InvoiceConfig) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/invoice-config?type=${type}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      })

      if (response.ok) {
        const updated = await response.json()
        if (type === 'display') {
          setDisplayConfig(updated.config)
        } else {
          setPrintConfig(updated.config)
        }
        alert('Invoice settings saved successfully!')
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to save invoice settings')
      }
    } catch (error) {
      console.error('Error saving invoice config:', error)
      alert('Failed to save invoice settings')
    } finally {
      setLoading(false)
    }
  }

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

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('company')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'company'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Company Information
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'templates'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Prepared Transactions
          </button>
          <button
            onClick={() => setActiveTab('invoice-display')}
            className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
              activeTab === 'invoice-display'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Eye className="w-4 h-4" />
            Invoice Display
          </button>
          <button
            onClick={() => setActiveTab('invoice-print')}
            className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
              activeTab === 'invoice-print'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Printer className="w-4 h-4" />
            Invoice Print/PDF
          </button>
        </nav>
      </div>

      {/* Company Information Tab */}
      {activeTab === 'company' && (
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
      )}

      {/* Prepared Transactions Tab */}
      {activeTab === 'templates' && (
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
      )}

      {/* Invoice Display Settings Tab */}
      {activeTab === 'invoice-display' && displayConfig && (
        <InvoiceDisplaySettings
          config={displayConfig}
          onSave={(config) => saveInvoiceConfig('display', config)}
          loading={loading}
        />
      )}

      {/* Invoice Print/PDF Settings Tab */}
      {activeTab === 'invoice-print' && printConfig && (
        <InvoicePrintSettings
          config={printConfig}
          onSave={(config) => saveInvoiceConfig('print', config)}
          loading={loading}
        />
      )}

      <Version />
    </div>
  )
}

// Invoice Display Settings Fields Component (without form wrapper)
function InvoiceDisplaySettingsFields({
  config,
  updateConfig,
}: {
  config: InvoiceConfig
  updateConfig: (path: string[], value: any) => void
}) {
  return (
    <>
        {/* Colors */}
        <div>
          <h3 className="text-md font-semibold text-gray-800 mb-3">Colors</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="0"
                  max="255"
                  value={config.colors.primary[0]}
                  onChange={(e) => updateConfig(['colors', 'primary'], [parseInt(e.target.value), config.colors.primary[1], config.colors.primary[2]])}
                  className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                  placeholder="R"
                />
                <input
                  type="number"
                  min="0"
                  max="255"
                  value={config.colors.primary[1]}
                  onChange={(e) => updateConfig(['colors', 'primary'], [config.colors.primary[0], parseInt(e.target.value), config.colors.primary[2]])}
                  className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                  placeholder="G"
                />
                <input
                  type="number"
                  min="0"
                  max="255"
                  value={config.colors.primary[2]}
                  onChange={(e) => updateConfig(['colors', 'primary'], [config.colors.primary[0], config.colors.primary[1], parseInt(e.target.value)])}
                  className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                  placeholder="B"
                />
                <div
                  className="w-12 h-10 border border-gray-300 rounded"
                  style={{ backgroundColor: `rgb(${config.colors.primary.join(',')})` }}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Dark Gray</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="0"
                  max="255"
                  value={config.colors.darkGray[0]}
                  onChange={(e) => updateConfig(['colors', 'darkGray'], [parseInt(e.target.value), config.colors.darkGray[1], config.colors.darkGray[2]])}
                  className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                />
                <input
                  type="number"
                  min="0"
                  max="255"
                  value={config.colors.darkGray[1]}
                  onChange={(e) => updateConfig(['colors', 'darkGray'], [config.colors.darkGray[0], parseInt(e.target.value), config.colors.darkGray[2]])}
                  className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                />
                <input
                  type="number"
                  min="0"
                  max="255"
                  value={config.colors.darkGray[2]}
                  onChange={(e) => updateConfig(['colors', 'darkGray'], [config.colors.darkGray[0], config.colors.darkGray[1], parseInt(e.target.value)])}
                  className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                />
                <div
                  className="w-12 h-10 border border-gray-300 rounded"
                  style={{ backgroundColor: `rgb(${config.colors.darkGray.join(',')})` }}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Light Gray</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="0"
                  max="255"
                  value={config.colors.lightGray[0]}
                  onChange={(e) => updateConfig(['colors', 'lightGray'], [parseInt(e.target.value), config.colors.lightGray[1], config.colors.lightGray[2]])}
                  className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                />
                <input
                  type="number"
                  min="0"
                  max="255"
                  value={config.colors.lightGray[1]}
                  onChange={(e) => updateConfig(['colors', 'lightGray'], [config.colors.lightGray[0], parseInt(e.target.value), config.colors.lightGray[2]])}
                  className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                />
                <input
                  type="number"
                  min="0"
                  max="255"
                  value={config.colors.lightGray[2]}
                  onChange={(e) => updateConfig(['colors', 'lightGray'], [config.colors.lightGray[0], config.colors.lightGray[1], parseInt(e.target.value)])}
                  className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                />
                <div
                  className="w-12 h-10 border border-gray-300 rounded"
                  style={{ backgroundColor: `rgb(${config.colors.lightGray.join(',')})` }}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Border Gray</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="0"
                  max="255"
                  value={config.colors.borderGray[0]}
                  onChange={(e) => updateConfig(['colors', 'borderGray'], [parseInt(e.target.value), config.colors.borderGray[1], config.colors.borderGray[2]])}
                  className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                />
                <input
                  type="number"
                  min="0"
                  max="255"
                  value={config.colors.borderGray[1]}
                  onChange={(e) => updateConfig(['colors', 'borderGray'], [config.colors.borderGray[0], parseInt(e.target.value), config.colors.borderGray[2]])}
                  className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                />
                <input
                  type="number"
                  min="0"
                  max="255"
                  value={config.colors.borderGray[2]}
                  onChange={(e) => updateConfig(['colors', 'borderGray'], [config.colors.borderGray[0], config.colors.borderGray[1], parseInt(e.target.value)])}
                  className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                />
                <div
                  className="w-12 h-10 border border-gray-300 rounded"
                  style={{ backgroundColor: `rgb(${config.colors.borderGray.join(',')})` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Layout */}
        <div>
          <h3 className="text-md font-semibold text-gray-800 mb-3">Layout</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Margin (mm)</label>
              <input
                type="number"
                min="0"
                max="50"
                value={config.layout.margin}
                onChange={(e) => updateConfig(['layout', 'margin'], parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Header Height (mm)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={config.layout.headerHeight}
                onChange={(e) => updateConfig(['layout', 'headerHeight'], parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Section Spacing (mm)</label>
              <input
                type="number"
                min="0"
                max="50"
                value={config.layout.sectionSpacing}
                onChange={(e) => updateConfig(['layout', 'sectionSpacing'], parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Typography */}
        <div>
          <h3 className="text-md font-semibold text-gray-800 mb-3">Typography</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(config.typography).map(([key, value]) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="6"
                    max="72"
                    value={value.size}
                    onChange={(e) => updateConfig(['typography', key, 'size'], parseInt(e.target.value))}
                    className="w-20 px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Size"
                  />
                  <select
                    value={value.style}
                    onChange={(e) => updateConfig(['typography', key, 'style'], e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="normal">Normal</option>
                    <option value="bold">Bold</option>
                    <option value="italic">Italic</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sections */}
        <div>
          <h3 className="text-md font-semibold text-gray-800 mb-3">Sections</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(config.sections).map(([key, value]) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => updateConfig(['sections', key], e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Table */}
        <div>
          <h3 className="text-md font-semibold text-gray-800 mb-3">Table</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Columns</label>
              <div className="flex flex-wrap gap-2">
                {['Service', 'Hours', 'Amount', 'Type', 'Description', 'Qty/Hrs', 'Rate/Price'].map((col) => (
                  <label key={col} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.table.columns.includes(col)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          updateConfig(['table', 'columns'], [...config.table.columns, col])
                        } else {
                          updateConfig(['table', 'columns'], config.table.columns.filter((c) => c !== col))
                        }
                      }}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{col}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.table.showAlternatingRows}
                  onChange={(e) => updateConfig(['table', 'showAlternatingRows'], e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Show Alternating Rows</span>
              </label>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Row Spacing (mm)</label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={config.table.rowSpacing}
                  onChange={(e) => updateConfig(['table', 'rowSpacing'], parseInt(e.target.value))}
                  className="w-24 px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Date Format */}
        <div>
          <h3 className="text-md font-semibold text-gray-800 mb-3">Date Format</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Format</label>
              <input
                type="text"
                value={config.dateFormat.format}
                onChange={(e) => updateConfig(['dateFormat', 'format'], e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="MMMM d, yyyy"
              />
              <p className="mt-1 text-xs text-gray-500">
                Examples: MMMM d, yyyy (January 15, 2025), MM/dd/yyyy (01/15/2025)
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Locale</label>
              <select
                value={config.dateFormat.locale}
                onChange={(e) => updateConfig(['dateFormat', 'locale'], e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="en-US">English (US)</option>
                <option value="en-GB">English (UK)</option>
                <option value="es-ES">Spanish</option>
                <option value="fr-FR">French</option>
              </select>
            </div>
          </div>
        </div>

        {/* Currency */}
        <div>
          <h3 className="text-md font-semibold text-gray-800 mb-3">Currency</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Symbol</label>
              <input
                type="text"
                value={config.currency.symbol}
                onChange={(e) => updateConfig(['currency', 'symbol'], e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="$"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Decimal Places</label>
              <input
                type="number"
                min="0"
                max="4"
                value={config.currency.decimalPlaces}
                onChange={(e) => updateConfig(['currency', 'decimalPlaces'], parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Placement</label>
              <select
                value={config.currency.placement || 'before'}
                onChange={(e) => updateConfig(['currency', 'placement'], e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="before">Before amount</option>
                <option value="after">After amount</option>
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div>
          <h3 className="text-md font-semibold text-gray-800 mb-3">Footer</h3>
          <div className="space-y-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={config.footer?.showThankYou || false}
                onChange={(e) => {
                  if (!config.footer) {
                    updateConfig(['footer'], { text: '', showThankYou: e.target.checked })
                  } else {
                    updateConfig(['footer', 'showThankYou'], e.target.checked)
                  }
                }}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Show "Thank you for your business!"</span>
            </label>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Custom Footer Text</label>
              <input
                type="text"
                value={config.footer?.text || ''}
                onChange={(e) => {
                  if (!config.footer) {
                    updateConfig(['footer'], { text: e.target.value, showThankYou: false })
                  } else {
                    updateConfig(['footer', 'text'], e.target.value)
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Optional custom footer text"
              />
            </div>
          </div>
        </div>

    </>
  )
}

// Invoice Display Settings Component (with form wrapper)
function InvoiceDisplaySettings({
  config,
  onSave,
  loading,
}: {
  config: InvoiceConfig
  onSave: (config: InvoiceConfig) => void
  loading: boolean
}) {
  const [localConfig, setLocalConfig] = useState<InvoiceConfig>(config)

  useEffect(() => {
    setLocalConfig(config)
  }, [config])

  const updateConfig = (path: string[], value: any) => {
    setLocalConfig((prev) => {
      const newConfig = { ...prev }
      let current: any = newConfig
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]]
      }
      current[path[path.length - 1]] = value
      return newConfig
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(localConfig)
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Invoice Display Settings</h2>
      <p className="text-sm text-gray-600 mb-6">
        Configure how invoices appear on screen when viewing or printing.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <InvoiceDisplaySettingsFields
          config={localConfig}
          updateConfig={updateConfig}
        />
        <div className="flex justify-end pt-4 border-t">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Save Display Settings'}
          </button>
        </div>
      </form>
    </div>
  )
}

// Invoice Print Settings Component
function InvoicePrintSettings({
  config,
  onSave,
  loading,
}: {
  config: InvoiceConfig
  onSave: (config: InvoiceConfig) => void
  loading: boolean
}) {
  const [localConfig, setLocalConfig] = useState<InvoiceConfig>(config)

  useEffect(() => {
    setLocalConfig(config)
  }, [config])

  const updateConfig = (path: string[], value: any) => {
    setLocalConfig((prev) => {
      const newConfig = { ...prev }
      let current: any = newConfig
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]]
      }
      current[path[path.length - 1]] = value
      return newConfig
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(localConfig)
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Invoice Print/PDF Settings</h2>
      <p className="text-sm text-gray-600 mb-6">
        Configure how invoices appear when printed or exported as PDF.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Include all display settings fields directly (not as nested form) */}
        <InvoiceDisplaySettingsFields
          config={localConfig}
          updateConfig={updateConfig}
        />

        {/* Print-specific settings */}
        {localConfig.print && (
          <div className="border-t pt-6 mt-6">
            <h3 className="text-md font-semibold text-gray-800 mb-4">Print Options</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localConfig.print.includePageNumbers}
                    onChange={(e) => updateConfig(['print', 'includePageNumbers'], e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Include Page Numbers</span>
                </label>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Page Number Position</label>
                  <select
                    value={localConfig.print.pageNumberPosition}
                    onChange={(e) => updateConfig(['print', 'pageNumberPosition'], e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="bottom-left">Bottom Left</option>
                    <option value="bottom-center">Bottom Center</option>
                    <option value="bottom-right">Bottom Right</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">DPI</label>
                  <input
                    type="number"
                    min="72"
                    max="600"
                    value={localConfig.print.dpi}
                    onChange={(e) => updateConfig(['print', 'dpi'], parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bleed (mm)</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={localConfig.print.bleed}
                    onChange={(e) => updateConfig(['print', 'bleed'], parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              {/* PDF Metadata */}
              {localConfig.print.pdfMetadata && (
                <div className="border-t pt-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">PDF Metadata</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                      <input
                        type="text"
                        value={localConfig.print.pdfMetadata.title}
                        onChange={(e) => updateConfig(['print', 'pdfMetadata', 'title'], e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
                      <input
                        type="text"
                        value={localConfig.print.pdfMetadata.author}
                        onChange={(e) => updateConfig(['print', 'pdfMetadata', 'author'], e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                      <input
                        type="text"
                        value={localConfig.print.pdfMetadata.subject}
                        onChange={(e) => updateConfig(['print', 'pdfMetadata', 'subject'], e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Keywords (comma-separated)</label>
                      <input
                        type="text"
                        value={localConfig.print.pdfMetadata.keywords.join(', ')}
                        onChange={(e) => updateConfig(['print', 'pdfMetadata', 'keywords'], e.target.value.split(',').map(k => k.trim()))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Watermark */}
        {localConfig.watermark && (
          <div className="border-t pt-6 mt-6">
            <h3 className="text-md font-semibold text-gray-800 mb-4">Watermark</h3>
            <div className="space-y-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={localConfig.watermark.enabled}
                  onChange={(e) => updateConfig(['watermark', 'enabled'], e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Enable Watermark</span>
              </label>
              {localConfig.watermark.enabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Text</label>
                    <input
                      type="text"
                      value={localConfig.watermark.text}
                      onChange={(e) => updateConfig(['watermark', 'text'], e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="PAID"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Opacity (0-1)</label>
                    <input
                      type="number"
                      min="0"
                      max="1"
                      step="0.1"
                      value={localConfig.watermark.opacity}
                      onChange={(e) => updateConfig(['watermark', 'opacity'], parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rotation (degrees)</label>
                    <input
                      type="number"
                      min="-180"
                      max="180"
                      value={localConfig.watermark.rotation}
                      onChange={(e) => updateConfig(['watermark', 'rotation'], parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Font Size</label>
                    <input
                      type="number"
                      min="12"
                      max="120"
                      value={localConfig.watermark.fontSize}
                      onChange={(e) => updateConfig(['watermark', 'fontSize'], parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="0"
                        max="255"
                        value={localConfig.watermark.color[0]}
                        onChange={(e) => updateConfig(['watermark', 'color'], [parseInt(e.target.value), localConfig.watermark.color[1], localConfig.watermark.color[2]])}
                        className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                      <input
                        type="number"
                        min="0"
                        max="255"
                        value={localConfig.watermark.color[1]}
                        onChange={(e) => updateConfig(['watermark', 'color'], [localConfig.watermark.color[0], parseInt(e.target.value), localConfig.watermark.color[2]])}
                        className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                      <input
                        type="number"
                        min="0"
                        max="255"
                        value={localConfig.watermark.color[2]}
                        onChange={(e) => updateConfig(['watermark', 'color'], [localConfig.watermark.color[0], localConfig.watermark.color[1], parseInt(e.target.value)])}
                        className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                      <div
                        className="w-12 h-10 border border-gray-300 rounded"
                        style={{ backgroundColor: `rgb(${localConfig.watermark.color.join(',')})` }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Table border settings for print */}
        {localConfig.table.borderWidth !== undefined && (
          <div className="border-t pt-6 mt-6">
            <h3 className="text-md font-semibold text-gray-800 mb-4">Table Borders (PDF)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Border Width (mm)</label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={localConfig.table.borderWidth}
                  onChange={(e) => updateConfig(['table', 'borderWidth'], parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              {localConfig.table.borderColor && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Border Color</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="0"
                      max="255"
                      value={localConfig.table.borderColor[0]}
                      onChange={(e) => updateConfig(['table', 'borderColor'], [parseInt(e.target.value), localConfig.table.borderColor![1], localConfig.table.borderColor![2]])}
                      className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                    <input
                      type="number"
                      min="0"
                      max="255"
                      value={localConfig.table.borderColor[1]}
                      onChange={(e) => updateConfig(['table', 'borderColor'], [localConfig.table.borderColor![0], parseInt(e.target.value), localConfig.table.borderColor![2]])}
                      className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                    <input
                      type="number"
                      min="0"
                      max="255"
                      value={localConfig.table.borderColor[2]}
                      onChange={(e) => updateConfig(['table', 'borderColor'], [localConfig.table.borderColor![0], localConfig.table.borderColor![1], parseInt(e.target.value)])}
                      className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                    <div
                      className="w-12 h-10 border border-gray-300 rounded"
                      style={{ backgroundColor: `rgb(${localConfig.table.borderColor.join(',')})` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-end pt-4 border-t">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Save Print Settings'}
          </button>
        </div>
      </form>
    </div>
  )
}


