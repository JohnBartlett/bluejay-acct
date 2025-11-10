# Changelog

All notable changes to BlueJay Accounting will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-01-XX

### Added
- Initial release of BlueJay Accounting
- Invoice creation, editing, viewing, and deletion
- Customer management
- PDF invoice generation
- Email sending with PDF attachment
- Email open tracking
- Print-friendly invoice view
- Dashboard with charts and statistics
- Settings page for company information
- Time entry templates
- Support for TIME, SERVICE, and PRODUCT invoice items
- Per-item tax rates and state taxes
- Credit card processing fees
- Long descriptions for invoice items
- Automatic formatting for names, addresses, and phone numbers
- Dummy/Real data toggle on dashboard
- Version display on all pages
- Comprehensive documentation

### Fixed
- PDF generation formatting issues
- Invoice total calculations
- Tax amount calculations
- Form validation and error handling
- Address and name formatting
- Print view layout
- Email PDF attachment issues

### Changed
- Removed Wave Advisors and Perks from sidebar menu
- Improved invoice PDF aesthetics
- Enhanced dashboard data display
- Updated branding to BlueJay

## [1.1.0] - 2025-01-XX

### Added
- **Invoice Configuration System**: JSON-based configuration for invoice display and print/PDF formatting
- **Invoice Settings Page**: Comprehensive UI for customizing invoice appearance
  - Color customization (Primary, Dark Gray, Light Gray, Border Gray) with live preview
  - Layout settings (margins, header height, section spacing)
  - Typography controls (font sizes and styles for all text elements)
  - Section visibility toggles (logo, company info, bill to, dates, table, totals, notes, footer)
  - Table customization (column selection, alternating rows, row spacing)
  - Date format customization with locale support
  - Currency formatting (symbol, decimal places, placement)
  - Footer customization
  - Print-specific settings (page numbers, DPI, bleed, PDF metadata)
  - Watermark support (text, opacity, rotation, font size, color)
  - Table border settings for PDF
- **Reports Section**: Comprehensive financial reporting with 6 report types
  - Profit & Loss report with revenue, expenses, and net income over time
  - Accounts Receivable Aging report with detailed customer breakdown
  - Sales by Customer report with charts and tables
  - Sales by Type report (TIME, SERVICE, PRODUCT) with visualizations
  - Tax Summary report by state and item type
  - Invoice Summary report by status and month
  - Date range filtering for all reports
  - Export reports as JSON
  - Interactive charts using Recharts
- **Configuration API**: `/api/invoice-config` endpoint for loading and saving invoice configurations
- **Reports API**: `/api/reports/[reportId]` endpoint for generating report data
- **Date and Currency Formatters**: Utility functions for consistent formatting across the application

### Changed
- Invoice display and PDF generation now use configuration files instead of hardcoded values
- Settings page redesigned with tabbed interface
- Print page and PDF generation updated to respect configuration settings

### Fixed
- Nested form error in invoice print settings
- Reference error in invoice display settings fields component

## [Unreleased]

### Planned
- Authentication and user management
- Multi-company support
- Real-time dashboard data calculations
- Recurring invoices
- Estimates/quotes
- Payment processing integration
- PDF export for reports
- And more (see TODO.md)

