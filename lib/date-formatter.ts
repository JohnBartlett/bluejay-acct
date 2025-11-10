import { format, parse } from 'date-fns'

/**
 * Format a date according to the invoice configuration format string
 * Uses date-fns format function with fallback to default format on error
 * @param date - Date object or ISO date string
 * @param formatString - date-fns format string (e.g., "MMMM d, yyyy" for "January 15, 2025")
 * @param locale - Locale string (default: 'en-US')
 * @returns Formatted date string
 */
export function formatInvoiceDate(
  date: Date | string,
  formatString: string,
  locale: string = 'en-US'
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  // Use date-fns format function
  try {
    return format(dateObj, formatString)
  } catch (error) {
    // Fallback to default format if format string is invalid
    console.warn('Invalid date format string, using default:', error)
    return format(dateObj, 'MMMM d, yyyy')
  }
}

