import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create default company
  const company = await prisma.company.upsert({
    where: { id: 'default-company-id' },
    update: {},
    create: {
      id: 'default-company-id',
      name: 'Your Company Name',
      address: '123 Business St, City, State 12345',
      email: 'contact@yourcompany.com',
      phone: '(555) 123-4567',
      currency: 'USD',
      fiscalYearEnd: 'December 31',
      defaultHourlyRate: 100,
    },
  })

  console.log('Created company:', company.name)

  // Create default user
  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      name: 'John F Bartlett',
      companyId: company.id,
    },
  })

  console.log('Created user:', user.name)

  // Create sample customers
  const customer1 = await prisma.customer.create({
    data: {
      name: 'John Willis',
      email: 'john.willis@example.com',
      address: '456 Client Ave, City, State 67890',
      phone: '(555) 987-6543',
      companyId: company.id,
    },
  })

  const customer2 = await prisma.customer.create({
    data: {
      name: 'Catharine Hamilton',
      email: 'catharine.hamilton@example.com',
      address: '789 Customer Blvd, City, State 54321',
      phone: '(555) 456-7890',
      companyId: company.id,
    },
  })

  console.log('Created customers:', customer1.name, customer2.name)

  // Create sample invoice
  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-000001',
      customerId: customer1.id,
      date: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: 'DRAFT',
      subtotal: 1000,
      tax: 100,
      total: 1100,
      notes: 'Thank you for your business!',
      companyId: company.id,
      items: {
        create: [
          {
            type: 'TIME',
            description: 'Consultation Services',
            date: new Date(),
            hours: 5,
            hourlyRate: 100,
            unitPrice: 100,
            amount: 500,
          },
          {
            type: 'TIME',
            description: 'Development Work',
            date: new Date(),
            hours: 3,
            hourlyRate: 100,
            unitPrice: 100,
            amount: 300,
          },
          {
            type: 'SERVICE',
            description: 'Project Management',
            quantity: 1,
            unitPrice: 200,
            amount: 200,
          },
        ],
      },
    },
  })

  console.log('Created sample invoice:', invoice.invoiceNumber)

  console.log('Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

