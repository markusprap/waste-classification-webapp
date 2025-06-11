const { storeArticleImage, deleteArticleImage } = require('../../utils/image-storage');
const os = require('os');

const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')     // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove non-word chars except -
    .replace(/\-\-+/g, '-')   // Replace multiple - with single -
    .replace(/^-+/, '')       // Trim - from start
    .replace(/-+$/, '');      // Trim - from end
};

const routes = [
  // GET /api/articles 
  {
    method: 'GET',
    path: '/api/articles',
    handler: async (request, h) => {
      try {
        const { page = 1, limit = 12, category, search } = request.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Build where clause
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
          // Get articles with pagination
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
  // GET /api/articles/{id} 
  {
    method: 'GET',
    path: '/api/articles/{id}',
    handler: async (request, h) => {try {
        const { id } = request.params;

        const article = await request.server.app.prisma.article.findUnique({
          where: { id },
          include: {
            // Add any related data to include
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

  // GET /api/articles/slug/{slug}
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

        // Increment view count
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
  // POST /api/v1/articles
  {
    method: 'POST',
    path: '/api/v1/articles',
    options: {
      payload: {
        output: 'stream',
        parse: true,
        multipart: true,
        maxBytes: 10 * 1024 * 1024, // 10MB
        timeout: false, // Disable timeout for large file uploads
        uploads: os.tmpdir() // Use OS temp directory for file uploads
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

        // Generate unique slug
        const slug = slugify(title);
        const existingArticleCount = await request.server.app.prisma.article.count({
          where: {
            slug: {
              startsWith: slug
            }
          }
        });
        const finalSlug = existingArticleCount > 0 ? `${slug}-${existingArticleCount + 1}` : slug;

        // Handle file upload if provided
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

        // Create article with all fields
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
  },  // PUT /api/v1/articles/{id}
  {
    method: 'PUT',
    path: '/api/v1/articles/{id}',
    options: {
      payload: {
        output: 'stream',
        parse: true,
        multipart: true,
        maxBytes: 10 * 1024 * 1024 // 10MB
      }
    },
    handler: async (request, h) => {
      try {
        const { id } = request.params;
        const { title, content, excerpt, category, tags, author } = request.payload;
        const coverImage = request.payload.file;

        // Get existing article
        const existingArticle = await request.server.app.prisma.article.findUnique({
          where: { id },
          select: { coverImage: true }
        });

        if (!existingArticle) {
          return h.response({ error: 'Article not found' }).code(404);
        }

        // Handle cover image
        let imageData = null;
        if (coverImage) {
          // Delete old image if exists
          if (existingArticle.coverImage) {
            await deleteArticleImage(existingArticle.coverImage);
          }
          // Store new image
          imageData = await storeArticleImage(coverImage);
        }

        // Update article
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
  },  // DELETE /api/v1/articles/{id}
  {
    method: 'DELETE',
    path: '/api/v1/articles/{id}',
    handler: async (request, h) => {
      try {
        const { id } = request.params;

        // Get article to delete its image
        const article = await request.server.app.prisma.article.findUnique({
          where: { id },
          select: { coverImage: true }
        });

        if (!article) {
          return h.response({ error: 'Article not found' }).code(404);
        }

        // Delete cover image if exists
        if (article.coverImage) {
          await deleteArticleImage(article.coverImage);
        }

        // Delete article
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

  // GET /api/articles/categories
  {
    method: 'GET',
    path: '/api/articles/categories',
    handler: async (request, h) => {
      try {
        // Get all distinct categories and their counts
        const categories = await request.server.app.prisma.article.groupBy({
          by: ['category'],
          where: {
            isPublished: true
          },
          _count: {
            category: true
          }
        });

        // Format the response
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
