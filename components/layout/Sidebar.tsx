'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  LayoutDashboard,
  CreditCard,
  ShoppingCart,
  Receipt,
  Scale,
  Building2,
  FileText,
  BarChart3,
  Users,
  Gift,
  Plus,
  ChevronDown,
  ChevronUp,
  Settings,
} from 'lucide-react'

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  {
    icon: CreditCard,
    label: 'Sales & Payments',
    href: '/sales',
    children: [
      { label: 'Estimates', href: '/sales/estimates' },
      { label: 'Invoices', href: '/invoices' },
      { label: 'Payments', href: '/sales/payments' },
      { label: 'Recurring Invoices', href: '/sales/recurring' },
      { label: 'Checkouts', href: '/sales/checkouts' },
      { label: 'Customer Statements', href: '/sales/statements' },
      { label: 'Customers', href: '/customers' },
      { label: 'Products & Services', href: '/sales/products' },
    ],
  },
  { icon: ShoppingCart, label: 'Purchases', href: '/purchases' },
  { icon: Receipt, label: 'Receipts', href: '/receipts' },
  {
    icon: Scale,
    label: 'Accounting',
    href: '/accounting',
    children: [
      { label: 'Transactions', href: '/accounting/transactions' },
      { label: 'Reconciliation', href: '/accounting/reconciliation' },
      { label: 'Chart of Accounts', href: '/accounting/chart' },
      { label: 'Hire a Bookkeeper', href: '/accounting/bookkeeper' },
    ],
  },
  { icon: Building2, label: 'Banking', href: '/banking' },
  { icon: FileText, label: 'Payroll', href: '/payroll' },
  { icon: BarChart3, label: 'Reports', href: '/reports' },
  { icon: Users, label: 'Wave Advisors', href: '/advisors' },
  { icon: Gift, label: 'Perks', href: '/perks', badge: 'New' },
  { icon: Settings, label: 'Settings', href: '/settings' },
]

export function Sidebar() {
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<string[]>(['/invoices'])

  const toggleExpand = (href: string) => {
    setExpandedItems((prev) =>
      prev.includes(href)
        ? prev.filter((item) => item !== href)
        : [...prev, href]
    )
  }

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname?.startsWith(href) || false
  }

  const isExpanded = (href: string) => expandedItems.includes(href)

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col" data-sidebar>
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-lg">B</span>
          </div>
          <span className="text-blue-600 font-semibold text-xl">BlueJay</span>
        </div>
      </div>

      <div className="p-4 border-b border-gray-200">
        <button className="w-full flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
          <Plus className="w-5 h-5" />
          <span className="font-medium">Create new</span>
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            const expanded = isExpanded(item.href)
            const hasChildren = item.children && item.children.length > 0

            return (
              <li key={item.href}>
                <div>
                  <Link
                    href={item.href}
                    onClick={(e) => {
                      if (hasChildren) {
                        e.preventDefault()
                        toggleExpand(item.href)
                      }
                    }}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      active
                        ? 'bg-blue-50 text-blue-600 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full">
                        {item.badge}
                      </span>
                    )}
                    {hasChildren &&
                      (expanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      ))}
                  </Link>
                  {hasChildren && expanded && (
                    <ul className="ml-8 mt-1 space-y-1">
                      {item.children?.map((child) => (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                              pathname === child.href
                                ? 'text-blue-600 font-medium bg-blue-50'
                                : 'text-gray-600 hover:bg-gray-50'
                            }`}
                          >
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}

