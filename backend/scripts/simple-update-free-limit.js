const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateFreePlanLimit() {
  try {
    console.log('=== UPDATING FREE PLAN USAGE LIMIT ===\n');
    
    const freeUsers = await prisma.user.findMany({
      where: { plan: 'free' }
    });
    
    console.log(`Found ${freeUsers.length} users with free plan`);
    
    let successCount = 0;
    
    for (const user of freeUsers) {
      try {
        await prisma.user.update({
          where: { id: user.id },
          data: { usageLimit: 30 }
        });
        successCount++;
        console.log(`Updated user: ${user.email}`);
      } catch (err) {
        console.error(`Failed to update user ${user.email}:`, err.message);
      }
    }
    
    console.log(`\n✅ Successfully updated ${successCount} out of ${freeUsers.length} free plan users`);
    
  } catch (error) {
    console.error('Error updating free plan limit:', error);
  } finally {
    await prisma.$disconnect();
    console.log('\nDatabase connection closed');
  }
}

updateFreePlanLimit()
  .then(() => console.log('Script completed'))
  .catch(e => console.error('Script failed:', e));

setTimeout(() => process.exit(0), 5000);
