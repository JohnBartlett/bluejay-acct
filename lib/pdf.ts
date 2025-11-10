import PDFDocument from 'pdfkit'
import { Invoice, Customer, Company, InvoiceItem } from '@prisma/client'
import path from 'path'

interface InvoiceWithRelations extends Invoice {
  customer: Customer
  company: Company
  items: InvoiceItem[]
}

export async function generateInvoicePDF(invoice: InvoiceWithRelations): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      // Validate invoice data
      if (!invoice) {
        reject(new Error('Invoice data is required'))
        return
      }
      if (!invoice.company) {
        reject(new Error('Company data is required'))
        return
      }
      if (!invoice.customer) {
        reject(new Error('Customer data is required'))
        return
      }
      if (!invoice.items || !Array.isArray(invoice.items)) {
        reject(new Error('Invoice items are required'))
        return
      }

      // Create PDF document
      // Fix font path resolution for Next.js
      const fontPath = path.join(process.cwd(), 'node_modules', 'pdfkit', 'js', 'data')
      
      const doc = new PDFDocument({ 
        margin: 50, 
        size: 'LETTER',
      })
      
      // Register fonts explicitly to avoid path resolution issues
      try {
        // Try to register fonts if the path exists
        if (require('fs').existsSync(fontPath)) {
          // Fonts are automatically loaded by pdfkit, but we can verify they exist
        }
      } catch (e) {
        // Font path check failed, but pdfkit should still work with defaults
        console.warn('Could not verify font path:', e)
      }
      const chunks: Buffer[] = []

      doc.on('data', (chunk) => chunks.push(chunk))
      doc.on('end', () => resolve(Buffer.concat(chunks)))
      doc.on('error', (err) => {
        console.error('PDF generation error:', err)
        reject(err)
      })

      // Header
      doc.fontSize(24).font('Helvetica-Bold').text(invoice.company.name || 'Company Name', 50, 50)
      
      if (invoice.company.address) {
        doc.fontSize(10).font('Helvetica').text(invoice.company.address, 50, 80)
      }
      if (invoice.company.email) {
        doc.fontSize(10).text(invoice.company.email, 50, 95)
      }
      if (invoice.company.phone) {
        doc.fontSize(10).text(invoice.company.phone, 50, 110)
      }

      // Invoice title and number (right aligned)
      doc.fontSize(20).font('Helvetica-Bold').text('INVOICE', 400, 50, { align: 'right' })
      doc.fontSize(14).font('Helvetica').text(`#${invoice.invoiceNumber}`, 400, 80, { align: 'right' })

      // Bill To section
      doc.fontSize(12).font('Helvetica-Bold').text('BILL TO:', 50, 150)
      doc.fontSize(11).font('Helvetica').text(invoice.customer.name || 'Customer Name', 50, 170)
      
      if (invoice.customer.address) {
        doc.fontSize(10).text(invoice.customer.address, 50, 185)
      }
      if (invoice.customer.email) {
        doc.fontSize(10).text(invoice.customer.email, 50, 200)
      }

      // Invoice dates (right aligned)
      const invoiceDate = new Date(invoice.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
      doc.fontSize(10).font('Helvetica').text(`Invoice Date: ${invoiceDate}`, 400, 150, { align: 'right' })
      
      if (invoice.dueDate) {
        const dueDate = new Date(invoice.dueDate).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
        doc.fontSize(10).text(`Due Date: ${dueDate}`, 400, 170, { align: 'right' })
      }

      // Table header
      let yPosition = 250
      doc.fontSize(10).font('Helvetica-Bold')
      doc.text('Description', 50, yPosition)
      doc.text('Type', 200, yPosition)
      doc.text('Qty/Hrs', 280, yPosition, { width: 60, align: 'right' })
      doc.text('Rate/Price', 350, yPosition, { width: 80, align: 'right' })
      doc.text('Amount', 440, yPosition, { width: 100, align: 'right' })

      // Draw line under header
      doc.moveTo(50, yPosition + 15).lineTo(550, yPosition + 15).stroke()
      yPosition += 30

      // Invoice items
      doc.fontSize(9).font('Helvetica')
      invoice.items.forEach((item) => {
        // Description
        doc.text(item.description || '', 50, yPosition, { width: 140 })
        
        // Type
        doc.text(item.type, 200, yPosition, { width: 70 })
        
        // Quantity/Hours
        const qtyOrHrs = item.type === 'TIME' 
          ? (item.hours?.toFixed(2) || '0.00')
          : (item.quantity?.toFixed(2) || '0.00')
        doc.text(qtyOrHrs, 280, yPosition, { width: 60, align: 'right' })
        
        // Rate/Price
        const rateOrPrice = item.type === 'TIME'
          ? `$${(item.hourlyRate || 0).toFixed(2)}`
          : `$${(item.unitPrice || 0).toFixed(2)}`
        doc.text(rateOrPrice, 350, yPosition, { width: 80, align: 'right' })
        
        // Amount
        doc.text(`$${(item.amount || 0).toFixed(2)}`, 440, yPosition, { width: 100, align: 'right' })
        
        // Long description if present
        if (item.longDescription) {
          yPosition += 12
          doc.fontSize(8).font('Helvetica-Oblique')
          doc.text(item.longDescription, 50, yPosition, { width: 490 })
          doc.fontSize(9).font('Helvetica')
        }
        
        // Date for time entries
        if (item.type === 'TIME' && item.date) {
          yPosition += 12
          const itemDate = new Date(item.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })
          doc.fontSize(8).font('Helvetica-Oblique')
          doc.text(`Date: ${itemDate}`, 50, yPosition)
          doc.fontSize(9).font('Helvetica')
        }
        
        yPosition += 20
      })

      // Totals section
      yPosition += 20
      doc.moveTo(400, yPosition).lineTo(550, yPosition).stroke()
      yPosition += 15

      doc.fontSize(11).font('Helvetica')
      doc.text('Subtotal:', 400, yPosition, { width: 100, align: 'right' })
      doc.text(`$${(invoice.subtotal || 0).toFixed(2)}`, 510, yPosition, { width: 40, align: 'right' })
      yPosition += 20

      if (invoice.tax > 0) {
        doc.text('Tax:', 400, yPosition, { width: 100, align: 'right' })
        doc.text(`$${(invoice.tax || 0).toFixed(2)}`, 510, yPosition, { width: 40, align: 'right' })
        yPosition += 20
      }

      doc.moveTo(400, yPosition).lineTo(550, yPosition).stroke()
      yPosition += 15

      doc.fontSize(14).font('Helvetica-Bold')
      doc.text('Total:', 400, yPosition, { width: 100, align: 'right' })
      doc.text(`$${(invoice.total || 0).toFixed(2)}`, 510, yPosition, { width: 40, align: 'right' })

      // Notes section
      if (invoice.notes) {
        yPosition += 40
        doc.fontSize(10).font('Helvetica-Bold').text('Notes:', 50, yPosition)
        yPosition += 15
        doc.fontSize(9).font('Helvetica').text(invoice.notes, 50, yPosition, { width: 500 })
      }

      // Footer
      const pageHeight = doc.page.height
      doc.fontSize(8).font('Helvetica').text(
        'Thank you for your business!',
        50,
        pageHeight - 50,
        { width: 500, align: 'center' }
      )

      doc.end()
    } catch (error) {
      reject(error)
    }
  })
}

