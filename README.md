# BlueBird Accounting Application

A modern business accounting application built with Next.js, TypeScript, and PostgreSQL. Designed specifically for consultants who bill hourly, with support for services and products.

## Features

- **Dashboard**: Financial overview with charts and key metrics
- **Invoicing**: 
  - Create invoices with time entries (hourly billing), services, and products
  - Print invoices
  - Send invoices via email
  - Visual invoice form builder
- **Customer Management**: Track customers and their information
- **Reports**: View financial reports and analytics

## Tech Stack

- **Frontend**: Next.js 14+ (App Router) with TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Email**: Resend API
- **Charts**: Recharts
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ installed
- PostgreSQL database
- Resend API key (for email functionality)

### Installation

1. Clone the repository and install dependencies:

```bash
npm install
```

2. Set up environment variables:

Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/bluebirdacct?schema=public"
RESEND_API_KEY="your_resend_api_key_here"
FROM_EMAIL="noreply@yourdomain.com"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

3. Set up the database:

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed initial data (creates default company, user, and sample customers)
npm run db:seed

# (Optional) Open Prisma Studio to manage data
npm run db:studio
```

4. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
/app
  /api              # API routes
  /dashboard        # Dashboard page
  /invoices         # Invoice pages (list, create, view, edit, print, builder)
  /components       # React components
    /layout         # Layout components (Sidebar, Header)
    /invoices       # Invoice-related components
/prisma
  schema.prisma     # Database schema
/lib
  db.ts            # Prisma client
  email.ts         # Email utilities
```

## Key Features for Consultants

### Hourly Billing

- Add time entries with date, hours worked, and hourly rate
- Automatic calculation of time entry amounts
- Support for multiple time entries per invoice

### Services & Products

- Add service items with quantity and unit price
- Add product/hardware items with quantity and unit price
- All line items clearly labeled by type

### Invoice Management

- Create, edit, view, and delete invoices
- Filter invoices by status (Draft, Sent, Paid, Overdue)
- Search invoices by number or customer name
- Print invoices with professional formatting
- Send invoices via email with PDF attachment

### Invoice Form Builder

- Customize invoice template layout
- Enable/disable invoice sections
- Reorder invoice sections
- Preview changes before saving

## Database Schema

- **Company**: Company information and settings
- **User**: Application users
- **Customer**: Customer information
- **Invoice**: Invoice records
- **InvoiceItem**: Line items (TIME, SERVICE, or PRODUCT)
- **TimeEntryTemplate**: Templates for common time entries

## API Routes

- `GET/POST /api/invoices` - List/create invoices
- `GET/PUT/DELETE /api/invoices/[id]` - Invoice CRUD operations
- `POST /api/invoices/[id]/send-email` - Send invoice email
- `GET/POST /api/customers` - List/create customers
- `GET /api/dashboard/stats` - Dashboard statistics
- `GET/POST /api/invoices/template` - Invoice template management

## Development

### Running in Development Mode

```bash
npm run dev
```

### Building for Production

```bash
npm run build
npm start
```

### Database Migrations

```bash
# Create a new migration
npm run db:migrate

# Push schema changes without migration
npm run db:push
```

## Notes

- The application currently uses a default company ID. In production, implement proper authentication and multi-tenancy.
- Email functionality requires a Resend API key. For development, you can use nodemailer or mock the email sending.
- PDF generation for email attachments is simplified. Consider using a proper PDF library like `@react-pdf/renderer` or `puppeteer` for production.

## License

ISC

