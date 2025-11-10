import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendInvoiceEmail(
  to: string,
  invoiceNumber: string,
  pdfBuffer: Buffer,
  customerName: string,
  invoiceId: string
) {
  try {
    const trackingUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/invoices/${invoiceId}/track-open`
    
    const { data, error } = await resend.emails.send({
      from: process.env.FROM_EMAIL || 'noreply@example.com',
      to,
      subject: `Invoice ${invoiceNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Invoice ${invoiceNumber}</h2>
          <p>Dear ${customerName},</p>
          <p>Please find attached your invoice ${invoiceNumber}.</p>
          <p>Thank you for your business!</p>
          <!-- Tracking pixel -->
          <img src="${trackingUrl}" width="1" height="1" style="display:none;" alt="" />
        </div>
      `,
      attachments: [
        {
          filename: `invoice-${invoiceNumber}.pdf`,
          content: pdfBuffer.toString('base64'),
          type: 'application/pdf',
        },
      ],
    })

    if (error) {
      console.error('Resend API error:', error)
      throw new Error(`Failed to send email: ${JSON.stringify(error)}`)
    }

    return data
  } catch (error) {
    console.error('Error sending email:', error)
    throw error
  }
}

