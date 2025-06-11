// clean-users.js - Script to clean user data for testing
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanUsers() {
  try {
    console.log('🧹 Cleaning user data...');
    
    // Delete all related data first (foreign key constraints)
    console.log('Deleting subscriptions...');
    await prisma.subscription.deleteMany({});
    
    console.log('Deleting classifications...');
    await prisma.classification.deleteMany({});
    
    console.log('Deleting sessions...');
    await prisma.session.deleteMany({});
    
    console.log('Deleting accounts...');
    await prisma.account.deleteMany({});
    
    console.log('Deleting users...');
    await prisma.user.deleteMany({});
    
    console.log('✅ Successfully cleaned all user data!');
    console.log('Database is now ready for fresh testing.');
    
  } catch (error) {
    console.error('❌ Error cleaning user data:', error.message);
    console.error('Full error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the cleanup
cleanUsers().catch(console.error);
