/**
 * This script fixes premium subscriptions that are stuck in "pending" status
 * by updating them to "active" status and updating the user's plan to "premium"
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixPremiumSubscriptions() {
  try {
    console.log('=== FIXING PREMIUM SUBSCRIPTIONS ===\n');
    
    // Get pending subscriptions
    const pendingSubscriptions = await prisma.subscription.findMany({
      where: { status: 'pending' },
      include: {
        user: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`Found ${pendingSubscriptions.length} pending subscriptions\n`);
    
    // Ask for user email to fix
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    readline.question('Enter user email to fix (leave empty to fix all): ', async (email) => {
      let subscriptionsToFix = pendingSubscriptions;
      
      // Filter by email if provided
      if (email && email.trim() !== '') {
        subscriptionsToFix = pendingSubscriptions.filter(sub => 
          sub.user && sub.user.email === email.trim()
        );
        console.log(`Filtered to ${subscriptionsToFix.length} subscriptions for email: ${email}`);
      }
      
      if (subscriptionsToFix.length === 0) {
        console.log('No matching subscriptions found.');
        readline.close();
        await prisma.$disconnect();
        return;
      }
      
      // Confirm with user
      readline.question(`Are you sure you want to fix ${subscriptionsToFix.length} subscription(s)? (yes/no): `, async (answer) => {
        if (answer.toLowerCase() !== 'yes') {
          console.log('Operation cancelled.');
          readline.close();
          await prisma.$disconnect();
          return;
        }
        
        let successCount = 0;
        let errorCount = 0;
        
        // Process each subscription
        for (const sub of subscriptionsToFix) {
          try {
            const userId = sub.userId;
            const user = sub.user;
            
            if (!user) {
              console.log(`No user found for subscription ${sub.id}, skipping...`);
              errorCount++;
              continue;
            }
            
            console.log(`Processing subscription for ${user.email}...`);
            
            // 1. Update subscription to active
            await prisma.subscription.update({
              where: { id: sub.id },
              data: {
                status: 'active',
                paymentStatus: 'settlement',
                endDate: new Date(new Date().setMonth(new Date().getMonth() + 1))
              }
            });
            
            // 2. Update user plan to premium
            await prisma.user.update({
              where: { id: userId },
              data: {
                plan: 'premium',
                usageLimit: 999999 // Practically unlimited for premium
              }
            });
            
            console.log(`✅ Successfully updated ${user.email} to premium plan`);
            successCount++;
          } catch (error) {
            console.error(`Error updating subscription ${sub.id}:`, error);
            errorCount++;
          }
        }
        
        console.log('\n=== SUMMARY ===');
        console.log(`Total processed: ${subscriptionsToFix.length}`);
        console.log(`Successful: ${successCount}`);
        console.log(`Failed: ${errorCount}`);
        
        readline.close();
        await prisma.$disconnect();
      });
    });
  } catch (error) {
    console.error('Script error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

fixPremiumSubscriptions();
