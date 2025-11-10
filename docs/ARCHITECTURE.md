# Architecture Documentation

## Overview

BlueJay Accounting is a full-stack business accounting application built with Next.js 16, TypeScript, Prisma ORM, and PostgreSQL.

## Technology Stack

- **Frontend Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Email**: Resend API
- **PDF Generation**: jsPDF
- **Charts**: Recharts
- **Icons**: Lucide React
- **Forms**: React Hook Form

## Project Structure

```
BlueBirdAcct1/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard page
│   ├── invoices/          # Invoice pages
│   ├── customers/         # Customer pages
│   └── settings/          # Settings page
├── components/            # React components
│   ├── layout/           # Layout components (Sidebar, Header)
│   └── invoices/         # Invoice-related components
├── lib/                   # Utility libraries
│   ├── db.ts             # Prisma client
│   ├── email.ts          # Email sending (Resend)
│   ├── format.ts         # Formatting utilities
│   └── pdf-jspdf.ts      # PDF generation
├── prisma/               # Prisma schema and migrations
└── src/generated/prisma/ # Generated Prisma client
```

## Database Schema

### Models

- **User**: Application users
- **Company**: Company information
- **Customer**: Customer/client information
- **Invoice**: Invoice records
- **InvoiceItem**: Line items on invoices (TIME, SERVICE, PRODUCT)
- **TimeEntryTemplate**: Templates for time entries

## Key Features

### Invoicing
- Create, edit, view, and delete invoices
- Support for TIME, SERVICE, and PRODUCT items
- Per-item tax rates and state taxes
- Credit card processing fees
- Long descriptions for items
- Email sending with PDF attachment
- Email open tracking
- Print-friendly view

### Customers
- Create, edit, view, and delete customers
- Automatic formatting for names, addresses, and phone numbers

### Dashboard
- Cash flow visualization
- Profit and loss charts
- Expense breakdown
- Overdue invoices tracking
- Net income comparison
- Dummy/Real data toggle

### Settings
- Company information management
- Time entry templates

## API Routes

- `/api/invoices` - Invoice CRUD operations
- `/api/invoices/[id]` - Individual invoice operations
- `/api/invoices/[id]/send-email` - Send invoice email
- `/api/invoices/[id]/track-open` - Track email opens
- `/api/customers` - Customer CRUD operations
- `/api/customers/[id]` - Individual customer operations
- `/api/dashboard/stats` - Dashboard statistics
- `/api/company` - Company information
- `/api/time-templates` - Time entry templates

## Environment Variables

- `DATABASE_URL` - PostgreSQL connection string
- `RESEND_API_KEY` - Resend API key for email
- `FROM_EMAIL` - Sender email address
- `NEXT_PUBLIC_APP_URL` - Application URL for email tracking

## Development

### Setup
1. Install dependencies: `npm install`
2. Set up environment variables in `.env`
3. Generate Prisma client: `npm run db:generate`
4. Push database schema: `npm run db:push`
5. Seed database (optional): `npm run db:seed`
6. Run development server: `npm run dev`

### Database
- Prisma Studio: `npm run db:studio`
- Generate migrations: `npm run db:migrate`
- Push schema changes: `npm run db:push`

## Deployment

The application is configured for deployment with:
- PostgreSQL database
- Resend for email functionality
- Environment variables for configuration

## Version

Current version: 1.0.0

