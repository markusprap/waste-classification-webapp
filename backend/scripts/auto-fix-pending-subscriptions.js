const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function autoFixPendingSubscriptions() {
  try {
    console.log('🔧 Auto-fixing pending subscriptions...');
    
    const pendingSubscriptions = await prisma.subscription.findMany({
      where: { 
        status: 'pending',
        plan: 'premium'
      },
      include: {
        user: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`Found ${pendingSubscriptions.length} pending premium subscriptions`);
    
    if (pendingSubscriptions.length === 0) {
      console.log('✅ No pending subscriptions to fix!');
      return;
    }
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const sub of pendingSubscriptions) {
      try {
        const user = sub.user;
        
        if (!user) {
          console.log(`❌ No user found for subscription ${sub.id}, skipping...`);
          errorCount++;
          continue;
        }
        
        console.log(`⚙️  Processing ${user.email}...`);
        
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 1);
        
        await prisma.subscription.update({
          where: { id: sub.id },
          data: {
            status: 'active',
            paymentStatus: 'settlement',
            endDate: endDate
          }
        });
        
        await prisma.user.update({
          where: { id: user.id },
          data: {
            plan: 'premium',
            usageLimit: 10000
          }
        });
        
        console.log(`✅ Successfully activated premium for ${user.email}`);
        successCount++;
        
      } catch (error) {
        console.error(`❌ Error updating subscription ${sub.id}:`, error.message);
        errorCount++;
      }
    }
    
    console.log('\n📊 === SUMMARY ===');
    console.log(`Total processed: ${pendingSubscriptions.length}`);
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Failed: ${errorCount}`);
    
    if (successCount > 0) {
      console.log('\n🎉 Pending subscriptions have been activated!');
      console.log('Users can now refresh their dashboard to see premium status.');
    }
    
  } catch (error) {
    console.error('💥 Script error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

autoFixPendingSubscriptions().catch(console.error);
