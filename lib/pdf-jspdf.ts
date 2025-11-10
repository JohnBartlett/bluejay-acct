import { jsPDF } from 'jspdf'
import { Invoice, Customer, Company, InvoiceItem } from '@prisma/client'
import { getPrintConfig } from './invoice-config-loader'
import { formatInvoiceDate } from './date-formatter'
import { formatCurrency } from './currency-formatter'

interface InvoiceWithRelations extends Invoice {
  customer: Customer
  company: Company
  items: InvoiceItem[]
}

export async function generateInvoicePDF(invoice: InvoiceWithRelations): Promise<Buffer> {
  // Validate invoice data
  if (!invoice) {
    throw new Error('Invoice data is required')
  }
  if (!invoice.company) {
    throw new Error('Company data is required')
  }
  if (!invoice.customer) {
    throw new Error('Customer data is required')
  }
  if (!invoice.items || !Array.isArray(invoice.items)) {
    throw new Error('Invoice items are required')
  }

  const config = getPrintConfig()

  // Initialize PDF with config settings
  const doc = new jsPDF({
    orientation: config.layout.orientation,
    unit: 'mm',
    format: config.layout.pageSize as 'letter' | 'a4',
  })

  // Set PDF metadata if configured
  if (config.print?.pdfMetadata) {
    doc.setProperties({
      title: config.print.pdfMetadata.title,
      author: config.print.pdfMetadata.author,
      subject: config.print.pdfMetadata.subject,
      keywords: config.print.pdfMetadata.keywords.join(', '),
    })
  }

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = config.layout.margin
  const contentWidth = pageWidth - 2 * margin
  let yPosition = margin
  let currentPage = 1

  // Helper function to add text with word wrapping
  const addText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 10, fontStyle: string = 'normal', color?: number[]) => {
    if (!text) return 0
    try {
      doc.setFontSize(fontSize)
      doc.setFont('helvetica', fontStyle)
      if (color && color.length === 3) {
        doc.setTextColor(color[0], color[1], color[2])
      }
      const textStr = String(text).trim()
      if (!textStr) return 0
      
      const lines = doc.splitTextToSize(textStr, maxWidth)
      if (Array.isArray(lines) && lines.length > 0) {
        const lineHeight = fontSize * 0.35
        lines.forEach((line, index) => {
          doc.text(line, x, y + (index * lineHeight))
        })
        return lines.length * lineHeight
      } else {
        doc.text(textStr, x, y)
        return fontSize * 0.35
      }
    } finally {
      doc.setTextColor(0, 0, 0) // Reset to black
    }
  }

  // Helper function to draw a filled rectangle
  const drawRect = (x: number, y: number, width: number, height: number, color: number[]) => {
    doc.setFillColor(color[0], color[1], color[2])
    doc.rect(x, y, width, height, 'F')
  }

  // Helper function to format address with proper line breaks
  const formatAddress = (address: string | null): string[] => {
    if (!address) return []
    return address.split(/\n|\\n/).filter(line => line.trim())
  }

  // Helper function to format phone number
  const formatPhoneNumber = (phone: string | null): string => {
    if (!phone) return ''
    const phoneDigits = phone.replace(/\D/g, '')
    return phoneDigits.length === 10
      ? `(${phoneDigits.slice(0, 3)}) ${phoneDigits.slice(3, 6)}-${phoneDigits.slice(6)}`
      : phone
  }

  // Helper function to add page numbers
  const addPageNumber = () => {
    if (config.print?.includePageNumbers) {
      const totalPages = doc.getNumberOfPages()
      const pageNumText = `Page ${currentPage} of ${totalPages}`
      const position = config.print.pageNumberPosition || 'bottom-right'
      
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(config.colors.darkGray[0], config.colors.darkGray[1], config.colors.darkGray[2])
      
      if (position === 'bottom-right') {
        doc.text(pageNumText, pageWidth - margin - 5, pageHeight - 10, { align: 'right' as const })
      } else if (position === 'bottom-left') {
        doc.text(pageNumText, margin + 5, pageHeight - 10)
      } else if (position === 'bottom-center') {
        doc.text(pageNumText, pageWidth / 2, pageHeight - 10, { align: 'center' as const })
      }
    }
  }

  // Helper function to add watermark
  const addWatermark = () => {
    if (config.watermark?.enabled) {
      const watermark = config.watermark
      const centerX = pageWidth / 2
      const centerY = pageHeight / 2
      
      // Calculate lighter color based on opacity
      const alphaColor = watermark.color.map(c => Math.round(c + (255 - c) * (1 - watermark.opacity)))
      
      doc.setFontSize(watermark.fontSize)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(alphaColor[0], alphaColor[1], alphaColor[2])
      
      // Rotate and draw watermark text
      // jsPDF text method supports angle parameter
      try {
        doc.text(watermark.text, centerX, centerY, {
          align: 'center' as const,
          angle: watermark.rotation,
        })
      } catch (error) {
        // Fallback if angle not supported - draw without rotation
        console.warn('Watermark rotation not supported, drawing without rotation:', error)
        doc.text(watermark.text, centerX, centerY, {
          align: 'center' as const,
        })
      }
      
      doc.setTextColor(0, 0, 0)
    }
  }

  // Helper function to redraw table header on new page
  const redrawTableHeader = () => {
    const headerY = yPosition
    const headerRowHeight = config.typography.tableHeader.size * 1.5
    
    if (config.table.headerBackground) {
      drawRect(margin, headerY, contentWidth, headerRowHeight, config.table.headerBackground)
    }
    
    doc.setFontSize(config.typography.tableHeader.size)
    doc.setFont('helvetica', config.typography.tableHeader.style)
    const headerTextColor = config.table.headerTextColor || config.colors.darkGray
    doc.setTextColor(headerTextColor[0], headerTextColor[1], headerTextColor[2])
    
    if (config.table.columns.includes('Service')) {
      doc.text('Service', margin + 5, headerY + headerRowHeight * 0.7)
    }
    if (config.table.columns.includes('Hours')) {
      const hoursX = config.table.columns.includes('Amount') 
        ? pageWidth - margin - 60
        : pageWidth - margin - 5
      doc.text('Hours', hoursX, headerY + headerRowHeight * 0.7, { align: 'right' as const })
    }
    if (config.table.columns.includes('Amount')) {
      doc.text('Amount', pageWidth - margin - 5, headerY + headerRowHeight * 0.7, { align: 'right' as const })
    }
    
    doc.setTextColor(0, 0, 0)
    yPosition = headerY + headerRowHeight + config.table.rowSpacing
  }

  // Helper function to check if new page needed
  const checkNewPage = (requiredHeight: number, redrawHeader: boolean = false) => {
    if (yPosition + requiredHeight > pageHeight - (margin + 20)) {
      addPageNumber()
      doc.addPage()
      currentPage++
      yPosition = margin
      addWatermark()
      if (redrawHeader) {
        redrawTableHeader()
      }
      return true
    }
    return false
  }

  // Add watermark to first page
  addWatermark()

  // Company Info section
  if (config.sections.companyInfo) {
    const companyNameX = margin
    yPosition = margin
    
    // Company name
    doc.setFontSize(config.typography.companyName.size)
    doc.setFont('helvetica', config.typography.companyName.style)
    doc.setTextColor(config.colors.darkGray[0], config.colors.darkGray[1], config.colors.darkGray[2])
    doc.text(invoice.company.name || 'Company Name', companyNameX, yPosition)
    yPosition += config.typography.companyName.size * 0.5
    
    // Company address
    const companyAddressLines = formatAddress(invoice.company.address)
    companyAddressLines.forEach((line) => {
      doc.setFontSize(config.typography.body.size)
      doc.setFont('helvetica', config.typography.body.style)
      doc.text(line.trim(), companyNameX, yPosition)
      yPosition += config.typography.body.size * 0.5
    })
    
    // Company email
    if (invoice.company.email) {
      doc.setFontSize(config.typography.body.size)
      doc.setFont('helvetica', config.typography.body.style)
      doc.text(invoice.company.email, companyNameX, yPosition)
      yPosition += config.typography.body.size * 0.5
    }
    
    // Company phone
    if (invoice.company.phone) {
      doc.setFontSize(config.typography.body.size)
      doc.setFont('helvetica', config.typography.body.style)
      doc.text(formatPhoneNumber(invoice.company.phone), companyNameX, yPosition)
      yPosition += config.typography.body.size * 0.5
    }
  }

  // Invoice title and number (right aligned)
  doc.setFontSize(config.typography.invoiceTitle.size)
  doc.setFont('helvetica', config.typography.invoiceTitle.style)
  doc.setTextColor(config.colors.primary[0], config.colors.primary[1], config.colors.primary[2])
  doc.text('INVOICE', pageWidth - margin - 5, margin, { align: 'right' as const })
  
  doc.setFontSize(config.typography.invoiceNumber.size)
  doc.setFont('helvetica', config.typography.invoiceNumber.style)
  doc.setTextColor(config.colors.darkGray[0], config.colors.darkGray[1], config.colors.darkGray[2])
  doc.text(`#${invoice.invoiceNumber}`, pageWidth - margin - 5, margin + config.typography.invoiceTitle.size * 0.5, { align: 'right' as const })

  yPosition += config.layout.sectionSpacing

  // Bill To section
  if (config.sections.billTo) {
    const billToStartY = yPosition
    const billToWidth = contentWidth / 2 - 5
    
    // Calculate height needed
    let billToY = billToStartY + config.typography.body.size * 0.5
    if (invoice.customer.name) billToY += config.typography.body.size * 0.5 + 2
    const customerAddressLines = formatAddress(invoice.customer.address)
    billToY += customerAddressLines.length * (config.typography.body.size * 0.5 + 1)
    if (invoice.customer.email) billToY += config.typography.body.size * 0.5 + 1
    if (invoice.customer.phone) billToY += config.typography.body.size * 0.5
    
    const billToHeight = billToY - billToStartY + 5
    
    // Draw background box
    drawRect(margin, billToStartY, billToWidth, billToHeight, config.colors.lightGray)
    
    // Bill To label
    doc.setFontSize(config.typography.body.size)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(config.colors.darkGray[0], config.colors.darkGray[1], config.colors.darkGray[2])
    doc.text('BILL TO:', margin + 5, billToStartY + config.typography.body.size * 0.5)
    
    // Customer name
    billToY = billToStartY + config.typography.body.size * 1.2
    doc.setFontSize(config.typography.body.size)
    doc.setFont('helvetica', config.typography.body.style)
    doc.setTextColor(config.colors.darkGray[0], config.colors.darkGray[1], config.colors.darkGray[2])
    if (invoice.customer.name) {
      addText(invoice.customer.name, margin + 5, billToY, billToWidth - 10, config.typography.body.size, config.typography.body.style, config.colors.darkGray)
      billToY += config.typography.body.size * 0.5 + 2
    }
    
    // Customer address
    customerAddressLines.forEach((line) => {
      if (line.trim()) {
        addText(line.trim(), margin + 5, billToY, billToWidth - 10, config.typography.body.size, config.typography.body.style, config.colors.darkGray)
        billToY += config.typography.body.size * 0.5 + 1
      }
    })
    
    // Customer email
    if (invoice.customer.email) {
      addText(invoice.customer.email, margin + 5, billToY, billToWidth - 10, config.typography.body.size, config.typography.body.style, config.colors.darkGray)
      billToY += config.typography.body.size * 0.5 + 1
    }
    
    // Customer phone
    if (invoice.customer.phone) {
      addText(formatPhoneNumber(invoice.customer.phone), margin + 5, billToY, billToWidth - 10, config.typography.body.size, config.typography.body.style, config.colors.darkGray)
    }
    
    yPosition = billToStartY + billToHeight + config.layout.sectionSpacing
  }

  // Invoice dates (right aligned)
  if (config.sections.invoiceDates) {
    let dateY = margin + config.typography.invoiceTitle.size * 0.5 + config.typography.invoiceNumber.size * 0.5 + 2
    
    doc.setFontSize(config.typography.body.size)
    doc.setFont('helvetica', config.typography.body.style)
    doc.setTextColor(config.colors.darkGray[0], config.colors.darkGray[1], config.colors.darkGray[2])
    
    const invoiceDateStr = formatInvoiceDate(invoice.date, config.dateFormat.format, config.dateFormat.locale)
    doc.text(`Invoice Date: ${invoiceDateStr}`, pageWidth - margin - 5, dateY, { align: 'right' as const })
    dateY += config.typography.body.size * 0.5 + 2
    
    if (invoice.dueDate) {
      const dueDateStr = formatInvoiceDate(invoice.dueDate, config.dateFormat.format, config.dateFormat.locale)
      doc.text(`Due Date: ${dueDateStr}`, pageWidth - margin - 5, dateY, { align: 'right' as const })
    }
  }

  // Items table
  if (config.sections.itemsTable) {
    checkNewPage(30)
    
    const headerY = yPosition
    const headerRowHeight = config.typography.tableHeader.size * 1.5
    
    // Table header background
    if (config.table.headerBackground) {
      drawRect(margin, headerY, contentWidth, headerRowHeight, config.table.headerBackground)
    }
    
    // Table header text
    doc.setFontSize(config.typography.tableHeader.size)
    doc.setFont('helvetica', config.typography.tableHeader.style)
    const headerTextColor = config.table.headerTextColor || config.colors.darkGray
    doc.setTextColor(headerTextColor[0], headerTextColor[1], headerTextColor[2])
    
    if (config.table.columns.includes('Service')) {
      doc.text('Service', margin + 5, headerY + headerRowHeight * 0.7)
    }
    if (config.table.columns.includes('Hours')) {
      // Position Hours column - right align, leave space for Amount
      const hoursX = config.table.columns.includes('Amount') 
        ? pageWidth - margin - 60  // Leave space for Amount column
        : pageWidth - margin - 5
      doc.text('Hours', hoursX, headerY + headerRowHeight * 0.7, { align: 'right' as const })
    }
    if (config.table.columns.includes('Amount')) {
      doc.text('Amount', pageWidth - margin - 5, headerY + headerRowHeight * 0.7, { align: 'right' as const })
    }
    
    doc.setTextColor(0, 0, 0)
    yPosition = headerY + headerRowHeight + config.table.rowSpacing

    // Invoice items
    invoice.items.forEach((item, index) => {
      checkNewPage(15, true) // Redraw header on new page
      
      const itemStartY = yPosition
      const baseRowHeight = config.typography.body.size * 1.5
      let itemHeight = baseRowHeight
      
      // Calculate item height based on content
      if (item.longDescription) {
        const longDescLines = doc.splitTextToSize(item.longDescription, 100)
        itemHeight = Math.max(itemHeight, baseRowHeight + longDescLines.length * config.typography.body.size * 0.4)
      }
      
      // Row background (if alternating rows enabled)
      if (config.table.showAlternatingRows && index % 2 === 1) {
        drawRect(margin, itemStartY, contentWidth, itemHeight, config.colors.lightGray)
      }
      
      // Service column
      if (config.table.columns.includes('Service')) {
        doc.setFontSize(config.typography.body.size)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(config.colors.darkGray[0], config.colors.darkGray[1], config.colors.darkGray[2])
        let serviceY = itemStartY + config.typography.body.size * 0.5
        addText(item.description || '', margin + 5, serviceY, 100, config.typography.body.size, 'bold', config.colors.darkGray)
        
        if (item.longDescription) {
          serviceY += config.typography.body.size * 0.5 + 1
          doc.setFont('helvetica', 'italic')
          addText(item.longDescription, margin + 5, serviceY, 100, config.typography.body.size * 0.9, 'italic', config.colors.darkGray)
        }
      }
      
      // Hours column
      if (config.table.columns.includes('Hours')) {
        doc.setFontSize(config.typography.body.size)
        doc.setFont('helvetica', config.typography.body.style)
        doc.setTextColor(config.colors.darkGray[0], config.colors.darkGray[1], config.colors.darkGray[2])
        const hours = item.type === 'TIME' ? (item.hours || 0) : (item.quantity || 0)
        const hoursX = config.table.columns.includes('Amount') 
          ? pageWidth - margin - 60  // Leave space for Amount column
          : pageWidth - margin - 5
        doc.text(
          hours.toFixed(config.currency.decimalPlaces),
          hoursX,
          itemStartY + config.typography.body.size * 0.5,
          { align: 'right' as const }
        )
      }
      
      // Amount column
      if (config.table.columns.includes('Amount')) {
        doc.setFontSize(config.typography.body.size)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(config.colors.darkGray[0], config.colors.darkGray[1], config.colors.darkGray[2])
        const amountStr = formatCurrency(item.amount || 0, config.currency)
        doc.text(
          amountStr,
          pageWidth - margin - 5,
          itemStartY + config.typography.body.size * 0.5,
          { align: 'right' as const }
        )
      }
      
      // Draw border between rows
      if (config.table.borderWidth && config.table.borderColor) {
        doc.setDrawColor(config.table.borderColor[0], config.table.borderColor[1], config.table.borderColor[2])
        doc.setLineWidth(config.table.borderWidth)
        doc.line(margin, itemStartY + itemHeight, pageWidth - margin, itemStartY + itemHeight)
      }
      
      yPosition += itemHeight + config.table.rowSpacing
    })
    
    yPosition += config.layout.sectionSpacing
  }

  // Totals section
  if (config.sections.totals) {
    checkNewPage(30)
    
    const totalsBoxWidth = 80
    const totalsBoxX = pageWidth - margin - totalsBoxWidth
    const totalsBoxHeight = 25
    
    // Draw totals box
    if (config.table.borderWidth && config.table.borderColor) {
      doc.setDrawColor(config.table.borderColor[0], config.table.borderColor[1], config.table.borderColor[2])
      doc.setLineWidth(config.table.borderWidth)
      doc.setFillColor(config.colors.lightGray[0], config.colors.lightGray[1], config.colors.lightGray[2])
      doc.rect(totalsBoxX, yPosition, totalsBoxWidth, totalsBoxHeight, 'FD')
    }
    
    let totalsY = yPosition + config.typography.body.size * 0.8
    
    // Subtotal
    doc.setFontSize(config.typography.body.size)
    doc.setFont('helvetica', config.typography.body.style)
    doc.setTextColor(config.colors.darkGray[0], config.colors.darkGray[1], config.colors.darkGray[2])
    doc.text('Subtotal:', totalsBoxX + 5, totalsY)
    doc.text(
      formatCurrency(invoice.subtotal || 0, config.currency),
      pageWidth - margin - 5,
      totalsY,
      { align: 'right' as const }
    )
    totalsY += config.typography.body.size * 0.8
    
    // Tax
    doc.text('Tax:', totalsBoxX + 5, totalsY)
    doc.text(
      formatCurrency(invoice.tax || 0, config.currency),
      pageWidth - margin - 5,
      totalsY,
      { align: 'right' as const }
    )
    totalsY += config.typography.body.size * 0.8 + 2
    
    // Divider
    if (config.table.borderWidth && config.table.borderColor) {
      doc.setDrawColor(config.table.borderColor[0], config.table.borderColor[1], config.table.borderColor[2])
      doc.setLineWidth(config.table.borderWidth)
      doc.line(totalsBoxX + 5, totalsY, pageWidth - margin - 5, totalsY)
      totalsY += config.typography.body.size * 0.8
    }
    
    // Total
    doc.setFontSize(config.typography.total.size)
    doc.setFont('helvetica', config.typography.total.style)
    doc.setTextColor(config.colors.darkGray[0], config.colors.darkGray[1], config.colors.darkGray[2])
    doc.text('Total:', totalsBoxX + 5, totalsY)
    doc.text(
      formatCurrency(invoice.total || 0, config.currency),
      pageWidth - margin - 5,
      totalsY,
      { align: 'right' as const }
    )
    
    yPosition += totalsBoxHeight + config.layout.sectionSpacing
  }

  // Notes section
  if (config.sections.notes && invoice.notes && invoice.notes.trim()) {
    checkNewPage(20)
    
    const notesText = String(invoice.notes).trim()
    const notesLines = doc.splitTextToSize(notesText, contentWidth - 10)
    const notesBoxHeight = Math.max(15, notesLines.length * config.typography.body.size * 0.5 + 10)
    
    // Notes box
    if (config.table.borderWidth && config.table.borderColor) {
      doc.setDrawColor(config.table.borderColor[0], config.table.borderColor[1], config.table.borderColor[2])
      doc.setLineWidth(config.table.borderWidth)
      doc.setFillColor(config.colors.lightGray[0], config.colors.lightGray[1], config.colors.lightGray[2])
      doc.rect(margin, yPosition, contentWidth, notesBoxHeight, 'FD')
    }
    
    // Notes label
    doc.setFontSize(config.typography.body.size)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(config.colors.darkGray[0], config.colors.darkGray[1], config.colors.darkGray[2])
    doc.text('Notes:', margin + 5, yPosition + config.typography.body.size * 0.8)
    
    // Notes content
    doc.setFont('helvetica', config.typography.body.style)
    addText(notesText, margin + 5, yPosition + config.typography.body.size * 1.2, contentWidth - 10, config.typography.body.size, config.typography.body.style, config.colors.darkGray)
    
    yPosition += notesBoxHeight + config.layout.sectionSpacing
  }

  // Footer
  if (config.sections.footer && config.footer) {
    checkNewPage(15)
    
    if (config.footer.showThankYou) {
      doc.setFontSize(config.typography.body.size)
      doc.setFont('helvetica', config.typography.body.style)
      doc.setTextColor(config.colors.darkGray[0], config.colors.darkGray[1], config.colors.darkGray[2])
      doc.text(
        'Thank you for your business!',
        pageWidth / 2,
        yPosition,
        { align: 'center' as const }
      )
      yPosition += config.typography.body.size * 0.8
    }
    
    if (config.footer.text) {
      doc.setFontSize(config.typography.body.size * 0.9)
      doc.setFont('helvetica', 'italic')
      doc.setTextColor(config.colors.darkGray[0], config.colors.darkGray[1], config.colors.darkGray[2])
      doc.text(
        config.footer.text,
        pageWidth / 2,
        yPosition,
        { align: 'center' as const }
      )
    }
  }

  // Add page numbers to all pages
  const totalPages = doc.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    currentPage = i
    addPageNumber()
    if (i === 1) {
      addWatermark() // Add watermark to first page
    }
  }

  // Convert to buffer
  const pdfArrayBuffer = doc.output('arraybuffer')
  const pdfBuffer = Buffer.from(pdfArrayBuffer)

  return pdfBuffer
}
