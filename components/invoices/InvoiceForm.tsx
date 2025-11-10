'use client'

import { useState, useEffect, useRef } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { Plus, Trash2, Calendar, ChevronDown } from 'lucide-react'

// State tax rates (as decimal, e.g., 0.08 = 8%)
const STATE_TAX_RATES: Record<string, number> = {
  'AL': 0.04, // Alabama
  'AK': 0.00, // Alaska (no state sales tax)
  'AZ': 0.056, // Arizona
  'AR': 0.065, // Arkansas
  'CA': 0.0725, // California
  'CO': 0.029, // Colorado
  'CT': 0.0635, // Connecticut
  'DE': 0.00, // Delaware (no sales tax)
  'FL': 0.06, // Florida
  'GA': 0.04, // Georgia
  'HI': 0.04, // Hawaii
  'ID': 0.06, // Idaho
  'IL': 0.0625, // Illinois
  'IN': 0.07, // Indiana
  'IA': 0.06, // Iowa
  'KS': 0.065, // Kansas
  'KY': 0.06, // Kentucky
  'LA': 0.0445, // Louisiana
  'ME': 0.055, // Maine
  'MD': 0.06, // Maryland
  'MA': 0.0625, // Massachusetts
  'MI': 0.06, // Michigan
  'MN': 0.06875, // Minnesota
  'MS': 0.07, // Mississippi
  'MO': 0.04225, // Missouri
  'MT': 0.00, // Montana (no state sales tax)
  'NE': 0.055, // Nebraska
  'NV': 0.0685, // Nevada
  'NH': 0.00, // New Hampshire (no sales tax)
  'NJ': 0.06625, // New Jersey
  'NM': 0.05125, // New Mexico
  'NY': 0.04, // New York
  'NC': 0.0475, // North Carolina
  'ND': 0.05, // North Dakota
  'OH': 0.0575, // Ohio
  'OK': 0.045, // Oklahoma
  'OR': 0.00, // Oregon (no sales tax)
  'PA': 0.06, // Pennsylvania
  'RI': 0.07, // Rhode Island
  'SC': 0.06, // South Carolina
  'SD': 0.045, // South Dakota
  'TN': 0.07, // Tennessee
  'TX': 0.0625, // Texas
  'UT': 0.061, // Utah
  'VT': 0.06, // Vermont
  'VA': 0.053, // Virginia
  'WA': 0.065, // Washington
  'WV': 0.06, // West Virginia
  'WI': 0.05, // Wisconsin
  'WY': 0.04, // Wyoming
  'DC': 0.06, // District of Columbia
}

interface Customer {
  id: string
  name: string
  email: string | null
}

interface InvoiceItem {
  type: 'TIME' | 'SERVICE' | 'PRODUCT'
  description: string
  longDescription?: string // Detailed description/notes for the item
  date?: string
  hours?: number
  hourlyRate?: number
  quantity?: number
  unitPrice: number
  amount: number
  taxRate?: number // Tax rate for this specific item (as decimal, e.g., 0.08 = 8%)
  itemTax?: number // Calculated tax for this item
}

interface InvoiceFormData {
  customerId: string
  invoiceNumber: string
  date: string
  dueDate: string
  taxState: string // General state tax (optional)
  taxStateTime: string // State tax for TIME items
  taxStateService: string // State tax for SERVICE items
  taxStateProduct: string // State tax for PRODUCT items
  items: InvoiceItem[]
  notes: string
  paymentNoteType: string // Predefined payment note type
  useCreditCardFee: boolean
  creditCardFeePercent: number
  creditCardFee: number
  tax: number
  subtotal: number
  total: number
}

// Predefined payment notes
const PAYMENT_NOTES = {
  'bank': 'Payment can be made via direct bank transfer (EFT) or Zelle. Please contact us for banking details.',
  'credit_card': 'Credit card payments are accepted. A processing fee may apply.',
  'deferred': 'Payment may be deferred to the next invoice. Interest charges will apply to the deferred amount.',
}

interface InvoiceFormProps {
  invoiceId?: string
  defaultHourlyRate?: number
  onSubmit: (data: InvoiceFormData) => Promise<void>
}

