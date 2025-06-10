const { storeArticleImage, deleteArticleImage } = require('../../utils/image-storage');
const os = require('os');
// Prisma is available via server.app.prisma

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
        console.log('Received payload keys:', Object.keys(request.payload));
        console.log('Content-Type header:', request.headers['content-type']);
        
        const { title, content, excerpt, category, tags, author } = request.payload;
        const coverImage = request.payload.coverImage;
        const imageFile = request.payload.file;
        
        console.log('Received file data:', {
          coverImage: coverImage ? { 
            type: typeof coverImage,
            isString: typeof coverImage === 'string',
            isObject: typeof coverImage === 'object',
            length: coverImage?.length
          } : null,
          imageFile: imageFile ? {
            type: typeof imageFile,
            hapi: !!imageFile.hapi,
            size: imageFile.size,
            filename: imageFile.hapi?.filename
          } : null
        });
        
        if (!title) {
          console.log('Article creation failed: Title is required');
          return h.response({ error: 'Title is required' }).code(400);
        }
        
        // Validate content
        if (!content) {
          console.log('Article creation failed: Content is required');
          return h.response({ error: 'Content is required' }).code(400);
        }

        // Log for debugging
        console.log('Processing article creation:', {
          title,
          hasCoverImage: !!coverImage,
          hasImageFile: !!imageFile,
          coverImageType: coverImage ? typeof coverImage : null,
          imageFileType: imageFile ? typeof imageFile : null
        });

        // Generate unique slug
        const slug = slugify(title);

        console.log('Generated slug:', slug);
        
        // Optional: Check if slug already exists and append number if needed
        const existingArticleCount = await request.server.app.prisma.article.count({
          where: {
            slug: {
              startsWith: slug
            }
          }
        });

        const finalSlug = existingArticleCount > 0 ? `${slug}-${existingArticleCount + 1}` : slug;        // Handle cover image if provided
        let imageData = null;        try {
          // First try to handle imageFile from FormData
          if (imageFile && imageFile.hapi) {
            console.log('Processing uploaded file from FormData:', {
              filename: imageFile.hapi.filename,
              contentType: imageFile.hapi.headers['content-type'],
              bytes: imageFile.hapi.bytes
            });
            imageData = await storeArticleImage(imageFile);
            console.log('Image processed successfully:', imageData);
          } 
          // Then try coverImage if no imageFile
          else if (coverImage) {
            if (typeof coverImage === 'string') {
              // Handle URL string (either from local upload or external URL)
              console.log('Processing coverImage as URL:', coverImage);
              if (coverImage.startsWith('/uploads/')) {
                // Local file URL from frontend upload
                const filename = coverImage.split('/').pop();
                imageData = {
                  filename,
                  originalname: filename,
                  mimetype: filename.endsWith('.jpg') || filename.endsWith('.jpeg') ? 'image/jpeg' : 
                           filename.endsWith('.png') ? 'image/png' : 'image/gif',
                  size: 0
                };
                console.log('Using local file data:', imageData);
              } else {
                // External URL or other string
                imageData = await storeArticleImage(coverImage);
                console.log('Created imageData from URL:', imageData);
              }
            } else if (typeof coverImage === 'object') {
              // Handle file object
              console.log('Processing coverImage as file object:', {
                type: coverImage.type || coverImage.mimetype,
                size: coverImage.size,
                name: coverImage.name || coverImage.filename
              });
              imageData = await storeArticleImage(coverImage);
              console.log('CoverImage processed successfully:', imageData);
            }
          }
        } catch (error) {
          console.error('Error processing image:', error, error.stack);
          // Continue without image if there's an error
        }

        console.log('Final image data:', imageData);

        // Create article with all required fields
        const articleData = {
          title,
          slug: finalSlug,
          content,
          excerpt,
          category,
          tags,
          author: author || 'Tim EcoWaste',
          readTime: parseInt(request.payload.readTime) || 5,
          isPublished: true
        };
        
        // Add image data if available
        if (imageData) {
          articleData.coverImage = imageData.filename;
          if (imageData.originalname) articleData.coverOriginalName = imageData.originalname;
          if (imageData.size) articleData.coverSize = imageData.size;
          if (imageData.mimetype) articleData.coverType = imageData.mimetype;
        }
        
        console.log('Creating article with data:', {
          title: articleData.title,
          slug: articleData.slug,
          category: articleData.category,
          hasCoverImage: !!articleData.coverImage
        });        try {
          // Create article
          console.log('Creating article with data:', articleData);
          const article = await request.server.app.prisma.article.create({
            data: articleData
          });

          console.log('Article created successfully:', article.id);
          return {
            success: true,
            article
          };
        } catch (prismaError) {
          console.error('Prisma error creating article:', prismaError);
          throw prismaError; // Re-throw to be caught by outer catch
        }
      } catch (error) {
        console.error('Error creating article:', error);
        console.error('Error stack:', error.stack);
        
        // Log more details to help debug
        if (error.code) {
          console.error('Error code:', error.code);
        }
        
        // Check for common Prisma errors
        if (error.name === 'PrismaClientKnownRequestError') {
          console.error('Prisma error code:', error.code);
          console.error('Prisma error message:', error.message);
          
          // Handle specific Prisma errors
          if (error.code === 'P2002') {
            return h.response({ error: 'Article with this title already exists' }).code(400);
          }
        }
        
        return h.response({ error: 'Failed to create article' }).code(500);
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
