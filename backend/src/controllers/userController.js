/**
 * User controller for Hapi.js
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Check if a user exists in the database
 * @param {Object} request - Hapi request object
 * @param {Object} h - Hapi response toolkit
 * @returns {Object} Response indicating whether user exists
 */
const checkUser = async (request, h) => {
  try {
    const { email, userId } = request.payload;
    
    if (!email || !userId) {
      return h.response({
        status: 'error',
        message: 'Email and userId are required'
      }).code(400);
    }

    // Try to find user by email and id
    const user = await prisma.user.findFirst({
      where: {
        AND: [
          { email: email },
          { id: userId }
        ]
      }
    });
    
    if (!user) {
      return h.response({
        status: 'error',
        message: 'User not found'
      }).code(404);
    }

    return h.response({
      status: 'success',
      message: 'User exists',
      data: {
        id: user.id,
        email: user.email,
        plan: user.plan
      }
    }).code(200);

  } catch (error) {
    console.error('Error checking user:', error);
    return h.response({
      status: 'error',
      message: 'Failed to check user',
      error: error.message
    }).code(500);
  }
};

/**
 * Sync user data with the database, creating or updating as needed
 */
const syncUser = async (request, h) => {
  try {
    console.log('Sync user request payload:', request.payload ? {
      email: request.payload.email,
      id: request.payload.id,
      name: request.payload.name
    } : 'No payload');
    
    const { id, email, name } = request.payload;
    
    if (!email) {
      return h.response({
        status: 'error',
        message: 'Email is required'
      }).code(400);
    }

    // Try to find existing user FIRST by email (prioritize email matching)
    let user = await prisma.user.findFirst({
      where: { email: email }
    });

    // If found by email but ID is different (login with different provider but same email)
    if (user && user.id !== id) {
      console.log(`Found user with same email but different ID. Original ID: ${user.id}, New ID: ${id}`);
      // Keep existing user, but track the new ID as an alternate ID if needed
      // You could store this in a separate table if needed
    }
    
    // If not found by email, try to find by ID
    if (!user) {
      user = await prisma.user.findUnique({
        where: { id: id }
      });
    }

    if (user) {
      // Update existing user with all relevant fields
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          email: email, // Ensure email is always up to date
          name: name,
          // Keep existing plan and usage data
          plan: user.plan || 'free',
          usageLimit: user.usageLimit || 30,
          usageCount: user.usageCount || 0,
          lastUsageReset: user.lastUsageReset || new Date()
        }
      });
    } else {
      // Create new user with free plan
      user = await prisma.user.create({
        data: {
          id: id,
          email: email,
          name: name,
          plan: 'free',
          usageLimit: 30,
          usageCount: 0,
          lastUsageReset: new Date()
        }
      });
    }

    return h.response({
      status: 'success',
      message: 'User synced successfully',
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        plan: user.plan,
        usageLimit: user.usageLimit,
        usageCount: user.usageCount,
        lastUsageReset: user.lastUsageReset
      }
    }).code(200);

  } catch (error) {
    console.error('Error syncing user:', error);
    return h.response({
      status: 'error',
      message: 'Failed to sync user',
      error: error.message
    }).code(500);
  }
};

/**
 * Get user info from database, create if doesn't exist
 */
const getUserInfo = async (request, h) => {
  try {
    const { email, providerId } = request.payload;
    
    if (!email) {
      return h.response({
        status: 'error',
        message: 'Email is required'
      }).code(400);
    }

    // Try to find existing user
    let user = await prisma.user.findFirst({
      where: { email: email }
    });

    if (!user) {
      // Create new user with default values
      user = await prisma.user.create({
        data: {          id: providerId, // Use provider's ID if new user
          email: email,
          plan: 'free',
          usageLimit: 30,
          usageCount: 0,
          lastUsageReset: new Date()
        }
      });
      console.log('Created new user:', user.id);
    }

    return h.response({
      status: 'success',
      message: 'User info retrieved successfully',
      data: {
        id: user.id,
        email: user.email,
        plan: user.plan,
        usageCount: user.usageCount,
        usageLimit: user.usageLimit,
        lastUsageReset: user.lastUsageReset
      }
    }).code(200);

  } catch (error) {
    console.error('Error getting user info:', error);
    return h.response({
      status: 'error',
      message: 'Failed to get user info',
      error: error.message
    }).code(500);
  }
};

/**
 * Get user by ID
 * @param {Object} request - Hapi request object
 * @param {Object} h - Hapi response toolkit
 * @returns {Object} User data
 */
