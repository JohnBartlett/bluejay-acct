# Deployment Guide

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database (local or cloud)
- Resend account for email functionality
- Domain configured with Resend (for email sending)

## Environment Setup

### 1. Database Setup

Set up a PostgreSQL database and obtain the connection string:

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/bluejay_acct?schema=public"
```

### 2. Resend Setup

1. Sign up for a Resend account at https://resend.com
2. Create an API key
3. Verify your domain in Resend dashboard
4. Add DNS records (TXT, MX, SPF, DKIM) as instructed
5. Wait for domain verification

### 3. Environment Variables

Create a `.env` file in the project root:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/bluejay_acct?schema=public"
RESEND_API_KEY="re_xxxxxxxxxxxxx"
FROM_EMAIL="invoicing@yourdomain.com"
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
```

## Local Development

### Initial Setup

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Push database schema
npm run db:push

# (Optional) Seed database
npm run db:seed

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`

## Production Deployment

### Build

```bash
npm run build
```

### Start Production Server

```bash
npm start
```

### Environment Variables

Ensure all environment variables are set in your production environment:
- `DATABASE_URL`
- `RESEND_API_KEY`
- `FROM_EMAIL`
- `NEXT_PUBLIC_APP_URL`

### Database Migrations

Before deploying, run migrations:

```bash
npm run db:migrate
```

### Prisma Client Generation

The `postinstall` script automatically generates the Prisma client after `npm install`.

## Deployment Platforms

### Vercel

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy

### Docker

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build
RUN npm run db:generate

EXPOSE 3000

CMD ["npm", "start"]
```

### Other Platforms

The application can be deployed to any platform that supports Node.js:
- Railway
- Render
- DigitalOcean App Platform
- AWS Elastic Beanstalk
- Google Cloud Run

## Post-Deployment Checklist

- [ ] Verify database connection
- [ ] Verify email sending works
- [ ] Test invoice creation
- [ ] Test email sending
- [ ] Verify PDF generation
- [ ] Check email tracking pixel
- [ ] Test print functionality
- [ ] Verify all API endpoints work
- [ ] Check error handling
- [ ] Monitor logs for errors

## Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Check database is accessible from deployment environment
- Ensure database exists and schema is pushed

### Email Sending Issues
- Verify `RESEND_API_KEY` is correct
- Check domain is verified in Resend
- Verify `FROM_EMAIL` matches verified domain
- Check Resend dashboard for error logs

### PDF Generation Issues
- Ensure all dependencies are installed
- Check server logs for errors
- Verify invoice data is complete

## Monitoring

Consider setting up:
- Application monitoring (Sentry, LogRocket, etc.)
- Database monitoring
- Email delivery monitoring
- Performance monitoring

