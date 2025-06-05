const { prisma } = require('./lib/prisma.js');

async function testDatabase() {
  try {
    console.log('Testing database connection...');
    
    // Test basic connection
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('Database connection test:', result);
    
    // Test user table
    const userCount = await prisma.user.count();
    console.log('Current user count:', userCount);
    
    console.log('✅ Database connection successful!');
  } catch (error) {
    console.error('❌ Database error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();
