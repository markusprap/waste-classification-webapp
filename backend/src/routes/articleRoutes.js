const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = [
  {
    method: 'GET',
    path: '/api/articles',
    handler: async (request, h) => {
      try {
        const { page = 1, limit = 12, category, search } = request.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const where = {
          isPublished: true,
          ...(category && { category }),
          ...(search && {
            OR: [
              { title: { contains: search, mode: 'insensitive' } },
              { excerpt: { contains: search, mode: 'insensitive' } },
              { tags: { has: search } }
            ]
          })
        };
        
        const [articles, total] = await Promise.all([
          prisma.article.findMany({
            where,
            select: {
              id: true,
              title: true,
              slug: true,
              excerpt: true,
              coverImage: true,
              category: true,
              tags: true,
              author: true,
              readTime: true,
              viewCount: true,
              createdAt: true
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: parseInt(limit)
          }),
          prisma.article.count({ where })
        ]);

        const totalPages = Math.ceil(total / parseInt(limit));
        
        return {
          articles,
          pagination: {
            current: parseInt(page),
            pages: totalPages,
            total,
            hasNext: parseInt(page) < totalPages,
            hasPrev: parseInt(page) > 1
          }
        };
      } catch (error) {
        console.error('Error fetching articles:', error);
        return h.response({ error: 'Failed to fetch articles' }).code(500);
      }
    }
  },

  {
    method: 'GET',
    path: '/api/articles/categories',
    handler: async (request, h) => {
      try {
        const categories = await prisma.article.groupBy({
          by: ['category'],
          where: {
            isPublished: true
          },
          _count: {
            category: true
          },
          orderBy: {
            category: 'asc'
          }
        });

        return categories.map(cat => ({
          name: cat.category,
          count: cat._count.category
        }));
      } catch (error) {
        console.error('Error fetching categories:', error);
        return h.response({ error: 'Failed to fetch categories' }).code(500);
      }
    }
  },

  {
    method: 'GET',
    path: '/api/articles/{slug}',
    handler: async (request, h) => {
      try {
        const { slug } = request.params;
        
        const article = await prisma.article.findUnique({
          where: { 
            slug,
            isPublished: true 
          }
        });
        
        if (!article) {
          return h.response({ error: 'Article not found' }).code(404);
        }
        
        await prisma.article.update({
          where: { id: article.id },
          data: { viewCount: { increment: 1 } }
        });
        
        const relatedArticles = await prisma.article.findMany({
          where: {
            category: article.category,
            id: { not: article.id },
            isPublished: true
          },
          select: {
            id: true,
            title: true,
            slug: true,
            excerpt: true,
            coverImage: true,
            readTime: true,
            createdAt: true
          },
          take: 3,
          orderBy: { createdAt: 'desc' }
        });
        
        return {
          ...article,
          relatedArticles
        };
      } catch (error) {
        console.error('Error fetching article:', error);
        return h.response({ error: 'Failed to fetch article' }).code(500);
      }
    }
  }
];
