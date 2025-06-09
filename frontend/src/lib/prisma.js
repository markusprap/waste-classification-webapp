/**
 * This is a mock implementation of the prisma client for frontend-only use.
 * The actual database operations should be moved to the backend.
 * This file provides a compatibility layer so existing code doesn't break.
 */

// Mock Prisma client
export const prisma = {
  user: {
    findUnique: async () => {
      console.warn('Prisma mock: user.findUnique called but database is on backend');
      return {
        id: 'mock-user-id',
        email: 'user@example.com',
        name: 'Mock User',
        image: null,
        plan: 'free',
        usageCount: 0,
        usageLimit: 100,
        lastUsageReset: new Date(),
        createdAt: new Date()
      };
    },
    update: async () => {
      console.warn('Prisma mock: user.update called but database is on backend');
      return {
        id: 'mock-user-id',
        email: 'user@example.com',
        name: 'Mock User',
        plan: 'free',
        usageCount: 0,
        usageLimit: 100
      };
    }
  },
  classification: {
    create: async () => {
      console.warn('Prisma mock: classification.create called but database is on backend');
      return { id: 'mock-classification-id' };
    },
    findMany: async () => {
      console.warn('Prisma mock: classification.findMany called but database is on backend');
      return [];
    },
    count: async () => {
      console.warn('Prisma mock: classification.count called but database is on backend');
      return 0;
    }
  },
  subscription: {
    create: async () => {
      console.warn('Prisma mock: subscription.create called but database is on backend');
      return { id: 'mock-subscription-id' };
    }
  }
};
