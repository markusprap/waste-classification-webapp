const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const log = (...args) => {
  console.log('[DEBUG]', ...args);
};

async function fixSubscriptionDates() {
  log('Starting to fix subscription dates...');
  
  try {
    const pendingSubs = await prisma.subscription.findMany({
      where: { 
        status: 'pending'
      },
      include: {
        user: {
          select: { email: true, name: true, plan: true }
        }
      }
    });
    
    log(`Found ${pendingSubs.length} pending subscriptions`);
    
    if (pendingSubs.length === 0) {
      log('No pending subscriptions to fix.');
      return;
    }
    
    for (const sub of pendingSubs) {
      log(`Processing subscription for user: ${sub.user?.email || 'Unknown'}`);
      
      try {
        const startDate = sub.startDate || new Date();
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + 1);
        
        log(`  - Setting end date to: ${endDate.toISOString()}`);
        log(`  - Changing status from '${sub.status}' to 'active'`);
        
        await prisma.subscription.update({
          where: { id: sub.id },
          data: {
            endDate: endDate,
            status: 'active',
            paymentStatus: 'settlement'
          }
        });
        
        if (sub.user && sub.user.plan !== 'premium') {
          log(`  - Updating user plan from '${sub.user.plan}' to 'premium'`);
          
          await prisma.user.update({            where: { id: sub.userId },
            data: {
              plan: 'premium',
              usageLimit: 10000
            }
          });
        }
        
        log(`  ✅ Successfully updated subscription for ${sub.user?.email || 'Unknown'}`);
      } catch (error) {
        log(`  ❌ Error updating subscription: ${error.message}`);
      }
    }
    
    const verifySubscriptions = await prisma.subscription.findMany({
      where: {
        id: {
          in: pendingSubs.map(sub => sub.id)
        }
      },
      include: {
        user: {
          select: { email: true, name: true, plan: true }
        }
      }
    });
    
    log('\nVerification Results:');
    verifySubscriptions.forEach((sub, index) => {
      log(`${index + 1}. User: ${sub.user?.email || 'Unknown'}`);
      log(`   Status: ${sub.status}`);
      log(`   Payment Status: ${sub.paymentStatus}`);
      log(`   End Date: ${sub.endDate}`);
      log(`   User Plan: ${sub.user?.plan}`);
      log('');
    });
    
    log('Script completed successfully!');
    
  } catch (error) {
    log(`Script failed with error: ${error.message}`);
    log(error.stack);
  } finally {
    await prisma.$disconnect();
    log('Database connection closed');
  }
}

fixSubscriptionDates()
  .catch(e => {
    log(`Unhandled error: ${e.message}`);
    process.exit(1);
  });

setTimeout(() => {
  log('Script execution timed out - this is normal if the script completed successfully');
  process.exit(0);
}, 10000);
