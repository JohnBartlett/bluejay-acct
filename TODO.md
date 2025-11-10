# TODO - BlueJay Accounting Application

## High Priority

- [ ] Implement real data calculations for dashboard charts (Cash Flow, Profit & Loss, Expenses Breakdown)
- [ ] Calculate overdue invoice time periods (1 month ago, 2 months ago, etc.) from actual due dates
- [ ] Implement payable/owing calculations from real invoice data
- [ ] Implement net income calculations from real invoice and expense data
- [ ] Add authentication and user management
- [ ] Add multi-company support (currently using DEFAULT_COMPANY_ID)
- [ ] Implement proper error handling and user feedback throughout the application
- [ ] Add form validation for all input fields
- [ ] Add loading states for all async operations
- [ ] Add confirmation dialogs for destructive actions (delete invoice, delete customer, etc.)

## Medium Priority

- [ ] Add invoice status workflow (DRAFT → SENT → PAID/OVERDUE)
- [ ] Add invoice payment tracking
- [ ] Add recurring invoice functionality
- [ ] Add estimates/quotes functionality
- [ ] Add products and services catalog
- [ ] Add purchase orders and bills
- [ ] Add receipt scanning/upload
- [ ] Add bank account integration
- [ ] Add transaction reconciliation
- [ ] Add chart of accounts
- [ ] Add payroll functionality
- [x] Add reports generation (basic reports implemented, PDF export pending)
- [ ] Add email templates customization
- [x] Add invoice templates customization (configuration system implemented)
- [ ] Add customer portal for viewing invoices
- [ ] Add payment processing integration (Stripe, PayPal, etc.)
- [ ] Add multi-currency support
- [ ] Add tax reporting and calculations
- [ ] Add time tracking integration
- [ ] Add expense tracking
- [ ] Add project/job tracking

## Low Priority / Nice to Have

- [ ] Add dark mode support
- [ ] Add keyboard shortcuts
- [ ] Add bulk operations (bulk invoice creation, bulk email sending)
- [ ] Add invoice numbering customization
- [ ] Add custom fields to invoices
- [ ] Add attachments to invoices
- [ ] Add comments/notes on invoices
- [ ] Add invoice approval workflow
- [ ] Add team collaboration features
- [ ] Add activity log/audit trail
- [ ] Add data export (CSV, Excel)
- [ ] Add data import functionality
- [ ] Add mobile app or responsive mobile views
- [ ] Add offline support
- [ ] Add backup and restore functionality
- [ ] Add API documentation
- [ ] Add unit tests
- [ ] Add integration tests
- [ ] Add E2E tests
- [ ] Add performance monitoring
- [ ] Add analytics and usage tracking

## Technical Debt

- [ ] Refactor DEFAULT_COMPANY_ID to use proper authentication
- [ ] Improve error messages throughout the application
- [ ] Add proper TypeScript types for all API responses
- [ ] Add proper error boundaries
- [ ] Optimize database queries (add indexes, optimize joins)
- [ ] Add database migrations for production
- [ ] Add environment-specific configurations
- [ ] Add logging and monitoring
- [ ] Add rate limiting for API routes
- [ ] Add input sanitization and validation
- [ ] Add CSRF protection
- [ ] Add proper session management
- [ ] Review and optimize PDF generation performance
- [ ] Add caching for frequently accessed data
- [ ] Add pagination for large data sets
- [ ] Add search functionality improvements
- [ ] Review and optimize bundle size

## Documentation

- [x] Create README.md
- [ ] Create API documentation
- [ ] Create user guide
- [ ] Create developer guide
- [ ] Create deployment guide
- [ ] Create architecture documentation
- [ ] Document database schema
- [ ] Document environment variables
- [ ] Create CHANGELOG.md
- [ ] Add inline code documentation (JSDoc)

## Bug Fixes

- [ ] Fix any remaining formatting issues in PDF generation
- [ ] Ensure all form validations work correctly
- [ ] Fix any edge cases in calculations
- [ ] Fix any UI/UX issues
- [ ] Fix any accessibility issues
- [ ] Fix any browser compatibility issues

