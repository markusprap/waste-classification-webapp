/**
 * Verify that the auto-fix script worked correctly
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyFix() {
  try {
    console.log('🔍 Verifying auto-fix results...');
    
    const user = await prisma.user.findUnique({
      where: { email: 'prapkurniawanmarkus@gmail.com' },
      include: { subscriptions: true }
    });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('\n📊 User Status:');
    console.log(`Email: ${user.email}`);
    console.log(`Plan: ${user.plan}`);
    console.log(`Usage Limit: ${user.usageLimit}`);
    
    if (user.subscriptions.length > 0) {
      const subscription = user.subscriptions[0];
      console.log('\n📋 Subscription Status:');
      console.log(`Status: ${subscription.status}`);
      console.log(`Payment Status: ${subscription.paymentStatus}`);
      console.log(`Plan: ${subscription.plan}`);
      console.log(`Created: ${subscription.createdAt}`);
      console.log(`Updated: ${subscription.updatedAt}`);
    } else {
      console.log('\n❌ No subscriptions found');
    }
    
  } catch (error) {
    console.error('Error verifying fix:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

verifyFix();
