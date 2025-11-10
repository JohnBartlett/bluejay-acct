# User Guide

## Getting Started

### First Time Setup

1. **Configure Company Information**
   - Navigate to Settings
   - Enter your company name, address, email, and phone
   - Save your information

2. **Add Customers**
   - Go to Customers
   - Click "Add Customer"
   - Fill in customer information (name, email, address, phone)
   - The system will automatically format names, addresses, and phone numbers

3. **Create Your First Invoice**
   - Go to Invoices
   - Click "Create Invoice"
   - Select a customer
   - Add invoice items (Time, Service, or Product)
   - Set tax rates if needed
   - Add notes if desired
   - Save as draft or send immediately

## Features

### Invoices

#### Creating an Invoice

1. Click "Create Invoice" from the Invoices page
2. Select a customer from the dropdown
3. Set invoice date and due date
4. Add items using the menu at the top:
   - **Add Time**: For hourly billing
     - Enter description
     - Set date
     - Enter hours
     - Set hourly rate
     - Add long description if needed
   - **Add Service**: For service billing
     - Enter description
     - Set quantity
     - Set unit price
     - Add long description if needed
   - **Add Product**: For product sales
     - Enter description
     - Set quantity
     - Set unit price
     - Add long description if needed
5. Set tax rates (per item or state taxes)
6. Add credit card processing fee if applicable
7. Add notes (choose from predefined options or custom)
8. Review totals
9. Save as draft or send immediately

#### Editing an Invoice

1. Go to Invoices page
2. Click on an invoice to view it
3. Click "Edit"
4. Make your changes
5. Save

#### Sending Invoices

1. View an invoice
2. Click "Send Email"
3. The invoice PDF will be attached to the email
4. You can track when the email is opened

#### Printing Invoices

1. View an invoice
2. Click "Print"
3. The print view will show only the invoice (no sidebar/header)

### Customers

#### Adding a Customer

1. Go to Customers
2. Click "Add Customer"
3. Enter customer information:
   - Name (will be formatted automatically)
   - Email
   - Address (will be formatted automatically)
   - Phone (will be formatted as (XXX) XXX-XXXX)
4. Click "Create Customer"

#### Editing a Customer

1. Go to Customers
2. Click on a customer
3. Click "Edit"
4. Make your changes
5. Save

### Dashboard

The dashboard provides an overview of your business:

- **Overdue Invoices**: See which invoices are overdue
- **Cash Flow**: Visualize money in and out
- **Profit and Loss**: See income vs expenses
- **Expenses Breakdown**: See where money is going
- **Net Income**: Compare fiscal years
- **Payable and Owing**: Track what's owed to you and what you owe

**Toggle Dummy/Real Data**: Use the checkbox in the top right to switch between dummy data (for testing) and real data from your invoices.

### Settings

#### Company Information

- Update company name, address, email, and phone
- This information appears on all invoices

#### Time Entry Templates

- Create templates for common time entries
- Use templates to quickly add time items to invoices

## Tips

1. **Save as Draft**: Always save invoices as draft first to review before sending
2. **Long Descriptions**: Use long descriptions to provide detailed information about work performed
3. **Tax Rates**: Set tax rates per item type (Time, Service, Product) for accurate calculations
4. **Email Tracking**: Check invoice view to see when emails were sent and opened
5. **Print Preview**: Use the print view to see exactly how invoices will look when printed

## Keyboard Shortcuts

(To be implemented)

## Troubleshooting

### Invoice totals not calculating correctly
- Ensure all item amounts are entered
- Check that tax rates are set correctly
- Verify quantities and rates are entered

### Email not sending
- Check that customer email is entered
- Verify Resend API key is configured
- Check email logs in Resend dashboard

### PDF not generating
- Ensure all invoice data is complete
- Check server logs for errors
- Verify invoice has at least one item

## Support

For issues or questions, please refer to the documentation or contact support.

