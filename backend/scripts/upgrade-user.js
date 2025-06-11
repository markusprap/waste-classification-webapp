/**
 * This script directly updates a user to premium plan
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function upgradeUserToPremium() {
  try {
    if (process.argv.length < 3) {
      console.log('Usage: node upgrade-user.js <email>');
      process.exit(1);
    }
    
    const email = process.argv[2];
    console.log(`Upgrading user ${email} to premium plan...`);
    
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      console.log(`User not found with email: ${email}`);
      process.exit(1);
    }
    
    // Update user plan to premium
    await prisma.user.update({
      where: { id: user.id },
      data: {
        plan: 'premium',
        usageLimit: 1000
      }
    });
    
    // Create active subscription if none exists
    const existingActiveSub = await prisma.subscription.findFirst({
      where: { 
        userId: user.id,
        status: 'active'
      }
    });
    
    if (!existingActiveSub) {
      await prisma.subscription.create({
        data: {
          userId: user.id,
          plan: 'premium',
          status: 'active',
          paymentStatus: 'settlement',
          startDate: new Date(),
          endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
          amount: 99000,
          currency: 'IDR',
          paymentId: `MANUAL-UPGRADE-${Date.now()}`
        }
      });
    }
    
    console.log(`✅ Successfully upgraded ${email} to premium plan`);
    
    // Verify the upgrade
    const updatedUser = await prisma.user.findUnique({
      where: { email },
      include: {
        subscriptions: {
          where: {
            status: 'active'
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      }
    });
    
    console.log('\nUpdated User Info:');
    console.log('=================');
    console.log(`Email: ${updatedUser.email}`);
    console.log(`Plan: ${updatedUser.plan}`);
    console.log(`Usage Limit: ${updatedUser.usageLimit}`);
    
    if (updatedUser.subscriptions && updatedUser.subscriptions.length > 0) {
      const sub = updatedUser.subscriptions[0];
      console.log('\nActive Subscription:');
      console.log('===================');
      console.log(`Status: ${sub.status}`);
      console.log(`Start Date: ${sub.startDate}`);
      console.log(`End Date: ${sub.endDate}`);
    }
    
  } catch (error) {
    console.error('Error upgrading user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

upgradeUserToPremium();
