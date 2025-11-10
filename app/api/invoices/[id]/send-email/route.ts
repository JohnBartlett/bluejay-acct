import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { sendInvoiceEmail } from '@/lib/email'
import { generateInvoicePDF } from '@/lib/pdf-jspdf'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        customer: true,
        company: true,
        items: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    })

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      )
    }

    if (!invoice.customer.email) {
      return NextResponse.json(
        { error: 'Customer email not available' },
        { status: 400 }
      )
    }

    // Generate PDF using pdfkit
    let pdfBuffer: Buffer
    try {
      pdfBuffer = await generateInvoicePDF(invoice)
    } catch (pdfError) {
      console.error('Error generating PDF:', pdfError)
      return NextResponse.json(
        { error: 'Failed to generate PDF', details: pdfError instanceof Error ? pdfError.message : String(pdfError) },
        { status: 500 }
      )
    }

    // Send email
    try {
      await sendInvoiceEmail(
        invoice.customer.email,
        invoice.invoiceNumber,
        pdfBuffer,
        invoice.customer.name,
        id
      )
    } catch (emailError) {
      console.error('Error sending email:', emailError)
      return NextResponse.json(
        { error: 'Failed to send email', details: emailError instanceof Error ? emailError.message : String(emailError) },
        { status: 500 }
      )
    }

    // Update invoice status and email sent timestamp
    await prisma.invoice.update({
      where: { id },
      data: { 
        status: 'SENT',
        emailSentAt: new Date(),
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error sending invoice email:', error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      { error: 'Failed to send invoice email', details: errorMessage },
      { status: 500 }
    )
  }
}