export function InvoiceForm({
  invoiceId,
  defaultHourlyRate = 0,
  onSubmit,
}: InvoiceFormProps) {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const {
    register,
    handleSubmit,
    control,
    watch,
    getValues,
    setValue,
    reset,
    formState: { errors },
  } = useForm<InvoiceFormData>({
    defaultValues: {
      customerId: '',
      invoiceNumber: '',
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
      taxState: '',
      taxStateTime: '',
      taxStateService: '',
      taxStateProduct: '',
      items: [],
      notes: '',
      paymentNoteType: '',
      useCreditCardFee: false,
      creditCardFeePercent: 2.9,
      creditCardFee: 0,
      tax: 0,
      subtotal: 0,
      total: 0,
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  })

  const watchedItems = watch('items')
  const watchedSubtotal = watch('subtotal')
  const watchedTaxState = watch('taxState')
  const watchedTaxStateTime = watch('taxStateTime')
  const watchedTaxStateService = watch('taxStateService')
  const watchedTaxStateProduct = watch('taxStateProduct')
  const watchedUseCreditCardFee = watch('useCreditCardFee')
  const watchedCreditCardFeePercent = watch('creditCardFeePercent')
  const watchedPaymentNoteType = watch('paymentNoteType')
  const watchedNotes = watch('notes')

  useEffect(() => {
    fetchCustomers()
  }, [])

  useEffect(() => {
    if (invoiceId) {
      fetchInvoice()
    }
  }, [invoiceId])

  const fetchInvoice = async () => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}`)
      if (response.ok) {
        const invoice = await response.json()
        
        // Map invoice data to form format
        const formData: InvoiceFormData = {
          customerId: invoice.customerId || invoice.customer?.id || '',
          invoiceNumber: invoice.invoiceNumber || '',
          date: invoice.date ? new Date(invoice.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          dueDate: invoice.dueDate ? new Date(invoice.dueDate).toISOString().split('T')[0] : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          taxState: '',
          taxStateTime: '',
          taxStateService: '',
          taxStateProduct: '',
          items: invoice.items?.map((item: any) => ({
            type: item.type,
            description: item.description || '',
            longDescription: item.longDescription || '',
            date: item.date ? new Date(item.date).toISOString().split('T')[0] : '',
            hours: item.hours ?? 0,
            hourlyRate: item.hourlyRate ?? defaultHourlyRate,
            quantity: item.quantity ?? 0,
            unitPrice: item.unitPrice || 0,
            amount: item.amount || 0,
            taxRate: 0, // Not stored in DB, will be recalculated
            itemTax: 0, // Not stored in DB, will be recalculated
          })) || [],
          notes: invoice.notes || '',
          paymentNoteType: '',
          useCreditCardFee: false,
          creditCardFeePercent: 2.9,
          creditCardFee: 0,
          tax: invoice.tax || 0,
          subtotal: invoice.subtotal || 0,
          total: invoice.total || 0,
        }

        // Set payment note type if notes match a predefined note
        const notes = invoice.notes || ''
        if (notes.includes(PAYMENT_NOTES.bank)) {
          formData.paymentNoteType = 'bank'
        } else if (notes.includes(PAYMENT_NOTES.credit_card)) {
          formData.paymentNoteType = 'credit_card'
        } else if (notes.includes(PAYMENT_NOTES.deferred)) {
          formData.paymentNoteType = 'deferred'
        }

        // Reset form with invoice data (this properly populates all fields including items array)
        reset(formData)
      }
    } catch (error) {
      console.error('Error fetching invoice:', error)
    }
  }

  useEffect(() => {
    // Use fields array to ensure we process ALL items that exist in the form
    // Get each item's value directly from form state to ensure we have the latest data
    const currentItems = fields.map((field, index) => {
      const itemValue = getValues(`items.${index}`)
      return itemValue || null
    }).filter(Boolean)
    
    // Calculate subtotal from all items (TIME, SERVICE, PRODUCT all included)
    // Ensure we're using the actual numeric value, not string or undefined
    const subtotal = currentItems.reduce((sum: number, item: any, index: number) => {
      if (!item) return sum
      // Get amount directly from form state for this specific index
      const formAmount = getValues(`items.${index}.amount`)
      const amount = formAmount !== undefined && formAmount !== null ? formAmount : item.amount
      const numAmount = typeof amount === 'number' ? amount : parseFloat(String(amount || 0)) || 0
      if (isNaN(numAmount)) return sum
      return sum + numAmount
    }, 0)
    
    // Round subtotal to 2 decimal places
    const roundedSubtotal = Math.round(subtotal * 100) / 100
    
    // Calculate state tax rates for each item type
    const timeStateTaxRate = watchedTaxStateTime ? (STATE_TAX_RATES[watchedTaxStateTime] || 0) : 0
    const serviceStateTaxRate = watchedTaxStateService ? (STATE_TAX_RATES[watchedTaxStateService] || 0) : 0
    const productStateTaxRate = watchedTaxStateProduct ? (STATE_TAX_RATES[watchedTaxStateProduct] || 0) : 0
    const generalStateTaxRate = watchedTaxState ? (STATE_TAX_RATES[watchedTaxState] || 0) : 0
    
    // Calculate subtotals for each item type
    const timeItems = currentItems.filter((item: any) => item && item.type === 'TIME')
    const serviceItems = currentItems.filter((item: any) => item && item.type === 'SERVICE')
    const productItems = currentItems.filter((item: any) => item && item.type === 'PRODUCT')
    const timeSubtotal = timeItems.reduce((sum: number, item: any) => {
      if (!item) return sum
      const itemIndex = currentItems.indexOf(item)
      const formAmount = itemIndex >= 0 ? getValues(`items.${itemIndex}.amount`) : item.amount
      const amount = formAmount !== undefined && formAmount !== null ? formAmount : item.amount
      const numAmount = typeof amount === 'number' ? amount : parseFloat(String(amount || 0)) || 0
      if (isNaN(numAmount)) return sum
      return sum + numAmount
    }, 0)
    const serviceSubtotal = serviceItems.reduce((sum: number, item: any) => {
      if (!item) return sum
      const itemIndex = currentItems.indexOf(item)
      const formAmount = itemIndex >= 0 ? getValues(`items.${itemIndex}.amount`) : item.amount
      const amount = formAmount !== undefined && formAmount !== null ? formAmount : item.amount
      const numAmount = typeof amount === 'number' ? amount : parseFloat(String(amount || 0)) || 0
      if (isNaN(numAmount)) return sum
      return sum + numAmount
    }, 0)
    const productSubtotal = productItems.reduce((sum: number, item: any) => {
      if (!item) return sum
      const itemIndex = currentItems.indexOf(item)
      const formAmount = itemIndex >= 0 ? getValues(`items.${itemIndex}.amount`) : item.amount
      const amount = formAmount !== undefined && formAmount !== null ? formAmount : item.amount
      const numAmount = typeof amount === 'number' ? amount : parseFloat(String(amount || 0)) || 0
      if (isNaN(numAmount)) return sum
      return sum + numAmount
    }, 0)
    
    // Calculate tax for each item: individual tax rate + state tax (proportional) + general state tax
    let totalItemTax = 0
    let totalStateTax = 0
    
    currentItems.forEach((item: any, index: number) => {
      // Get amount from multiple sources to ensure we have the latest value
      let itemAmount = item?.amount
      if (itemAmount === undefined || itemAmount === null) {
        const formAmount = getValues(`items.${index}.amount`)
        itemAmount = formAmount
      }
      const numAmount = typeof itemAmount === 'number' ? itemAmount : parseFloat(String(itemAmount || 0)) || 0
      if (numAmount === 0 || isNaN(numAmount)) {
        setValue(`items.${index}.itemTax`, 0)
        return
      }
      
      // Use the parsed numeric amount
      const itemAmountValue = numAmount
      
      // Individual tax rate (from taxRate field)
      const itemTaxRatePercent = item.taxRate || 0
      const individualTax = itemAmountValue * (itemTaxRatePercent / 100)
      
      // State tax for this item type (proportional to item's share of subtotal)
      let stateTaxForItem = 0
      if (item.type === 'TIME' && timeStateTaxRate > 0 && timeSubtotal > 0) {
        stateTaxForItem = itemAmountValue * timeStateTaxRate
      } else if (item.type === 'SERVICE' && serviceStateTaxRate > 0 && serviceSubtotal > 0) {
        stateTaxForItem = itemAmountValue * serviceStateTaxRate
      } else if (item.type === 'PRODUCT' && productStateTaxRate > 0 && productSubtotal > 0) {
        stateTaxForItem = itemAmountValue * productStateTaxRate
      }
      
      // General state tax (proportional to item's share of total subtotal)
      let generalTaxForItem = 0
      if (generalStateTaxRate > 0 && roundedSubtotal > 0) {
        generalTaxForItem = itemAmountValue * generalStateTaxRate
      }
      
      // Total tax for this item
      const totalTaxForItem = individualTax + stateTaxForItem + generalTaxForItem
      const roundedItemTax = Math.round(totalTaxForItem * 100) / 100
      
      setValue(`items.${index}.itemTax`, roundedItemTax)
      totalItemTax += individualTax
      totalStateTax += stateTaxForItem + generalTaxForItem
    })
    
    // Calculate total state tax for summary
    const timeStateTax = timeSubtotal * timeStateTaxRate
    const serviceStateTax = serviceSubtotal * serviceStateTaxRate
    const productStateTax = productSubtotal * productStateTaxRate
    const generalStateTax = subtotal * generalStateTaxRate
    const totalStateTaxForSummary = timeStateTax + serviceStateTax + productStateTax + generalStateTax
    
    // Total tax = individual item taxes + state taxes
    const totalTax = totalItemTax + totalStateTaxForSummary
    
    // Calculate credit card processing fee (if enabled)
    // Fee is typically calculated on subtotal + total tax
    let creditCardFee = 0
    if (watchedUseCreditCardFee && watchedCreditCardFeePercent > 0) {
      const feeBase = roundedSubtotal + totalTax
      creditCardFee = feeBase * (watchedCreditCardFeePercent / 100)
    }
    
    const total = roundedSubtotal + totalTax + creditCardFee
    const roundedTotal = Math.round(total * 100) / 100
    const roundedTax = Math.round(totalTax * 100) / 100
    const roundedCreditCardFee = Math.round(creditCardFee * 100) / 100
    
    setValue('subtotal', roundedSubtotal)
    setValue('tax', roundedTax)
    setValue('creditCardFee', roundedCreditCardFee)
    setValue('total', roundedTotal)
  }, [fields, watchedItems, watchedTaxState, watchedTaxStateTime, watchedTaxStateService, watchedTaxStateProduct, watchedUseCreditCardFee, watchedCreditCardFeePercent, setValue, getValues])

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customers')
      const data = await response.json()
      setCustomers(data)
    } catch (error) {
      console.error('Error fetching customers:', error)
    }
  }

  const addTimeEntry = () => {
    append({
      type: 'TIME',
      description: '',
      longDescription: '',
      date: new Date().toISOString().split('T')[0],
      hours: 1,
      hourlyRate: defaultHourlyRate,
      unitPrice: defaultHourlyRate,
      amount: defaultHourlyRate,
    })
  }

  const addService = () => {
    append({
      type: 'SERVICE',
      description: '',
      longDescription: '',
      quantity: 1,
      unitPrice: 0,
      amount: 0,
    })
  }

  const addProduct = () => {
    append({
      type: 'PRODUCT',
      description: '',
      longDescription: '',
      quantity: 1,
      unitPrice: 0,
      amount: 0,
    })
  }

  const updateItemAmount = (index: number, field: string, value: string) => {
    // Get current form values - getValues gives us the current form state
    const currentItems = getValues('items')
    const item = currentItems[index]
    
    if (item.type === 'TIME') {
      // Use the new value from the event for the changed field,
      // and get the other value from current form state
      let hours = item.hours || 0
      let hourlyRate = item.hourlyRate || 0
      
      if (field === 'hours') {
        hours = parseFloat(value) || 0
        // Get hourlyRate from current form state
        hourlyRate = item.hourlyRate || 0
      } else if (field === 'hourlyRate') {
        hourlyRate = parseFloat(value) || 0
        // Get hours from current form state
        hours = item.hours || 0
      }
      
      const amount = Math.round((hours * hourlyRate) * 100) / 100 // Round to 2 decimal places
      setValue(`items.${index}.amount`, amount)
      setValue(`items.${index}.unitPrice`, hourlyRate)
    } else {
      let quantity = item.quantity || 1
      let unitPrice = item.unitPrice || 0
      
      if (field === 'quantity') {
        quantity = parseFloat(value) || 1
        unitPrice = item.unitPrice || 0
      } else if (field === 'unitPrice') {
        unitPrice = parseFloat(value) || 0
        quantity = item.quantity || 1
      }
      
      const amount = Math.round((quantity * unitPrice) * 100) / 100 // Round to 2 decimal places
      setValue(`items.${index}.amount`, amount)
    }
  }

  const onFormSubmit = async (data: InvoiceFormData) => {
    setLoading(true)
    try {
      await onSubmit(data)
    } catch (error) {
      console.error('Error submitting invoice:', error)
    } finally {
      setLoading(false)
    }
  }

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [menuOpen])

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Sticky Add Items Menu */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm -mx-6 px-6 py-4 mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Line Items</h2>
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add Item
              <ChevronDown className={`w-4 h-4 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                <button
                  type="button"
                  onClick={() => {
                    addTimeEntry()
                    setMenuOpen(false)
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                >
                  <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                  Add Time Entry
                </button>
                <button
                  type="button"
                  onClick={() => {
                    addService()
                    setMenuOpen(false)
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors"
                >
                  <div className="w-2 h-2 rounded-full bg-green-600"></div>
                  Add Service
                </button>
                <button
                  type="button"
                  onClick={() => {
                    addProduct()
                    setMenuOpen(false)
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors"
                >
                  <div className="w-2 h-2 rounded-full bg-purple-600"></div>
                  Add Product
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Invoice Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Customer *
            </label>
            <select
              {...register('customerId', { required: 'Customer is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a customer</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
            {errors.customerId && (
              <p className="mt-1 text-sm text-red-600">
                {errors.customerId.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Invoice Number
            </label>
            <input
              type="text"
              {...register('invoiceNumber')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Auto-generated"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Invoice Date *
            </label>
            <input
              type="date"
              {...register('date', { required: 'Date is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Due Date
            </label>
            <input
              type="date"
              {...register('dueDate')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              General State Tax (optional - applies to all items)
            </label>
            <select
              {...register('taxState')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select state (no general tax)</option>
              {Object.keys(STATE_TAX_RATES).sort().map((state) => (
                <option key={state} value={state}>
                  {state} ({(STATE_TAX_RATES[state] * 100).toFixed(2)}%)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              State Tax for Time Items
            </label>
            <select
              {...register('taxStateTime')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select state (no tax)</option>
              {Object.keys(STATE_TAX_RATES).sort().map((state) => (
                <option key={state} value={state}>
                  {state} ({(STATE_TAX_RATES[state] * 100).toFixed(2)}%)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              State Tax for Service Items
            </label>
            <select
              {...register('taxStateService')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select state (no tax)</option>
              {Object.keys(STATE_TAX_RATES).sort().map((state) => (
                <option key={state} value={state}>
                  {state} ({(STATE_TAX_RATES[state] * 100).toFixed(2)}%)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              State Tax for Product Items
            </label>
            <select
              {...register('taxStateProduct')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select state (no tax)</option>
              {Object.keys(STATE_TAX_RATES).sort().map((state) => (
                <option key={state} value={state}>
                  {state} ({(STATE_TAX_RATES[state] * 100).toFixed(2)}%)
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {fields.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No line items added yet. Click the buttons above to add items.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {fields.map((field, index) => {
              const item = watchedItems[index]
              // Calculate tax amount for this item directly
              const itemAmount = item?.amount || 0
              const itemTaxRatePercent = item?.taxRate || 0
              const individualTax = itemAmount * (itemTaxRatePercent / 100)
              
              // State tax for this item type
              let stateTaxForItem = 0
              if (item?.type === 'TIME' && watchedTaxStateTime) {
                const timeStateTaxRate = STATE_TAX_RATES[watchedTaxStateTime] || 0
                stateTaxForItem = itemAmount * timeStateTaxRate
              } else if (item?.type === 'SERVICE' && watchedTaxStateService) {
                const serviceStateTaxRate = STATE_TAX_RATES[watchedTaxStateService] || 0
                stateTaxForItem = itemAmount * serviceStateTaxRate
              } else if (item?.type === 'PRODUCT' && watchedTaxStateProduct) {
                const productStateTaxRate = STATE_TAX_RATES[watchedTaxStateProduct] || 0
                stateTaxForItem = itemAmount * productStateTaxRate
              }
              
              // General state tax
              let generalTaxForItem = 0
              if (watchedTaxState) {
                const generalStateTaxRate = STATE_TAX_RATES[watchedTaxState] || 0
                generalTaxForItem = itemAmount * generalStateTaxRate
              }
              
              const calculatedItemTax = individualTax + stateTaxForItem + generalTaxForItem
              
              return (
                <div
                  key={field.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        item.type === 'TIME'
                          ? 'bg-blue-100 text-blue-800'
                          : item.type === 'SERVICE'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {item.type}
                    </span>
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Title/Description *
                      </label>
                      <input
                        type="text"
                        {...register(`items.${index}.description`, {
                          required: 'Description is required',
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter title or brief description"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Detailed Description
                      </label>
                      <textarea
                        {...register(`items.${index}.longDescription`)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter detailed description, notes, or additional information..."
                      />
                    </div>

                    {item.type === 'TIME' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Date
                          </label>
                          <input
                            type="date"
                            {...register(`items.${index}.date`)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Hours
                          </label>
                          <input
                            type="number"
                            step="0.25"
                            {...register(`items.${index}.hours`, {
                              valueAsNumber: true,
                              min: 0,
                            })}
                            onChange={(e) => {
                              updateItemAmount(index, 'hours', e.target.value)
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Hourly Rate ($)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            {...register(`items.${index}.hourlyRate`, {
                              valueAsNumber: true,
                              min: 0,
                            })}
                            onChange={(e) => {
                              updateItemAmount(index, 'hourlyRate', e.target.value)
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tax Rate (%)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            {...register(`items.${index}.taxRate`, {
                              valueAsNumber: true,
                              min: 0,
                              max: 100,
                            })}
                            onChange={(e) => {
                              // Trigger recalculation when tax rate changes
                              const value = e.target.value
                              setValue(`items.${index}.taxRate`, parseFloat(value) || 0)
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="0.00"
                          />
                        </div>
                        {((item.taxRate || 0) > 0 || watchedTaxStateTime || watchedTaxState) && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Tax Amount ($)
                            </label>
                            <input
                              type="text"
                              value={calculatedItemTax.toFixed(2)}
                              readOnly
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 font-semibold"
                            />
                          </div>
                        )}
                      </>
                    )}

                    {(item.type === 'SERVICE' || item.type === 'PRODUCT') && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Quantity
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            {...register(`items.${index}.quantity`, {
                              valueAsNumber: true,
                              min: 0,
                            })}
                            onChange={(e) => {
                              updateItemAmount(index, 'quantity', e.target.value)
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Unit Price ($)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            {...register(`items.${index}.unitPrice`, {
                              valueAsNumber: true,
                              min: 0,
                            })}
                            onChange={(e) => {
                              updateItemAmount(index, 'unitPrice', e.target.value)
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tax Rate (%)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            {...register(`items.${index}.taxRate`, {
                              valueAsNumber: true,
                              min: 0,
                              max: 100,
                            })}
                            onChange={(e) => {
                              // Trigger recalculation when tax rate changes
                              const value = e.target.value
                              setValue(`items.${index}.taxRate`, parseFloat(value) || 0)
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="0.00"
                          />
                        </div>
                        {((item.taxRate || 0) > 0 || 
                          (item.type === 'SERVICE' && (watchedTaxStateService || watchedTaxState)) ||
                          (item.type === 'PRODUCT' && (watchedTaxStateProduct || watchedTaxState))) && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Tax Amount ($)
                            </label>
                            <input
                              type="text"
                              value={calculatedItemTax.toFixed(2)}
                              readOnly
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 font-semibold"
                            />
                          </div>
                        )}
                      </>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Amount ($)
                      </label>
                      <input
                        type="text"
                        {...register(`items.${index}.amount`, {
                          valueAsNumber: true,
                        })}
                        value={(item.amount || 0).toFixed(2)}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 font-semibold"
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Note
            </label>
            <select
              {...register('paymentNoteType')}
              onChange={(e) => {
                const noteType = e.target.value
                setValue('paymentNoteType', noteType)
                // Get current notes
                let currentNotes = getValues('notes') || ''
                
                // Remove any existing payment notes by checking for key phrases
                Object.values(PAYMENT_NOTES).forEach(paymentNote => {
                  // Check if this payment note exists in current notes
                  if (currentNotes.includes(paymentNote)) {
                    // Remove the payment note and clean up extra newlines
                    currentNotes = currentNotes.replace(paymentNote, '').trim()
                  }
                })
                
                // Clean up multiple consecutive newlines
                currentNotes = currentNotes.replace(/\n{3,}/g, '\n\n').trim()
                
                // Add selected payment note
                if (noteType && PAYMENT_NOTES[noteType as keyof typeof PAYMENT_NOTES]) {
                  const newNote = PAYMENT_NOTES[noteType as keyof typeof PAYMENT_NOTES]
                  setValue('notes', currentNotes ? `${currentNotes}\n\n${newNote}` : newNote)
                } else {
                  setValue('notes', currentNotes)
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select payment note (optional)</option>
              <option value="bank">Bank Transfer / Zelle</option>
              <option value="credit_card">Credit Card Payment</option>
              <option value="deferred">Deferred Payment (with interest)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Additional Notes
            </label>
            <textarea
              {...register('notes')}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Additional notes or terms..."
            />
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center gap-3 mb-3">
              <input
                type="checkbox"
                {...register('useCreditCardFee')}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label className="text-sm font-medium text-gray-700">
                Add Credit Card Processing Fee
              </label>
            </div>
            {watchedUseCreditCardFee && (
              <div className="ml-7">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Processing Fee Percentage (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  {...register('creditCardFeePercent', {
                    valueAsNumber: true,
                    min: 0,
                    max: 100,
                  })}
                  className="w-full md:w-48 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="2.9"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Fee is calculated on subtotal + tax
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <div className="w-full md:w-1/2 space-y-2">
              <div className="flex justify-between text-gray-700">
                <span>Subtotal:</span>
                <span className="font-semibold">
                  ${watchedSubtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>
                  Total Tax:
                </span>
                <span className="font-semibold">
                  ${(watch('tax') || 0).toFixed(2)}
                </span>
              </div>
              {(watchedTaxStateTime || watchedTaxStateService || watchedTaxStateProduct || watchedTaxState) && (
                <div className="text-xs text-gray-500 pl-2">
                  {watchedTaxStateTime && `Time: ${watchedTaxStateTime} `}
                  {watchedTaxStateService && `Service: ${watchedTaxStateService} `}
                  {watchedTaxStateProduct && `Product: ${watchedTaxStateProduct} `}
                  {watchedTaxState && `General: ${watchedTaxState}`}
                </div>
              )}
              {watchedUseCreditCardFee && (
                <div className="flex justify-between text-gray-700">
                  <span>
                    Credit Card Processing Fee ({(watchedCreditCardFeePercent || 0).toFixed(2)}%):
                  </span>
                  <span className="font-semibold">
                    ${(watch('creditCardFee') || 0).toFixed(2)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t">
                <span>Total:</span>
                <span>${watch('total').toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={async () => {
            const formData = getValues()
            await onSubmit({ ...formData, status: 'DRAFT' })
          }}
          disabled={loading}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Save as Draft
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : 'Save Invoice'}
        </button>
      </div>
    </form>
  )
}

