# BlueJay Accounting Application

A modern business accounting application built with Next.js, TypeScript, and PostgreSQL. Designed specifically for consultants who bill hourly, with support for services and products.

**Version:** 1.2.0

## Documentation

- [Architecture](docs/ARCHITECTURE.md) - System architecture and technical overview
- [API Documentation](docs/API.md) - API endpoints and usage
- [Database Schema](docs/DATABASE.md) - Database models and relationships
- [Deployment Guide](docs/DEPLOYMENT.md) - How to deploy the application
- [User Guide](docs/USER_GUIDE.md) - End-user documentation
- [Developer Guide](docs/DEVELOPER_GUIDE.md) - Development setup and guidelines
- [TODO](TODO.md) - Remaining tasks and planned features
- [CHANGELOG](CHANGELOG.md) - Version history and changes

## Features

- **Dashboard**: Financial overview with charts and key metrics
- **Invoicing**: 
  - Create invoices with time entries (hourly billing), services, and products
  - Print invoices
  - Send invoices via email
  - Visual invoice form builder
  - Configurable invoice formatting (colors, typography, layout, sections)
  - Customizable PDF generation with watermark and metadata support
- **Estimates/Quotes**: 
  - Create, edit, view, and delete estimates
  - Estimate status tracking (DRAFT, SENT, ACCEPTED, REJECTED, EXPIRED, CONVERTED)
  - Print estimates
  - Send estimates via email with PDF attachment
  - Configurable estimate formatting (colors, typography, layout, sections)
  - Customizable PDF generation
- **Template Library**:
  - Save reusable invoice and estimate templates with line items, tax defaults, and notes
  - Manage templates from dedicated list/detail pages with edit/delete actions
  - Launch template creation experiences directly from the sidebar
- **Customer Management**: Track customers and their information
- **AI Assistance**:
  - Generate entire estimates or templates from natural language descriptions using Claude
  - Auto-fill long descriptions, notes, and suggested pricing for invoice and estimate templates
  - Built-in health check endpoint to verify Claude connectivity
- **Reports**: Comprehensive financial reporting with 6 report types
  - Profit & Loss
  - Accounts Receivable Aging
  - Sales by Customer
  - Sales by Type
  - Tax Summary
  - Invoice Summary
- **Settings**: 
  - Company information management
  - Starting invoice number configuration for sequential numbering
  - Time entry templates
  - Invoice display and print/PDF customization
  - Estimate display and print/PDF customization
- **Estimate → Invoice Workflow**:
  - Convert an approved estimate into a draft invoice with one click
  - Automatically generate the next invoice number based on company settings
  - Preserve line items, notes, and totals when converting

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
- Claude API key (for AI-powered template and estimate generation)

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
CLAUDE_API_KEY="your_claude_api_key_here"
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
  /invoice-templates # Invoice template library and AI-assisted creation
  /estimates        # Estimate pages (list, create, view, edit, print)
  /estimate-templates # Estimate template management
  /components       # React components
    /layout         # Layout components (Sidebar, Header)
    /invoices       # Invoice-related components
    /estimates      # Estimate-related components
/prisma
  schema.prisma     # Database schema
/lib
  db.ts                    # Prisma client
  email.ts                 # Email utilities
  invoice-config.ts        # Invoice configuration TypeScript types
  invoice-config-loader.ts # Invoice configuration loader functions
  estimate-config.ts       # Estimate configuration TypeScript types
  estimate-config-loader.ts # Estimate configuration loader functions
  date-formatter.ts        # Date formatting utilities
  currency-formatter.ts    # Currency formatting utilities
  pdf-jspdf.ts             # Invoice PDF generation using jsPDF
  pdf-estimate-jspdf.ts    # Estimate PDF generation using jsPDF
/config
  invoice-display.json     # Invoice display configuration
  invoice-print.json       # Invoice print/PDF configuration
  estimate-display.json    # Estimate display configuration
  estimate-print.json     # Estimate print/PDF configuration
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

### Template Library & AI Assistants

- Create dedicated invoice and estimate templates with names, descriptions, and reusable line items
- Use the built-in Claude-powered generator to describe a template or estimate in natural language and let AI draft the structure, line items, and client-facing wording
- Apply template defaults for taxes, notes, and pricing to speed up new invoices/estimates
- Manage templates through list, detail, and edit pages with delete protection

## Database Schema

- **Company**: Company information and settings
- **User**: Application users
- **Customer**: Customer information
- **Invoice**: Invoice records
- **InvoiceItem**: Line items (TIME, SERVICE, or PRODUCT)
- **Estimate**: Estimate/quote records
- **EstimateItem**: Estimate line items (TIME, SERVICE, or PRODUCT)
- **TimeEntryTemplate**: Templates for common time entries

## API Routes

- `GET/POST /api/invoices` - List/create invoices
- `GET/PUT/DELETE /api/invoices/[id]` - Invoice CRUD operations
- `POST /api/invoices/[id]/send-email` - Send invoice email
- `POST /api/invoices/template` - Save/load the legacy invoice form builder template
- `GET/POST /api/estimates` - List/create estimates
- `GET/PUT/DELETE /api/estimates/[id]` - Estimate CRUD operations
- `POST /api/estimates/[id]/send-email` - Send estimate email
- `POST /api/estimates/[id]/convert-to-invoice` - Convert estimate data into a draft invoice
- `GET/POST /api/customers` - List/create customers
- `GET /api/dashboard/stats` - Dashboard statistics
- `GET/POST /api/invoice-templates` - List/create invoice templates
- `GET/PUT/DELETE /api/invoice-templates/[id]` - Manage a single invoice template
- `GET/POST /api/estimate-templates` - List/create estimate templates
- `GET/PUT/DELETE /api/estimate-templates/[id]` - Manage a single estimate template
- `GET/PUT /api/invoice-config` - Load/save invoice configuration (display and print)
- `GET/PUT /api/estimate-config` - Load/save estimate configuration (display and print)
- `GET /api/reports/[reportId]` - Generate financial reports (profit-loss, accounts-receivable, sales-by-customer, sales-by-type, tax-summary, invoice-summary)
- `POST /api/ai/generate-estimate` - AI-generated estimate draft
- `POST /api/ai/generate-invoice-template` - AI-generated invoice template draft
- `POST /api/ai/generate-estimate-template` - AI-generated estimate template draft

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
- `https://app.2cch.com` is fronted by Cloudflare and proxied into the local dev machine via `cloudflared`. Two launch agents (`com.bluebird.devserver`, `com.bluebird.tunnel`) auto-start the Next.js dev server and tunnel after every reboot. Use `launchctl list | grep bluebird` to confirm they are running, and check logs under `~/Library/Logs/BlueBird/`.

## License

ISC
