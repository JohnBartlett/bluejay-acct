# Database Documentation

## Overview

BlueJay Accounting uses PostgreSQL as the database with Prisma ORM for type-safe database access.

## Schema

### User Model
```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Company Model
```prisma
model Company {
  id            String   @id @default(cuid())
  name          String
  address       String?
  email         String?
  phone         String?
  currency      String   @default("USD")
  fiscalYearEnd String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  invoices      Invoice[]
}
```

### Customer Model
```prisma
model Customer {
  id        String    @id @default(cuid())
  name      String
  email     String?
  address   String?
  phone     String?
  companyId String
  company   Company  @relation(fields: [companyId], references: [id])
  invoices  Invoice[]
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}
```

### Invoice Model
```prisma
model Invoice {
  id            String        @id @default(cuid())
  invoiceNumber String        @unique
  date          DateTime
  dueDate       DateTime?
  status        InvoiceStatus @default(DRAFT)
  subtotal      Float         @default(0)
  tax           Float         @default(0)
  total         Float         @default(0)
  notes         String?
  creditCardFee Float?
  companyId     String
  customerId    String
  company       Company       @relation(fields: [companyId], references: [id])
  customer      Customer      @relation(fields: [customerId], references: [id])
  items         InvoiceItem[]
  emailSentAt   DateTime?
  emailOpenedAt DateTime?
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
}
```

### InvoiceItem Model
```prisma
model InvoiceItem {
  id             String         @id @default(cuid())
  type           InvoiceItemType
  description    String
  longDescription String?
  date           DateTime?      // For TIME items
  hours          Float?         // For TIME items
  hourlyRate     Float?         // For TIME items
  quantity       Float?         // For SERVICE/PRODUCT items
  unitPrice      Float?         // For SERVICE/PRODUCT items
  amount         Float
  tax            Float          @default(0)
  itemTax        Float          @default(0)  // Per-item tax rate
  stateTax       Float          @default(0)  // State tax
  invoiceId      String
  invoice        Invoice        @relation(fields: [invoiceId], references: [id], onDelete: Cascade)
  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt
}
```

### TimeEntryTemplate Model
```prisma
model TimeEntryTemplate {
  id          String   @id @default(cuid())
  description String
  hourlyRate  Float
  companyId   String
  company     Company  @relation(fields: [companyId], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

## Enums

### InvoiceStatus
- `DRAFT` - Invoice is in draft state
- `SENT` - Invoice has been sent to customer
- `PAID` - Invoice has been paid
- `OVERDUE` - Invoice is overdue

### InvoiceItemType
- `TIME` - Time-based billing
- `SERVICE` - Service billing
- `PRODUCT` - Product billing

## Relationships

- Company → Invoices (one-to-many)
- Company → Customers (one-to-many)
- Company → TimeEntryTemplates (one-to-many)
- Customer → Invoices (one-to-many)
- Invoice → InvoiceItems (one-to-many, cascade delete)

## Database Operations

### Prisma Client

The Prisma client is initialized in `lib/db.ts`:

```typescript
import { PrismaClient } from '@/src/generated/prisma'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

### Common Queries

**Get invoice with relations:**
```typescript
const invoice = await prisma.invoice.findUnique({
  where: { id },
  include: {
    customer: true,
    company: true,
    items: {
      orderBy: { createdAt: 'asc' }
    }
  }
})
```

**Create invoice with items (transaction):**
```typescript
await prisma.$transaction(async (tx) => {
  const invoice = await tx.invoice.create({ data: {...} })
  await tx.invoiceItem.createMany({ data: items })
  return invoice
})
```

## Migrations

Database migrations are managed through Prisma:

```bash
# Create a new migration
npm run db:migrate

# Push schema changes without migration (dev only)
npm run db:push

# Generate Prisma client
npm run db:generate
```

## Seeding

Database seeding is handled in `prisma/seed.ts`:

```bash
npm run db:seed
```

## Current Limitations

- Using `DEFAULT_COMPANY_ID` instead of proper multi-tenant architecture
- No user authentication/authorization
- No database indexes defined (should be added for production)
- No soft deletes (deletions are permanent)

