import { InvoiceConfig } from './invoice-config'
import displayConfig from '@/config/invoice-display.json'
import printConfig from '@/config/invoice-print.json'

/**
 * Loads the invoice display configuration from JSON file
 * @returns InvoiceConfig object for screen display settings
 */
export function getDisplayConfig(): InvoiceConfig {
  return displayConfig as InvoiceConfig
}

/**
 * Loads the invoice print/PDF configuration from JSON file
 * @returns InvoiceConfig object for PDF generation settings
 */
export function getPrintConfig(): InvoiceConfig {
  return printConfig as InvoiceConfig
}

