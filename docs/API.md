# API Documentation

## Overview

BlueJay Accounting provides RESTful API endpoints for managing invoices, customers, and other business data.

## Base URL

All API routes are prefixed with `/api`

## Authentication

Currently using a default company ID. In production, this should be replaced with proper authentication.

## Endpoints

### Invoices

#### GET /api/invoices
Get all invoices with optional filtering.

**Query Parameters:**
- `status` (optional): Filter by status (DRAFT, SENT, PAID, OVERDUE)
- `search` (optional): Search by invoice number or customer name

**Response:**
```json
[
  {
    "id": "string",
    "invoiceNumber": "string",
    "date": "ISO date string",
    "dueDate": "ISO date string",
    "status": "DRAFT|SENT|PAID|OVERDUE",
    "subtotal": number,
    "tax": number,
    "total": number,
    "customer": { "name": "string", "email": "string" },
    "items": [...]
  }
]
```

#### POST /api/invoices
Create a new invoice.

**Request Body:**
```json
{
  "customerId": "string",
  "date": "ISO date string",
  "dueDate": "ISO date string",
  "items": [
    {
      "type": "TIME|SERVICE|PRODUCT",
      "description": "string",
      "longDescription": "string (optional)",
      "hours": number (for TIME),
      "hourlyRate": number (for TIME),
      "quantity": number (for SERVICE/PRODUCT),
      "unitPrice": number (for SERVICE/PRODUCT),
      "amount": number,
      "tax": number,
      "itemTax": number,
      "stateTax": number,
      "date": "ISO date string (for TIME)"
    }
  ],
  "notes": "string (optional)",
  "creditCardFee": number (optional),
  "creditCardFeePercent": number (optional)
}
```

#### GET /api/invoices/[id]
Get a specific invoice by ID.

#### PUT /api/invoices/[id]
Update an existing invoice.

#### DELETE /api/invoices/[id]
Delete an invoice.

#### POST /api/invoices/[id]/send-email
Send invoice email with PDF attachment.

#### GET /api/invoices/[id]/track-open
Track email open (used by tracking pixel).

### Customers

#### GET /api/customers
Get all customers.

#### POST /api/customers
Create a new customer.

**Request Body:**
```json
{
  "name": "string",
  "email": "string",
  "address": "string (optional)",
  "phone": "string (optional)"
}
```

#### GET /api/customers/[id]
Get a specific customer.

#### PUT /api/customers/[id]
Update a customer.

#### DELETE /api/customers/[id]
Delete a customer.

### Dashboard

#### GET /api/dashboard/stats
Get dashboard statistics.

**Response:**
```json
{
  "totalRevenue": number,
  "overdueInvoices": number,
  "totalInvoices": number,
  "paidInvoices": number,
  "draftInvoices": number
}
```

### Company

#### GET /api/company
Get company information.

#### PUT /api/company
Update company information.

### Time Templates

#### GET /api/time-templates
Get all time entry templates.

#### POST /api/time-templates
Create a time entry template.

#### GET /api/time-templates/[id]
Get a specific template.

#### PUT /api/time-templates/[id]
Update a template.

#### DELETE /api/time-templates/[id]
Delete a template.

## Error Responses

All errors return a JSON object with an `error` field:

```json
{
  "error": "Error message",
  "details": "Additional error details (optional)"
}
```

## Status Codes

- `200` - Success
- `400` - Bad Request
- `404` - Not Found
- `500` - Internal Server Error

