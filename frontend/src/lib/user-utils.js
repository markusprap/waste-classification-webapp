import { prisma } from '@/lib/prisma';

export async function canUserClassify(user) {
  if (!user) return { allowed: false, reason: 'User not found' };

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

  const limit = user.plan === 'free' ? 30 : 
                user.plan === 'premium' ? 10000 : 
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

export async function updateUserUsage(userId) {
  console.log('updateUserUsage - Incrementing usage count for user:', userId);
  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        usageCount: {
          increment: 1
        }
      }
    });
    console.log('updateUserUsage - Successfully updated user. New count:', updatedUser.usageCount);
    return updatedUser;
  } catch (error) {
    console.error('updateUserUsage - Error updating user usage:', error);
    throw error;
  }
}
