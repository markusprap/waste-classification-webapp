// add-free-user.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addFreeUser() {
  try {
    console.log('Adding a free user for testing...');
    
    // Check existing users first
    const existingUsers = await prisma.user.findMany();
    console.log(`Found ${existingUsers.length} existing users`);
      // Create a test free user
    const user = await prisma.user.create({
      data: {
        id: 'test-free-user-' + Date.now(),
        email: 'freeuser@test.com',
        name: 'Test Free User',
        plan: 'free',
        usageLimit: 30,
        usageCount: 0
      }
    });
    
    console.log('✅ Successfully created free user:');
    console.log(`   Email: ${user.email}`);
    console.log(`   Plan: ${user.plan}`);
    console.log(`   Usage Limit: ${user.usageLimit}`);
    console.log(`   ID: ${user.id}`);
    
  } catch (error) {
    console.error('❌ Error creating free user:', error.message);
    console.error('Full error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Add error handling for the main execution
addFreeUser().catch(console.error);
