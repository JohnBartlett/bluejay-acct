'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { formatPhoneNumber, formatAddress, formatName } from '@/lib/format'

interface CustomerFormData {
  name: string
  email: string
  address: string
  phone: string
}

export default function CreateCustomerPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [nameValue, setNameValue] = useState('')
  const [phoneValue, setPhoneValue] = useState('')
  const [addressValue, setAddressValue] = useState('')
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CustomerFormData>()

  const onSubmit = async (data: CustomerFormData) => {
    setLoading(true)
    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: (nameValue || data.name)?.trim(),
          email: data.email?.trim() || null,
          address: addressValue?.trim() || null,
          phone: phoneValue ? phoneValue.replace(/\D/g, '') : null, // Store digits only, or null if empty
        }),
      })

      if (response.ok) {
        router.push('/customers')
      } else {
        const errorData = await response.json()
        console.error('API Error:', errorData)
        alert(errorData.error || `Failed to create customer: ${errorData.details || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error creating customer:', error)
      alert(`Failed to create customer: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/customers"
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Add Customer</h1>
      </div>

      <form 
        onSubmit={handleSubmit(onSubmit)} 
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        autoComplete="off"
        data-lpignore="true"
        data-form-type="other"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <input
              type="text"
              {...register('name', { required: 'Name is required' })}
              value={nameValue}
              onChange={(e) => {
                // Allow free typing - don't format on every keystroke
                setNameValue(e.target.value)
                setValue('name', e.target.value)
              }}
              onBlur={(e) => {
                // Format only when user leaves the field
                const formatted = formatName(e.target.value)
                setNameValue(formatted)
                setValue('name', formatted)
              }}
              autoComplete="off"
              data-lpignore="true"
              data-form-type="other"
              data-1p-ignore="true"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Customer name"
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
              autoComplete="off"
              data-lpignore="true"
              data-form-type="other"
              data-1p-ignore="true"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="customer@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              type="tel"
              {...register('phone')}
              value={phoneValue}
              onChange={(e) => {
                const formatted = formatPhoneNumber(e.target.value)
                setPhoneValue(formatted)
                setValue('phone', formatted.replace(/\D/g, '')) // Store digits only
              }}
              onBlur={(e) => {
                // Ensure format is applied on blur
                const formatted = formatPhoneNumber(e.target.value)
                setPhoneValue(formatted)
                setValue('phone', formatted.replace(/\D/g, ''))
              }}
              autoComplete="off"
              data-lpignore="true"
              data-form-type="other"
              data-1p-ignore="true"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="(555) 123-4567"
              maxLength={14}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <textarea
              {...register('address')}
              value={addressValue}
              onChange={(e) => {
                // Allow free typing - don't format on every keystroke
                setAddressValue(e.target.value)
                setValue('address', e.target.value)
              }}
              onBlur={(e) => {
                // Format only when user leaves the field
                const formatted = formatAddress(e.target.value)
                setAddressValue(formatted)
                setValue('address', formatted)
              }}
              autoComplete="off"
              data-lpignore="true"
              data-form-type="other"
              data-1p-ignore="true"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Street address, City, State ZIP"
            />
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t">
            <Link
              href="/customers"
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Customer'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

