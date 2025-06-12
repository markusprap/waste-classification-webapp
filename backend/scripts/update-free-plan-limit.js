const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateFreePlanLimit() {
  try {
    console.log('=== UPDATING FREE PLAN USAGE LIMIT ===\n');
    
    const freeUsers = await prisma.user.findMany({
      where: { plan: 'free' }
    });
    
    console.log(`Found ${freeUsers.length} users with free plan`);
    
    const updateResult = await prisma.user.updateMany({
      where: { plan: 'free' },
      data: {
        usageLimit: 30
      }
    });
    
    console.log(`✅ Successfully updated ${updateResult.count} users with free plan to have usage limit of 30`);
    
    const verifyUsers = await prisma.user.findMany({
      where: { plan: 'free' },
      select: {
        email: true,
        plan: true,
        usageLimit: true
      }
    });
    
    console.log('\nVerification - Updated Free Plan Users:');
    console.log('====================================');
    verifyUsers.forEach((user, index) => {
      console.log(`${index + 1}. Email: ${user.email}`);
      console.log(`   Plan: ${user.plan}`);
      console.log(`   Usage Limit: ${user.usageLimit}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('Error updating free plan limit:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateFreePlanLimit();
