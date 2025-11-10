import { InvoiceConfig } from './invoice-config'

/**
 * Format currency according to invoice configuration
 * @param amount - The numeric amount to format
 * @param config - Currency configuration object with symbol, decimal places, locale, and placement
 * @returns Formatted currency string (e.g., "$1,234.56" or "1,234.56$")
 */
export function formatCurrency(
  amount: number,
  config: InvoiceConfig['currency']
): string {
  const formatted = new Intl.NumberFormat(config.locale, {
    minimumFractionDigits: config.decimalPlaces,
    maximumFractionDigits: config.decimalPlaces,
  }).format(amount)
  
  return config.placement === 'after' 
    ? `${formatted}${config.symbol}`
    : `${config.symbol}${formatted}`
}

