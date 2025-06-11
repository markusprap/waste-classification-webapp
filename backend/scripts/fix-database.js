/**
 * This script directly updates the database to fix the issues
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixDatabase() {
  try {
    console.log('=== FIXING DATABASE ISSUES ===\n');
    
    // 1. Update free plan usage limit to 30
    const freeUsers = await prisma.user.findMany({
      where: { plan: 'free' }
    });
    
    console.log(`Found ${freeUsers.length} users with free plan`);
    
    const updatedUsers = await prisma.user.updateMany({
      where: { plan: 'free' },
      data: { usageLimit: 30 }
    });
    
    console.log(`✅ Updated usage limit for free users: ${updatedUsers.count} rows affected`);
    
    // 2. Update subscription end dates (1 month from start date) and set to active
    const pendingSubscriptions = await prisma.subscription.findMany({
      where: {
        endDate: null,
        status: 'pending'
      }
    });
    
    console.log(`Found ${pendingSubscriptions.length} pending subscriptions without end dates`);
    
    let updatedSubscriptionCount = 0;
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
      updatedSubscriptionCount++;
    }
    
    console.log(`✅ Updated subscription end dates: ${updatedSubscriptionCount} rows affected`);
    // 3. Update users to premium if they have an active subscription
    const usersWithSubscriptions = await prisma.subscription.findMany({
      where: {
        status: 'active'
      },
      select: {
        userId: true
      }
    });
    
    const userIds = [...new Set(usersWithSubscriptions.map(sub => sub.userId))];
    
    if (userIds.length > 0) {
      const updateUsersResult = await prisma.user.updateMany({        where: {
          id: {
            in: userIds
          }        },
        data: {
          plan: 'premium',
          usageLimit: 10000 // Setting premium limit to 10,000
        }
      });
      
      console.log(`✅ Updated users to premium plan: ${updateUsersResult.count} rows affected`);
    } else {
      console.log('No users with active subscriptions found');
    }
    
    // Verify changes
    console.log('\n=== VERIFYING CHANGES ===');
    
    // Check user plans and limits
    const users = await prisma.user.findMany({
      select: {
        id: true,
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
      console.log('');
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
      console.log(`   Payment Status: ${sub.paymentStatus}`);
      console.log(`   Start Date: ${sub.startDate}`);
      console.log(`   End Date: ${sub.endDate}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('Error fixing database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixDatabase();
