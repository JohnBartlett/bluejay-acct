# Developer Guide

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- npm or yarn

### Setup

```bash
# Clone the repository
git clone https://github.com/JohnBartlett/bluejay-acct.git
cd bluejay-acct

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Generate Prisma client
npm run db:generate

# Push database schema
npm run db:push

# Start development server
npm run dev
```

## Project Structure

### App Router (Next.js 16)

- `app/` - Next.js App Router pages and API routes
- `app/api/` - API route handlers
- `components/` - React components
- `lib/` - Utility functions and libraries
- `prisma/` - Database schema and migrations

### Key Files

- `lib/db.ts` - Prisma client initialization
- `lib/email.ts` - Email sending functionality
- `lib/pdf-jspdf.ts` - PDF generation
- `lib/format.ts` - Formatting utilities
- `prisma/schema.prisma` - Database schema

## Development Workflow

### Adding a New Feature

1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes
3. Test locally
4. Commit changes: `git commit -m "Add feature"`
5. Push: `git push origin feature/your-feature`
6. Create pull request

### Database Changes

1. Update `prisma/schema.prisma`
2. Generate migration: `npm run db:migrate`
3. Or push changes (dev): `npm run db:push`
4. Regenerate Prisma client: `npm run db:generate`

### Adding API Routes

Create files in `app/api/` following Next.js App Router conventions:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  // Handle GET request
}

export async function POST(request: NextRequest) {
  // Handle POST request
}
```

### Adding Pages

Create files in `app/` directory:

```typescript
export default function MyPage() {
  return <div>My Page</div>
}
```

### Adding Components

Create files in `components/`:

```typescript
'use client' // If using hooks

export function MyComponent() {
  return <div>My Component</div>
}
```

## Code Style

- Use TypeScript for all files
- Use functional components with hooks
- Follow React best practices
- Use Tailwind CSS for styling
- Follow existing code patterns

## Testing

(To be implemented)

## Common Tasks

### Adding a New Invoice Field

1. Update `prisma/schema.prisma`:
```prisma
model Invoice {
  // ... existing fields
  newField String?
}
```

2. Run migration: `npm run db:migrate`
3. Update API routes to handle new field
4. Update forms to include new field
5. Update PDF generation if needed

### Adding a New Page

1. Create `app/my-page/page.tsx`
2. Add route to sidebar if needed
3. Add version component

### Adding Email Functionality

1. Use `sendInvoiceEmail` from `lib/email.ts` as reference
2. Configure Resend API key
3. Test email sending

## Debugging

### Database Issues

- Use Prisma Studio: `npm run db:studio`
- Check database logs
- Verify connection string

### PDF Generation Issues

- Check `lib/pdf-jspdf.ts` for errors
- Verify invoice data is complete
- Check server logs

### Email Issues

- Verify Resend API key
- Check Resend dashboard for logs
- Verify domain is configured

## Performance

- Use database indexes for frequently queried fields
- Implement pagination for large lists
- Cache frequently accessed data
- Optimize database queries

## Security

- Never commit `.env` files
- Validate all user input
- Use parameterized queries (Prisma handles this)
- Implement authentication (TODO)
- Add rate limiting (TODO)
- Add CSRF protection (TODO)

## Version

Current version: 1.0.0

