const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log('🗄️  Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    await prisma.$disconnect();
    console.log('🗄️  Database disconnected');
  } catch (error) {
    console.error('❌ Database disconnection failed:', error.message);
  }
};

module.exports = {
  prisma,
  connectDB,
  disconnectDB,
};
