const { storeArticleImage, deleteArticleImage } = require('../../utils/image-storage');
const os = require('os');

const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

const routes = [
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
              { tags: { contains: search, mode: 'insensitive' } }
            ]
          })
        };
        const [articles, total] = await Promise.all([
          request.server.app.prisma.article.findMany({
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
          request.server.app.prisma.article.count({ where })
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
    path: '/api/articles/{id}',
    handler: async (request, h) => {try {
        const { id } = request.params;

        const article = await request.server.app.prisma.article.findUnique({
          where: { id },
          include: {
          }
        });

        if (!article) {
          return h.response({ error: 'Article not found' }).code(404);
        }

        return article;

      } catch (error) {
        console.error('Error fetching article:', error);
        return h.response({ error: 'Failed to fetch article' }).code(500);
      }
    }
  },
  {
    method: 'GET',
    path: '/api/articles/slug/{slug}',
    handler: async (request, h) => {
      try {
        const { slug } = request.params;

        const article = await request.server.app.prisma.article.findUnique({
          where: { slug }
        });

        if (!article) {
          return h.response({ error: 'Article not found' }).code(404);
        }

        await request.server.app.prisma.article.update({
          where: { id: article.id },
          data: { viewCount: { increment: 1 } }
        });        return article;
      } catch (error) {
        console.error('Error fetching article by slug:', error);
        return h.response({ error: 'Failed to fetch article' }).code(500);
      }
    }
  },
  {
    method: 'POST',
    path: '/api/v1/articles',
    options: {
      payload: {
        output: 'stream',
        parse: true,
        multipart: true,
        maxBytes: 10 * 1024 * 1024,
        timeout: false,
        uploads: os.tmpdir()
      }    },
    handler: async (request, h) => {
      try {
        const { title, content, excerpt, category, tags, author } = request.payload;
        const file = request.payload.file;

        if (!title || !content) {
          return h.response({
            success: false,
            error: 'Title and content are required'
          }).code(400);
        }

        const slug = slugify(title);
        const existingArticleCount = await request.server.app.prisma.article.count({
          where: {
            slug: {
              startsWith: slug
            }
          }
        });
        const finalSlug = existingArticleCount > 0 ? `${slug}-${existingArticleCount + 1}` : slug;

        let imageData = null;
        if (file) {
          try {
            imageData = await storeArticleImage(file);
          } catch (error) {
            console.error('Error processing image:', error);
            return h.response({
              success: false,
              error: 'Failed to process image'
            }).code(400);
          }
        }

        const articleData = {
          title,
          slug: finalSlug,
          content,
          excerpt: excerpt || '',
          category: category || 'Uncategorized',
          tags: tags || '',
          author: author || 'Tim EcoWaste',
          readTime: 5,
          isPublished: true,
          ...(imageData && {
            coverImage: imageData.filename,
            coverOriginalName: imageData.originalname,
            coverSize: imageData.size,
            coverType: imageData.mimetype
          })
        };

        const article = await request.server.app.prisma.article.create({
          data: articleData
        });

        return {
          success: true,
          article
        };

      } catch (error) {
        console.error('Error creating article:', error);
        
        if (error.code === 'P2002') {
          return h.response({
            success: false,
            error: 'Article with this title already exists'
          }).code(400);
        }

        return h.response({
          success: false,
          error: 'Failed to create article'
        }).code(500);
      }
    }
  },
  {
    method: 'PUT',
    path: '/api/v1/articles/{id}',
    options: {
      payload: {
        output: 'stream',
        parse: true,
        multipart: true,
        maxBytes: 10 * 1024 * 1024
      }
    },
    handler: async (request, h) => {
      try {
        const { id } = request.params;
        const { title, content, excerpt, category, tags, author } = request.payload;
        const coverImage = request.payload.file;

        const existingArticle = await request.server.app.prisma.article.findUnique({
          where: { id },
          select: { coverImage: true }
        });

        if (!existingArticle) {
          return h.response({ error: 'Article not found' }).code(404);
        }

        let imageData = null;
        if (coverImage) {
          if (existingArticle.coverImage) {
            await deleteArticleImage(existingArticle.coverImage);
          }
          imageData = await storeArticleImage(coverImage);
        }

        const article = await request.server.app.prisma.article.update({
          where: { id },
          data: {
            title,
            content,
            excerpt,
            category,
            tags,
            author,
            ...(imageData && {
              coverImage: imageData.filename,
              coverOriginalName: imageData.originalname,
              coverSize: imageData.size,
              coverType: imageData.mimetype
            })
          }
        });

        return {
          success: true,
          article
        };

      } catch (error) {
        console.error('Error updating article:', error);
        return h.response({ error: 'Failed to update article' }).code(500);
      }
    }
  },
  {
    method: 'DELETE',
    path: '/api/v1/articles/{id}',
    handler: async (request, h) => {
      try {
        const { id } = request.params;

        const article = await request.server.app.prisma.article.findUnique({
          where: { id },
          select: { coverImage: true }
        });

        if (!article) {
          return h.response({ error: 'Article not found' }).code(404);
        }

        if (article.coverImage) {
          await deleteArticleImage(article.coverImage);
        }

        await request.server.app.prisma.article.delete({
          where: { id }
        });

        return { success: true };

      } catch (error) {
        console.error('Error deleting article:', error);
        return h.response({ error: 'Failed to delete article' }).code(500);
      }
    }
  },
  {
    method: 'GET',
    path: '/api/articles/categories',
    handler: async (request, h) => {
      try {
        const categories = await request.server.app.prisma.article.groupBy({
          by: ['category'],
          where: {
            isPublished: true
          },
          _count: {
            category: true
          }
        });

        const formattedCategories = categories.map(item => ({
          name: item.category,
          count: item._count.category
        }));

        return formattedCategories;
      } catch (error) {
        console.error('Error fetching categories:', error);
        return h.response({ error: 'Failed to fetch categories' }).code(500);
      }
    }
  },
];

module.exports = routes;
