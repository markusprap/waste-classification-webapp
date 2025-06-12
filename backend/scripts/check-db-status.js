const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('=== CHECKING DATABASE STATUS ===\n');
    
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10
    });
    
    console.log('Recent Users:');
    console.log('=============');
    users.forEach((user, index) => {
      console.log(`${index + 1}. Email: ${user.email}`);
      console.log(`   Name: ${user.name}`);
      console.log(`   Plan: ${user.plan}`);
      console.log(`   Usage: ${user.usageCount}/${user.usageLimit}`);
      console.log(`   Created: ${user.createdAt}`);
      console.log(`   ID: ${user.id}`);
      console.log('');
    });
    
    const subscriptions = await prisma.subscription.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        user: {
          select: { email: true, name: true }
        }
      }
    });
    
    console.log('\nRecent Subscriptions:');
    console.log('====================');
    subscriptions.forEach((sub, index) => {
      console.log(`${index + 1}. User: ${sub.user?.email || 'Unknown'}`);
      console.log(`   Plan: ${sub.plan}`);
      console.log(`   Status: ${sub.status}`);
      console.log(`   Amount: ${sub.amount} ${sub.currency}`);
      console.log(`   Start: ${sub.startDate}`);
      console.log(`   End: ${sub.endDate}`);
      console.log(`   Payment ID: ${sub.paymentId}`);
      console.log(`   Created: ${sub.createdAt}`);
      console.log('');
    });
    try {
      if (prisma.transaction) {
        const transactions = await prisma.transaction.findMany({
          orderBy: { createdAt: 'desc' },
          take: 10
        });
        
        console.log('\nRecent Transactions:');
        console.log('===================');
        transactions.forEach((tx, index) => {
          console.log(`${index + 1}. Order ID: ${tx.orderId}`);
          console.log(`   Status: ${tx.status}`);
          console.log(`   User Email: ${tx.userEmail}`);
          console.log(`   Amount: ${tx.amount}`);
          console.log(`   Payment Type: ${tx.paymentType}`);
          console.log(`   Transaction ID: ${tx.transactionId}`);
          console.log(`   Created: ${tx.createdAt}`);
          console.log('');
        });
      } else {
        console.log('\nNo Transaction model found in schema.');
      }
    } catch (err) {
      console.log('\nError fetching transactions:', err.message);
    }
    
  } catch (error) {
    console.error('Error checking database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
