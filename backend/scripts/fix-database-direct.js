/**
 * This script fixes the database using direct SQL commands
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixDatabaseDirect() {
  try {
    console.log('=== DIRECTLY FIXING DATABASE ===\n');

    // 1. Fix user plan usage limits (free users to 30 limit)
    console.log('1. Updating free plan users to have usage limit of 30...');
    try {
      const freeUsersResult = await prisma.$queryRaw`
        UPDATE "User"
        SET "usageLimit" = 30
        WHERE "plan" = 'free'
      `;
      console.log('   ✅ Success - Free users updated with usage limit 30');
    } catch (error) {
      console.error('   ❌ Error updating free users:', error.message);
    }

    // 2. Fix subscription end dates (1 month from start)
    console.log('\n2. Updating pending subscriptions to have end dates and active status...');
    try {
      const pendingSubsResult = await prisma.$queryRaw`
        UPDATE "Subscription"
        SET "endDate" = DATE_ADD("startDate", INTERVAL 1 MONTH),
            "status" = 'active',
            "paymentStatus" = 'settlement'
        WHERE "status" = 'pending'
      `;
      console.log('   ✅ Success - Pending subscriptions updated with end dates and active status');
    } catch (error) {
      console.error('   ❌ Error updating subscriptions:', error.message);
      console.log('   Trying alternative SQL syntax...');
      
      try {
        // Try SQLite syntax
        const pendingSubsResultSQLite = await prisma.$queryRaw`
          UPDATE "Subscription"
          SET "endDate" = datetime("startDate", '+1 month'),
              "status" = 'active',
              "paymentStatus" = 'settlement'
          WHERE "status" = 'pending'
        `;
        console.log('   ✅ Success - Pending subscriptions updated with SQLite syntax');
      } catch (sqliteError) {
        console.error('   ❌ Error with SQLite syntax:', sqliteError.message);
        
        // Fallback to direct JavaScript approach
        console.log('   Falling back to JavaScript approach...');
        const pendingSubs = await prisma.subscription.findMany({
          where: { status: 'pending' }
        });
        
        console.log(`   Found ${pendingSubs.length} pending subscriptions`);
        
        for (const sub of pendingSubs) {
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
        }
        console.log('   ✅ Success - Updated pending subscriptions using JavaScript');
      }
    }

    // 3. Update users with active subscriptions to premium plan
    console.log('\n3. Updating users with active subscriptions to premium plan...');
    try {
      // Get users with active subscriptions
      const usersWithActiveSubs = await prisma.subscription.findMany({
        where: { status: 'active' },
        select: { userId: true }
      });
      
      const userIds = [...new Set(usersWithActiveSubs.map(sub => sub.userId))];
      console.log(`   Found ${userIds.length} users with active subscriptions`);
      
      if (userIds.length > 0) {
        for (const userId of userIds) {
          await prisma.user.update({
            where: { id: userId },
            data: {
              plan: 'premium',
              usageLimit: 1000
            }
          });
        }
        console.log('   ✅ Success - Updated users to premium plan');
      }
    } catch (error) {
      console.error('   ❌ Error updating users to premium:', error.message);
    }

    // 4. Verify changes
    console.log('\n=== VERIFICATION ===');
    
    // Check user plans and limits
    const users = await prisma.user.findMany({
      select: {
        email: true,
        plan: true,
        usageLimit: true
      }
    });
    
    console.log('\nUser Plans and Limits:');
    console.log('=====================');
    users.forEach((user, index) => {
      console.log(`${index + 1}. Email: ${user.email}`);
      console.log(`   Plan: ${user.plan}`);
      console.log(`   Usage Limit: ${user.usageLimit}`);
    });
    
    // Check subscription statuses
    const subscriptions = await prisma.subscription.findMany({
      include: {
        user: {
          select: { email: true }
        }
      }
    });
    
    console.log('\nSubscription Statuses:');
    console.log('=====================');
    subscriptions.forEach((sub, index) => {
      console.log(`${index + 1}. User: ${sub.user?.email || 'Unknown'}`);
      console.log(`   Status: ${sub.status}`);
      console.log(`   End Date: ${sub.endDate}`);
    });

  } catch (mainError) {
    console.error('Main execution error:', mainError);
  } finally {
    await prisma.$disconnect();
  }
}

fixDatabaseDirect();
