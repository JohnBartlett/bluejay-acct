import { jsPDF } from 'jspdf'
import { Invoice, Customer, Company, InvoiceItem } from '@prisma/client'

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

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'letter',
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  const contentWidth = pageWidth - 2 * margin
  let yPosition = margin

  // Color scheme (RGB values 0-255)
  const primaryColor = [41, 99, 235] // Blue-600
  const darkGray = [31, 41, 55] // Gray-800
  const lightGray = [243, 244, 246] // Gray-100
  const borderGray = [229, 231, 235] // Gray-200

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
        // Render each line separately to avoid array issues
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
    // Split by newlines or common separators
    return address.split(/\n|\\n/).filter(line => line.trim())
  }

  // Header section with logo
  const headerHeight = 32
  drawRect(margin, margin, contentWidth, headerHeight, lightGray)
  
  // Logo (jfB) - styled text logo in top left - larger, but fits within header box
  const logoX = margin + 5
  const logoSize = 12 // Reduced slightly to ensure it fits: headerHeight is 32, need padding
  const logoY = margin + (headerHeight - logoSize * 2) / 2 // Center vertically within header box
  
  // Draw square background (simpler and more compatible)
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2])
  doc.rect(logoX, logoY, logoSize * 2, logoSize * 2, 'F')
  
  // Draw white text on blue square - larger font
  doc.setFontSize(10) // Adjusted for logo size
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(255, 255, 255)
  doc.text('jfB', logoX + logoSize - 3, logoY + logoSize + 1.5) // Centered in logo square
  doc.setTextColor(0, 0, 0) // Reset to black
  
  // Company name - positioned next to logo
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
  const companyNameX = logoX + logoSize * 2 + 8
  yPosition = margin + 8
  doc.text(invoice.company.name || 'Company Name', companyNameX, yPosition)
  doc.setTextColor(0, 0, 0) // Reset to black
  
  // Company details - properly formatted with line breaks
  yPosition += 6
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2])
  
  const companyAddressLines = formatAddress(invoice.company.address)
  companyAddressLines.forEach((line) => {
    doc.text(line.trim(), companyNameX, yPosition)
    yPosition += 4
  })
  
  if (invoice.company.email) {
    doc.text(invoice.company.email, companyNameX, yPosition)
    yPosition += 4
  }
  if (invoice.company.phone) {
    // Format phone number to (XXX) XXX-XXXX format
    const phoneDigits = invoice.company.phone.replace(/\D/g, '')
    const formattedPhone = phoneDigits.length === 10
      ? `(${phoneDigits.slice(0, 3)}) ${phoneDigits.slice(3, 6)}-${phoneDigits.slice(6)}`
      : invoice.company.phone
    doc.text(formattedPhone, companyNameX, yPosition)
  }

  // Invoice title and number (right aligned in header) - consistent typography
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
  doc.text('INVOICE', pageWidth - margin - 5, margin + 8, { align: 'right' as const })
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2])
  doc.text(`#${invoice.invoiceNumber}`, pageWidth - margin - 5, margin + 15, { align: 'right' as const })
  
  // Invoice dates - more compact
  const invoiceDate = new Date(invoice.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
  doc.setFontSize(8)
  doc.text(`Invoice Date: ${invoiceDate}`, pageWidth - margin - 5, margin + 21, { align: 'right' as const })
  
  if (invoice.dueDate) {
    const dueDate = new Date(invoice.dueDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
    doc.text(`Due Date: ${dueDate}`, pageWidth - margin - 5, margin + 26, { align: 'right' as const })
  }

  doc.setTextColor(0, 0, 0) // Reset to black
  yPosition = margin + headerHeight + 10

  // Bill To section - properly formatted with shaded box
  const billToWidth = contentWidth / 2 - 5
  const billToStartY = yPosition
  
  // First, calculate all content to determine height needed
  let billToY = billToStartY + 12 // Start position for content
  
  // Calculate customer name height
  const customerNameHeight = invoice.customer.name 
    ? (9 * 0.35) // Approximate height for one line
    : 0
  
  billToY += customerNameHeight + 2.5
  
  // Calculate address lines height
  const customerAddressLines = formatAddress(invoice.customer.address)
  let addressHeight = 0
  customerAddressLines.forEach(() => {
    addressHeight += (8 * 0.35) + 1.5 // Line height + spacing
  })
  billToY += addressHeight
  
  // Calculate email height
  if (invoice.customer.email) {
    billToY += (8 * 0.35) + 1.5
  }
  
  // Calculate phone height
  if (invoice.customer.phone) {
    billToY += (8 * 0.35)
  }
  
  // Calculate total height needed
  const billToHeight = billToY - billToStartY + 5 // Add bottom padding
  
  // Draw shaded box first
  drawRect(margin, billToStartY, billToWidth, billToHeight, [250, 250, 250])
  
  // Now draw all text content on top of the box
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2])
  doc.text('BILL TO:', margin + 5, billToStartY + 7)
  
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(0, 0, 0)
  billToY = billToStartY + 12
  
  // Customer name
  if (invoice.customer.name) {
    const nameHeight = addText(invoice.customer.name, margin + 5, billToY, billToWidth - 10, 9)
    billToY += nameHeight + 2.5
  }
  
  // Customer address - properly formatted with tighter spacing
  customerAddressLines.forEach((line) => {
    if (line.trim()) {
      const lineHeight = addText(line.trim(), margin + 5, billToY, billToWidth - 10, 8)
      billToY += lineHeight + 1.5
    }
  })
  
  if (invoice.customer.email) {
    const emailHeight = addText(invoice.customer.email, margin + 5, billToY, billToWidth - 10, 8)
    billToY += emailHeight + 1.5
  }
  
  // Customer phone number - added to BILL TO block
  if (invoice.customer.phone) {
    // Format phone number to (XXX) XXX-XXXX format
    const phoneDigits = invoice.customer.phone.replace(/\D/g, '')
    const formattedPhone = phoneDigits.length === 10
      ? `(${phoneDigits.slice(0, 3)}) ${phoneDigits.slice(3, 6)}-${phoneDigits.slice(6)}`
      : invoice.customer.phone
    addText(formattedPhone, margin + 5, billToY, billToWidth - 10, 8)
  }
  
  yPosition = billToStartY + billToHeight + 8

  // Table header with colored background
  const headerY = yPosition
  const headerRowHeight = 8
  drawRect(margin, headerY, contentWidth, headerRowHeight, primaryColor)
  
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(255, 255, 255) // White text on colored background
  doc.text('Type', margin + 3, headerY + 6) // Type first
  doc.text('Description', margin + 35, headerY + 6)
  doc.text('Qty/Hrs', margin + 95, headerY + 6, { align: 'right' as const })
  doc.text('Rate/Price', margin + 125, headerY + 6, { align: 'right' as const })
  doc.text('Amount', pageWidth - margin - 3, headerY + 6, { align: 'right' as const })
  doc.setTextColor(0, 0, 0) // Reset to black
  
  yPosition = headerY + headerRowHeight + 2

  // Invoice items with alternating row colors
  doc.setFont('helvetica', 'normal')
  let rowIndex = 0
  invoice.items.forEach((item) => {
    // Check if we need a new page
    if (yPosition > pageHeight - 80) {
      doc.addPage()
      yPosition = margin
      // Redraw table header on new page
      drawRect(margin, yPosition, contentWidth, headerRowHeight, primaryColor)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(255, 255, 255)
      doc.text('Type', margin + 3, yPosition + 6) // Type first
      doc.text('Description', margin + 35, yPosition + 6)
      doc.text('Qty/Hrs', margin + 95, yPosition + 6, { align: 'right' as const })
      doc.text('Rate/Price', margin + 125, yPosition + 6, { align: 'right' as const })
      doc.text('Amount', pageWidth - margin - 3, yPosition + 6, { align: 'right' as const })
      doc.setTextColor(0, 0, 0)
      yPosition += headerRowHeight + 2
      rowIndex = 0
    }

    const itemStartY = yPosition
    const baseRowHeight = 12
    
    // Calculate total height needed for this item
    let itemHeight = baseRowHeight
    
    // Description text (main) - moved right to make room for Type column
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    const descText = item.description || ''
    const descHeight = addText(descText, margin + 35, yPosition + 7, 50, 8, 'bold') || 0
    
    // Long description if present - fixed spacing
    let longDescHeight = 0
    if (item.longDescription) {
      doc.setFontSize(7)
      doc.setFont('helvetica', 'italic')
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2])
      const longDescText = String(item.longDescription || '').trim()
      if (longDescText) {
        // Better spacing calculation - use actual line height
        const longDescY = yPosition + 7 + (descHeight || 0) + 2 // 2mm spacing after description
        longDescHeight = addText(longDescText, margin + 37, longDescY, 50, 7, 'italic', darkGray) || 0
      }
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(0, 0, 0)
    }
    
    // Date for time entries - fixed spacing to prevent overlap
    let dateHeight = 0
    if (item.type === 'TIME' && item.date) {
      const itemDate = new Date(item.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
      doc.setFontSize(7)
      doc.setFont('helvetica', 'italic')
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2])
      // Calculate date Y position properly - after description and long description with proper spacing
      const dateY = yPosition + 7 + (descHeight || 0) + (longDescHeight > 0 ? longDescHeight + 2 : 2) + 2
      if (!isNaN(dateY)) {
        doc.text(`Date: ${itemDate}`, margin + 37, dateY)
        dateHeight = 3.5 // Actual height needed for date line
      }
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(0, 0, 0)
    }
    
    // Calculate item height properly - base height + description + spacing + long desc + spacing + date
    const totalContentHeight = 7 + (descHeight || 0) + (longDescHeight > 0 ? longDescHeight + 2 : 0) + (dateHeight > 0 ? dateHeight + 1 : 0) + 5
    itemHeight = Math.max(baseRowHeight, isNaN(totalContentHeight) ? baseRowHeight : totalContentHeight)
    
    // Alternate row background color - draw full height
    if (rowIndex % 2 === 0) {
      drawRect(margin, yPosition, contentWidth, itemHeight, [255, 255, 255])
    } else {
      drawRect(margin, yPosition, contentWidth, itemHeight, lightGray)
    }
    
    // Type badge - first column, vertically centered, unified black color
    doc.setFontSize(7)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]) // Unified black/dark gray for all types
    const typeY = yPosition + itemHeight / 2
    if (!isNaN(typeY)) {
      doc.text(item.type, margin + 3, typeY) // Moved to first column
    }
    doc.setTextColor(0, 0, 0)
    
    // Redraw description on top of background - moved right
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    addText(descText, margin + 35, yPosition + 7, 50, 8, 'bold')
    
    if (item.longDescription) {
      doc.setFontSize(7)
      doc.setFont('helvetica', 'italic')
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2])
      const longDescText = String(item.longDescription || '').trim()
      if (longDescText) {
        // Use same calculation as above for consistency
        const longDescY = yPosition + 7 + (descHeight || 0) + 2
        addText(longDescText, margin + 37, longDescY, 50, 7, 'italic', darkGray)
      }
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(0, 0, 0)
    }
    
    if (item.type === 'TIME' && item.date) {
      const itemDate = new Date(item.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
      doc.setFontSize(7)
      doc.setFont('helvetica', 'italic')
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2])
      // Use same calculation as above for consistency
      const dateY = yPosition + 7 + (descHeight || 0) + (longDescHeight > 0 ? longDescHeight + 2 : 2) + 2
      if (!isNaN(dateY)) {
        doc.text(`Date: ${itemDate}`, margin + 37, dateY)
      }
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(0, 0, 0)
    }
    
    // Quantity/Hours - vertically centered
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    const qtyOrHrs = item.type === 'TIME' 
      ? (item.hours ? (isNaN(item.hours) ? '0.00' : item.hours.toFixed(2)) : '0.00')
      : (item.quantity ? (isNaN(item.quantity) ? '0.00' : item.quantity.toFixed(2)) : '0.00')
    if (!isNaN(typeY)) {
      doc.text(qtyOrHrs, margin + 95, typeY, { align: 'right' as const })
    }
    
    // Rate/Price - vertically centered
    const hourlyRate = item.hourlyRate && !isNaN(item.hourlyRate) ? item.hourlyRate : 0
    const unitPrice = item.unitPrice && !isNaN(item.unitPrice) ? item.unitPrice : 0
    const rateOrPrice = item.type === 'TIME'
      ? `$${hourlyRate.toFixed(2)}`
      : `$${unitPrice.toFixed(2)}`
    if (!isNaN(typeY)) {
      doc.text(rateOrPrice, margin + 125, typeY, { align: 'right' as const })
    }
    
    // Amount - bold for emphasis (standard for financial documents)
    const amount = item.amount && !isNaN(item.amount) ? item.amount : 0
    doc.setFont('helvetica', 'bold')
    if (!isNaN(typeY)) {
      doc.text(`$${amount.toFixed(2)}`, pageWidth - margin - 3, typeY, { align: 'right' as const })
    }
    doc.setFont('helvetica', 'normal')
    
    // Draw separation line between rows
    const lineY = yPosition + itemHeight
    doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2])
    doc.setLineWidth(0.2)
    doc.line(margin, lineY, pageWidth - margin, lineY)
    
    // Increased spacing between items
    yPosition += itemHeight + 3 // Increased from 1 to 3 for more margin
    rowIndex++
  })

  // Totals section with styled box - properly aligned
  yPosition += 8
  const totalsBoxWidth = 80
  const totalsBoxX = pageWidth - margin - totalsBoxWidth
  const totalsBoxHeight = 26 // Adjusted: 7 (top) + 5 (subtotal) + 5 (tax) + 6 (divider space) + 6 (total space) + 3 (bottom) = 32, but using 26 for compact
  
  // Draw totals box with border
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2])
  doc.setLineWidth(0.5)
  doc.setFillColor(250, 250, 250)
  doc.rect(totalsBoxX, yPosition, totalsBoxWidth, totalsBoxHeight, 'FD')
  
  let totalsY = yPosition + 7
  
  // Subtotal - properly aligned
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2])
  doc.text('Subtotal:', totalsBoxX + 5, totalsY)
  doc.setTextColor(0, 0, 0)
  doc.text(`$${(invoice.subtotal || 0).toFixed(2)}`, pageWidth - margin - 5, totalsY, { align: 'right' as const })
  totalsY += 5 // Reduced from 7 to 5 to bring Subtotal and Tax closer

  // Tax - properly aligned
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2])
  doc.text('Tax:', totalsBoxX + 5, totalsY)
  doc.setTextColor(0, 0, 0)
  doc.text(`$${(invoice.tax || 0).toFixed(2)}`, pageWidth - margin - 5, totalsY, { align: 'right' as const })
  totalsY += 6 // Increased from 4 to 6 for more margin above divider

  // Divider line - more margin above
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2])
  doc.setLineWidth(0.5)
  doc.line(totalsBoxX + 5, totalsY, pageWidth - margin - 5, totalsY)
  totalsY += 6 // Increased from 4 to 6 for more margin above Total

  // Total - bold and larger, properly aligned
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
  doc.text('Total:', totalsBoxX + 5, totalsY)
  doc.text(`$${(invoice.total || 0).toFixed(2)}`, pageWidth - margin - 5, totalsY, { align: 'right' as const })
  doc.setTextColor(0, 0, 0)
  
  yPosition += totalsBoxHeight + 8

  // Notes section with styled box - perfectly aligned with table above, more compact
  if (invoice.notes && invoice.notes.trim()) {
    const notesText = String(invoice.notes).trim()
    const notesLines = doc.splitTextToSize(notesText, contentWidth - 10)
    const notesBoxHeight = Math.max(15, notesLines.length * 3.5 + 6) // Reduced spacing (4 to 3.5, 8 to 6)
    
    // Notes box with border - aligned exactly with table (same margin and width)
    doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2])
    doc.setLineWidth(0.5)
    doc.setFillColor(252, 252, 252)
    doc.rect(margin, yPosition, contentWidth, notesBoxHeight, 'FD')
    
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2])
    doc.text('Notes:', margin + 5, yPosition + 5) // Reduced from 6 to 5
    
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(0, 0, 0)
    addText(notesText, margin + 5, yPosition + 9, contentWidth - 10, 8) // Reduced from 11 to 9
    yPosition += notesBoxHeight + 5 // Reduced from 8 to 5 for more compact spacing
  }

  // Footer with subtle line and attribution - increased bottom margin
  const footerY = pageHeight - 20 // Increased from 15 to 20 for better spacing
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2])
  doc.setLineWidth(0.3)
  doc.line(margin, footerY, pageWidth - margin, footerY)
  
  // Thank you message - increased spacing
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2])
  doc.text(
    'Thank you for your business!',
    pageWidth / 2,
    footerY + 6, // Increased from 5 to 6
    { align: 'center' as const }
  )
  
  // Made with BlueJay Accounting footer - increased spacing
  doc.setFontSize(7)
  doc.setFont('helvetica', 'italic')
  doc.setTextColor(156, 163, 175) // Gray-400 - individual RGB values, not array
  doc.text(
    'Made with BlueJay Accounting © 2025',
    pageWidth / 2,
    footerY + 11, // Increased from 9 to 11
    { align: 'center' as const }
  )
  doc.setTextColor(0, 0, 0)

  // Convert to buffer
  const pdfArrayBuffer = doc.output('arraybuffer')
  const pdfBuffer = Buffer.from(pdfArrayBuffer)

  return pdfBuffer
}
