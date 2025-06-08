import { prisma } from '@/lib/prisma';

// Check if user can classify based on their plan and usage
export async function canUserClassify(user) {
  if (!user) return { allowed: false, reason: 'User not found' };

  // Reset daily usage if needed
  const now = new Date();
  const lastReset = new Date(user.lastUsageReset || new Date());
  const shouldReset = now.getDate() !== lastReset.getDate() || 
                     now.getMonth() !== lastReset.getMonth() || 
                     now.getFullYear() !== lastReset.getFullYear();

  if (shouldReset) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        usageCount: 0,
        lastUsageReset: now
      }
    });
    return { allowed: true, reason: 'Daily usage reset' };
  }
  // Check usage limits
  const limit = user.plan === 'free' ? 100 : 
                user.plan === 'premium' ? 50 : 
                Infinity;
  
  if (user.usageCount < limit) {
    return { allowed: true, reason: 'Within usage limits' };
  } else {
    return { 
      allowed: false, 
      reason: user.plan === 'free' 
        ? 'Daily free classification limit reached' 
        : 'Daily premium classification limit reached'
    };
  }
}

// Update user usage count after successful classification
export async function updateUserUsage(userId) {
  return await prisma.user.update({
    where: { id: userId },
    data: {
      usageCount: {
        increment: 1
      }
    }
  });
}
