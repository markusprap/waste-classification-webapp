const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateSubscriptionEndDates() {
  try {
    console.log('=== UPDATING SUBSCRIPTION END DATES ===\n');
    
    const pendingSubscriptions = await prisma.subscription.findMany({
      where: { 
        endDate: null,
        status: 'pending'
      },
      include: {
        user: {
          select: { email: true, name: true }
        }
      }
    });
    
    console.log(`Found ${pendingSubscriptions.length} subscriptions without end dates`);
    
    let successCount = 0;
    
    for (const sub of pendingSubscriptions) {
      const startDate = sub.startDate || new Date();
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);
      
      await prisma.subscription.update({
        where: { id: sub.id },
        data: {
          endDate: endDate,
          status: 'active',
          paymentStatus: 'settlement'
        }
      });
      
      if (sub.userId) {
        await prisma.user.update({
          where: { id: sub.userId },
          data: {
            plan: 'premium',
            usageLimit: 1000
          }
        });
      }
      
      console.log(`✅ Updated subscription for user: ${sub.user?.email || 'Unknown'}`);
      console.log(`   End date set to: ${endDate}`);
      console.log(`   Status updated to: active`);
      console.log('');
      
      successCount++;
    }
    
    console.log(`Successfully updated ${successCount} subscriptions`);
    
    const verifySubscriptions = await prisma.subscription.findMany({
      where: {
        id: {
          in: pendingSubscriptions.map(sub => sub.id)
        }
      },
      include: {
        user: {
          select: { email: true, name: true, plan: true }
        }
      }
    });
    
    console.log('\nVerification - Updated Subscriptions:');
    console.log('==================================');
    verifySubscriptions.forEach((sub, index) => {
      console.log(`${index + 1}. User: ${sub.user?.email || 'Unknown'}`);
      console.log(`   Plan: ${sub.plan}`);
      console.log(`   Status: ${sub.status}`);
      console.log(`   Payment Status: ${sub.paymentStatus}`);
      console.log(`   Start: ${sub.startDate}`);
      console.log(`   End: ${sub.endDate}`);
      console.log(`   User Current Plan: ${sub.user?.plan}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('Error updating subscription end dates:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateSubscriptionEndDates();
