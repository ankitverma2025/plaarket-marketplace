const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  try {
    // Create categories
    console.log('Creating categories...');
    const categories = await Promise.all([
      prisma.category.upsert({
        where: { name: 'Fruits' },
        update: {},
        create: {
          name: 'Fruits',
          description: 'Fresh organic fruits',
          isActive: true,
        },
      }),
      prisma.category.upsert({
        where: { name: 'Vegetables' },
        update: {},
        create: {
          name: 'Vegetables',
          description: 'Fresh organic vegetables',
          isActive: true,
        },
      }),
      prisma.category.upsert({
        where: { name: 'Grains' },
        update: {},
        create: {
          name: 'Grains',
          description: 'Organic grains and cereals',
          isActive: true,
        },
      }),
      prisma.category.upsert({
        where: { name: 'Dairy' },
        update: {},
        create: {
          name: 'Dairy',
          description: 'Organic dairy products',
          isActive: true,
        },
      }),
      prisma.category.upsert({
        where: { name: 'Herbs & Spices' },
        update: {},
        create: {
          name: 'Herbs & Spices',
          description: 'Organic herbs and spices',
          isActive: true,
        },
      }),
    ]);

    // Create admin user
    console.log('Creating admin user...');
    const hashedPassword = await bcrypt.hash('Admin123!', 10);
    const admin = await prisma.user.upsert({
      where: { email: 'admin@plaarket.com' },
      update: {},
      create: {
        email: 'admin@plaarket.com',
        password: hashedPassword,
        role: 'ADMIN',
        status: 'ACTIVE',
      },
    });

    // Create sample buyer
    console.log('Creating sample buyer...');
    const buyerPassword = await bcrypt.hash('Buyer123!', 10);
    const buyer = await prisma.user.upsert({
      where: { email: 'buyer@example.com' },
      update: {},
      create: {
        email: 'buyer@example.com',
        password: buyerPassword,
        role: 'BUYER',
        status: 'ACTIVE',
        buyerProfile: {
          create: {
            firstName: 'John',
            lastName: 'Doe',
            company: 'Healthy Foods Inc.',
            phone: '+1-555-0123',
            address: '123 Main Street',
            city: 'San Francisco',
            state: 'CA',
            zipCode: '94105',
            country: 'USA',
            companyType: 'Small Business',
          },
        },
      },
    });

    // Create sample seller
    console.log('Creating sample seller...');
    const sellerPassword = await bcrypt.hash('Seller123!', 10);
    const seller = await prisma.user.upsert({
      where: { email: 'seller@example.com' },
      update: {},
      create: {
        email: 'seller@example.com',
        password: sellerPassword,
        role: 'SELLER',
        status: 'ACTIVE',
        sellerProfile: {
          create: {
            companyName: 'Green Valley Farms',
            contactPerson: 'Jane Smith',
            phone: '+1-555-0456',
            address: '456 Farm Road',
            city: 'Sacramento',
            state: 'CA',
            zipCode: '95814',
            country: 'USA',
            description: 'Organic farm specializing in fresh produce and herbs',
            website: 'https://greenvalleyfarms.com',
            establishedYear: 2010,
            employeeCount: '11-50',
            isVerified: true,
            categories: {
              create: [
                { categoryId: categories[0].id }, // Fruits
                { categoryId: categories[1].id }, // Vegetables
                { categoryId: categories[4].id }, // Herbs & Spices
              ],
            },
          },
        },
      },
    });

    // Get seller profile
    const sellerProfile = await prisma.sellerProfile.findUnique({
      where: { userId: seller.id },
    });

    // Create sample products
    console.log('Creating sample products...');
    await Promise.all([
      prisma.product.upsert({
        where: { sku: 'ORG-APPL-001' },
        update: {},
        create: {
          name: 'Organic Red Apples',
          description: 'Fresh, crisp organic red apples grown without pesticides. Perfect for snacking, baking, or making fresh juice.',
          shortDescription: 'Fresh organic red apples',
          sku: 'ORG-APPL-001',
          sellerId: sellerProfile.id,
          categoryId: categories[0].id, // Fruits
          retailPrice: 4.99,
          wholesalePrice: 3.99,
          minOrderQuantity: 1,
          unit: 'lb',
          stockQuantity: 100,
          images: ['/images/products/red-apples.jpg'],
          tags: ['organic', 'fresh', 'local', 'seasonal'],
          origin: 'California, USA',
          isOrganic: true,
          isGmoFree: true,
          isFairTrade: false,
        },
      }),
      prisma.product.upsert({
        where: { sku: 'ORG-CARR-001' },
        update: {},
        create: {
          name: 'Organic Carrots',
          description: 'Sweet and crunchy organic carrots packed with nutrients. Great for cooking, juicing, or eating raw.',
          shortDescription: 'Fresh organic carrots',
          sku: 'ORG-CARR-001',
          sellerId: sellerProfile.id,
          categoryId: categories[1].id, // Vegetables
          retailPrice: 2.99,
          wholesalePrice: 2.29,
          minOrderQuantity: 1,
          unit: 'bunch',
          stockQuantity: 75,
          images: ['/images/products/carrots.jpg'],
          tags: ['organic', 'fresh', 'vitamin-a', 'healthy'],
          origin: 'California, USA',
          isOrganic: true,
          isGmoFree: true,
          isFairTrade: false,
        },
      }),
      prisma.product.upsert({
        where: { sku: 'ORG-BASIL-001' },
        update: {},
        create: {
          name: 'Fresh Organic Basil',
          description: 'Aromatic organic basil perfect for cooking, garnishing, and making pesto. Grown in greenhouse conditions.',
          shortDescription: 'Fresh organic basil leaves',
          sku: 'ORG-BASIL-001',
          sellerId: sellerProfile.id,
          categoryId: categories[4].id, // Herbs & Spices
          retailPrice: 3.49,
          wholesalePrice: 2.79,
          minOrderQuantity: 1,
          unit: 'pack',
          stockQuantity: 50,
          images: ['/images/products/basil.jpg'],
          tags: ['organic', 'fresh', 'herbs', 'aromatic'],
          origin: 'California, USA',
          shelfLife: '7-10 days refrigerated',
          storageInfo: 'Keep refrigerated in original packaging',
          isOrganic: true,
          isGmoFree: true,
          isFairTrade: false,
        },
      }),
    ]);

    console.log('✅ Database seeding completed successfully!');
    console.log('\n📋 Seeded data:');
    console.log('- Categories: 5');
    console.log('- Users: 3 (1 admin, 1 buyer, 1 seller)');
    console.log('- Products: 3');
    console.log('\n🔐 Login credentials:');
    console.log('Admin: admin@plaarket.com / Admin123!');
    console.log('Buyer: buyer@example.com / Buyer123!');
    console.log('Seller: seller@example.com / Seller123!');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
