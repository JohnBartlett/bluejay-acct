# System Reboot Restoration Guide

## Project Information
- **Project Name**: BlueJay Accounting (BlueBirdAcct1)
- **Location**: `/Users/johnbartlett/BlueBirdAcct1`
- **Version**: 1.2.0
- **Framework**: Next.js 14+ (App Router)
- **Database**: PostgreSQL (local)
- **ORM**: Prisma

## Current State (Before Reboot)
- Next.js dev server was running on port 3000
- Prisma Studio was running
- Database schema includes: Company, Customer, Invoice, Estimate, InvoiceTemplate, EstimateTemplate models
- Recent changes: Added starting invoice number setting, invoice/estimate template functionality, convert estimate to invoice feature

## After Reboot - Restoration Steps

### 1. Navigate to Project Directory
```bash
cd /Users/johnbartlett/BlueBirdAcct1
```

### 2. Verify Environment Variables
Ensure `.env` file exists with:
- `DATABASE_URL` - PostgreSQL connection string (local database)
- `RESEND_API_KEY` - Email service API key
- `FROM_EMAIL` - Email address for sending invoices
- `CLAUDE_API_KEY` - Claude API key for AI features

### 3. Start Development Server
```bash
npm run dev
```
This will:
- Start Next.js dev server on http://localhost:3000
- Automatically regenerate Prisma client if needed (via postinstall hook)

### 4. (Optional) Start Prisma Studio
In a separate terminal:
```bash
npm run db:studio
```
Opens Prisma Studio at http://localhost:5555

### 5. Verify Database Connection
The app should automatically connect to PostgreSQL. If there are issues:
```bash
npm run db:push
```
This syncs the Prisma schema with the database.

## Key Features Currently Implemented
- ✅ Invoice creation and management
- ✅ Estimate creation and management
- ✅ Customer management
- ✅ Invoice templates with AI generation
- ✅ Estimate templates with AI generation
- ✅ Convert estimate to invoice
- ✅ Settings page with company info and starting invoice number
- ✅ Reports generation
- ✅ Email sending with read receipts
- ✅ PDF generation for invoices and estimates

## Important Notes
- Database is local PostgreSQL (not cloud)
- Default company ID: `default-company-id`
- Invoice number format: `INV-000001`, `INV-000002`, etc.
- Starting invoice number can be set in Settings → Company Information

## Troubleshooting
If Prisma client errors occur after reboot:
```bash
npm run db:generate
```
Then restart the dev server.

If database connection issues:
- Verify PostgreSQL is running: `brew services list` (if using Homebrew)
- Check DATABASE_URL in .env file
- Try: `npm run db:push` to sync schema

## Automatic Startup (LaunchAgents)

BlueJay now starts itself automatically at login/reboot via two `launchd` agents located in `~/Library/LaunchAgents`:

| LaunchAgent | Purpose | Log file |
|-------------|---------|----------|
| `com.bluebird.devserver.plist` | Runs `npm run dev` inside `/Users/johnbartlett/BlueBirdAcct1` so the Next.js app is always available on port 3000 | `~/Library/Logs/BlueBird/dev.log` |
| `com.bluebird.tunnel.plist` | Runs `cloudflared tunnel --config ~/.cloudflared/bluebird-2cch.yml run bluebird-2cch` so `https://app.2cch.com` always points at the local server | `~/Library/Logs/BlueBird/tunnel.log` |

Common commands:

```bash
# Check status
launchctl list | grep bluebird

# Restart dev server agent
launchctl unload ~/Library/LaunchAgents/com.bluebird.devserver.plist
launchctl load ~/Library/LaunchAgents/com.bluebird.devserver.plist

# Restart Cloudflare tunnel agent
launchctl unload ~/Library/LaunchAgents/com.bluebird.tunnel.plist
launchctl load ~/Library/LaunchAgents/com.bluebird.tunnel.plist
```

If logs grow too large you can truncate them safely:

```bash
> ~/Library/Logs/BlueBird/dev.log
> ~/Library/Logs/BlueBird/tunnel.log
```

With these agents in place the dev server and Cloudflare tunnel will come online automatically whenever the Mac restarts, so `https://app.2cch.com` will always proxy to the local environment.

## Git Status
There are uncommitted changes. Consider committing before rebooting if needed.
