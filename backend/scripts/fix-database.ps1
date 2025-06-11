# fix-database.ps1
# PowerShell script to fix database issues

# Set working directory
Set-Location -Path "D:\PROJECTS\Coding Camp 2025 powered by DBS Foundation\Capstone\waste-classification-webapp\backend"

Write-Host "=== FIXING DATABASE ISSUES ===" -ForegroundColor Green

# Create a simple JavaScript script that will run and fix the issues
$tempScriptContent = @"
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixDatabase() {
  try {
    console.log('Starting database fixes...');
    
    // 1. Fix free plan usage limit
    console.log('\n1. Updating free plan users to have usage limit of 30...');
    const freeUsers = await prisma.user.findMany({
      where: { plan: 'free' }
    });
    
    console.log(`Found ${freeUsers.length} users with free plan`);
    
    for (const user of freeUsers) {
      await prisma.user.update({
        where: { id: user.id },
        data: { usageLimit: 30 }
      });
    }
    
    console.log('✅ Successfully updated free plan users');
    
    // 2. Fix subscription end dates and status
    console.log('\n2. Updating subscription end dates and status...');
    const pendingSubs = await prisma.subscription.findMany({
      where: { 
        status: 'pending',
        endDate: null
      }
    });
    
    console.log(`Found ${pendingSubs.length} pending subscriptions without end dates`);
    
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
      
      // Update user to premium
      if (sub.userId) {
        await prisma.user.update({          where: { id: sub.userId },
          data: {
            plan: 'premium',
            usageLimit: 10000
          }
        });
      }
    }
    
    console.log('✅ Successfully updated subscriptions and user plans');
    
    // 3. Verify the changes
    console.log('\n=== VERIFICATION ===');
    
    // Check updated user plans
    const updatedUsers = await prisma.user.findMany({
      select: {
        email: true,
        plan: true,
        usageLimit: true
      }
    });
    
    console.log('\nUpdated User Plans:');
    console.log('==================');
    updatedUsers.forEach((user, index) => {
      console.log(`${index + 1}. Email: ${user.email}`);
      console.log(`   Plan: ${user.plan}`);
      console.log(`   Usage Limit: ${user.usageLimit}`);
      console.log('');
    });
    
    // Check subscription statuses
    const updatedSubs = await prisma.subscription.findMany({
      include: {
        user: {
          select: { email: true }
        }
      }
    });
    
    console.log('\nUpdated Subscriptions:');
    console.log('=====================');
    updatedSubs.forEach((sub, index) => {
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
    await prisma.\$disconnect();
  }
}

fixDatabase().catch(console.error);
"@

# Write the temporary script to a file
$tempScriptPath = Join-Path -Path "." -ChildPath "scripts\temp-fix-db.js"
Set-Content -Path $tempScriptPath -Value $tempScriptContent

# Run the script
Write-Host "Running database fix script..." -ForegroundColor Yellow
node $tempScriptPath

# Check if we need to remove the temp script
Write-Host "Fix script execution completed" -ForegroundColor Green

# Pause to see the results
Write-Host "Press any key to exit..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
