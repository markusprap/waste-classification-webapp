const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function updateUserLimits() {
  try {
    console.log('🔄 Updating usage limits for existing free users...')
    
    const result = await prisma.user.updateMany({
      where: {
        plan: 'free',
        usageLimit: 5
      },
      data: {
        usageLimit: 100
      }
    })
    
    console.log(`✅ Successfully updated ${result.count} users to have 100 classifications/day limit`)
    
    // Verify the update
    const freeUsers = await prisma.user.findMany({
      where: {
        plan: 'free'
      },
      select: {
        id: true,
        email: true,
        plan: true,
        usageLimit: true
      }
    })
    
    console.log('\n📊 Current free users:')
    freeUsers.forEach(user => {
      console.log(`- ${user.email}: ${user.usageLimit} classifications/day`)
    })
    
  } catch (error) {
    console.error('❌ Error updating user limits:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateUserLimits()
