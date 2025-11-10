export interface InvoiceConfig {
  colors: {
    primary: [number, number, number]
    darkGray: [number, number, number]
    lightGray: [number, number, number]
    borderGray: [number, number, number]
  }
  layout: {
    pageSize: string
    orientation: 'portrait' | 'landscape'
    margin: number
    headerHeight: number
    sectionSpacing: number
  }
  typography: {
    companyName: { size: number; style: string }
    invoiceTitle: { size: number; style: string }
    invoiceNumber: { size: number; style: string }
    body: { size: number; style: string }
    tableHeader: { size: number; style: string }
    total: { size: number; style: string }
  }
  logo: {
    enabled: boolean
    text: string
    size: number
    position: { x: number; y: number | string }
    backgroundColor: string
  }
  sections: {
    logo: boolean
    companyInfo: boolean
    billTo: boolean
    invoiceDates: boolean
    itemsTable: boolean
    totals: boolean
    notes: boolean
    footer: boolean
  }
  table: {
    columns: string[]
    showAlternatingRows: boolean
    rowSpacing: number
    borderWidth?: number
    borderColor?: [number, number, number]
    headerBackground?: [number, number, number]
    headerTextColor?: [number, number, number]
  }
  dateFormat: {
    format: string
    locale: string
  }
  currency: {
    symbol: string
    decimalPlaces: number
    locale: string
    placement?: 'before' | 'after'
  }
  footer?: {
    text: string
    showThankYou: boolean
  }
  print?: {
    includePageNumbers: boolean
    pageNumberPosition: string
    dpi: number
    bleed: number
    backgroundPrint: boolean
    printHeader: boolean
    printFooter: boolean
    pdfMetadata: {
      title: string
      author: string
      subject: string
      keywords: string[]
    }
  }
  export?: {
    fileNamePattern: string
    includeTimestamp: boolean
    timestampFormat: string
    openAfterExport: boolean
    compression: string
  }
  watermark?: {
    enabled: boolean
    text: string
    opacity: number
    rotation: number
    fontSize: number
    color: [number, number, number]
    position: string
  }
}