const getUserById = async (request, h) => {
  try {
    const { id } = request.params;
    
    if (!id) {
      return h.response({
        status: 'error',
        message: 'User ID is required'
      }).code(400);
    }

    // Try to find user by ID
    const user = await prisma.user.findUnique({
      where: { id: id },
      include: {
        subscriptions: {
          where: {
            status: 'active',
            endDate: {
              gt: new Date()
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      }
    });
    
    if (!user) {
      return h.response({
        status: 'error',
        message: 'User not found'
      }).code(404);
    }    // Check if user has active premium subscription
    const hasActivePremium = user.subscriptions && user.subscriptions.length > 0;
    
    // TEMPORARY FIX: Consider users with pending subscriptions as premium
    const hasPendingSubscription = await prisma.subscription.findFirst({
      where: {
        userId: user.id,
        plan: 'premium',
        status: 'pending'
      }
    });
    
    // If user has either active premium or pending subscription, set as premium
    const currentPlan = hasActivePremium || hasPendingSubscription ? 'premium' : (user.plan || 'free');
      // Update user plan if it doesn't match subscription status
    if (currentPlan !== user.plan) {      console.log(`Updating user ${user.id} plan from ${user.plan} to ${currentPlan} based on subscription status`);
      await prisma.user.update({
        where: { id: user.id },
        data: { 
          plan: currentPlan,
          usageLimit: currentPlan === 'premium' ? 10000 : 30
        }
      });
    }

    const responseData = {
      id: user.id,
      email: user.email,
      fullName: user.name,
      plan: currentPlan,
      usageCount: user.usageCount || 0,
      usageLimit: user.usageLimit || 100,
      subscriptionStatus: hasActivePremium ? 'active' : 'inactive',
      subscriptionEndDate: hasActivePremium ? user.subscriptions[0].endDate : null,
      createdAt: user.createdAt,
      lastUsageReset: user.lastUsageReset
    };

    return h.response({
      status: 'success',
      message: 'User data retrieved successfully',
      data: responseData
    }).code(200);

  } catch (error) {
    console.error('Error fetching user by ID:', error);
    return h.response({
      status: 'error',
      message: 'Internal server error'
    }).code(500);
  }
};

/**
 * Get user profile
 */
const getUserProfile = async (request, h) => {
  try {
    const { id } = request.payload;
    
    if (!id) {
      return h.response({
        status: 'error',
        message: 'User ID is required'
      }).code(400);
    }

    const user = await prisma.user.findUnique({
      where: { id: id }
    });

    if (!user) {
      return h.response({
        status: 'error',
        message: 'User not found'
      }).code(404);
    }

    return h.response({
      status: 'success',
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        plan: user.plan,
        usageLimit: user.usageLimit,
        usageCount: user.usageCount,
        lastUsageReset: user.lastUsageReset
      }
    }).code(200);

  } catch (error) {
    console.error('Error fetching user profile:', error);
    return h.response({
      status: 'error',
      message: 'Failed to fetch user profile',
      error: error.message
    }).code(500);
  }
};

/**
 * Update user usage count when classifying waste
 * @param {Object} request - Hapi request object
 * @param {Object} h - Hapi response toolkit
 * @returns {Object} Updated user data
 */
const updateUsage = async (request, h) => {
  try {
    console.log('Updating usage count request:', request.payload);
    
    const { id } = request.payload;
    
    if (!id) {
      return h.response({
        status: 'error',
        message: 'User ID is required'
      }).code(400);
    }

    const user = await prisma.user.findUnique({
      where: { id: id }
    });

    if (!user) {
      return h.response({
        status: 'error',
        message: 'User not found'
      }).code(404);
    }

    // Update user usage count
    const updatedUser = await prisma.user.update({
      where: { id: id },
      data: {
        usageCount: {
          increment: 1
        }
      }
    });

    console.log(`Updated usage count for user ${id}: ${updatedUser.usageCount}`);

    return h.response({
      status: 'success',
      message: 'Usage count updated successfully',
      data: {
        id: updatedUser.id,
        email: updatedUser.email,
        plan: updatedUser.plan,
        usageLimit: updatedUser.usageLimit,
        usageCount: updatedUser.usageCount,
        lastUsageReset: updatedUser.lastUsageReset
      }
    }).code(200);

  } catch (error) {
    console.error('Error updating usage count:', error);
    return h.response({
      status: 'error',
      message: 'Failed to update usage count',
      error: error.message
    }).code(500);
  }
};

/**
 * Look up user by email
 * @param {Object} request - Hapi request object
 * @param {Object} h - Hapi response toolkit
 * @returns {Object} User data
 */
const getUserByEmail = async (request, h) => {
  try {
    const { email } = request.payload;
    
    console.log('Looking up user by email:', email);
    
    if (!email) {
      return h.response({
        status: 'error',
        message: 'Email is required'
      }).code(400);
    }

    // Try to find user by email
    const user = await prisma.user.findFirst({
      where: { email: email }
    });
    
    if (!user) {
      console.log(`No user found with email: ${email}`);
      return h.response({
        status: 'error',
        message: 'User not found'
      }).code(404);
    }

    console.log(`Found user by email: ${email}, ID: ${user.id}`);
    
    return h.response({
      status: 'success',
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        plan: user.plan,
        usageLimit: user.usageLimit,
        usageCount: user.usageCount,
        lastUsageReset: user.lastUsageReset
      }
    }).code(200);

  } catch (error) {
    console.error('Error fetching user by email:', error);
    return h.response({
      status: 'error',
      message: 'Failed to fetch user by email',
      error: error.message
    }).code(500);
  }
};

module.exports = {
  checkUser,
  syncUser,
  getUserInfo,
  getUserById,
  getUserProfile,
  updateUsage,
  getUserByEmail
};
