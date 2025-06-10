const multer = require('multer');
const { storeArticleImage, deleteArticleImage } = require('../../utils/image-storage');
// Prisma is available via server.app.prisma

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

/**
 * POST /api/articles/upload
 * Handles article cover image uploads
 */
module.exports = async (server) => {
  server.route({
    method: 'POST',
    path: '/api/articles/upload',
    options: {
      payload: {
        output: 'stream',
        parse: true,
        multipart: true,
        maxBytes: 10 * 1024 * 1024 // 10MB
      },
      handler: async (request, h) => {
        try {
          const { articleId } = request.query;
          const file = request.payload.file;

          // Store the uploaded file
          const storedFile = await storeArticleImage(file);

          // If this is an update, delete the old image
          if (articleId) {
            const article = await request.server.app.prisma.article.findUnique({
              where: { id: articleId },
              select: { coverImage: true }
            });

            if (article?.coverImage) {
              await deleteArticleImage(article.coverImage);
            }
          }

          // Return the stored file metadata
          return {
            success: true,
            file: storedFile
          };
        } catch (error) {
          console.error('Error uploading file:', error);
          return h.response({
            success: false,
            error: error.message
          }).code(400);
        }
      }
    }
  });

  /**
   * DELETE /api/articles/image/{articleId}
   * Delete an article's cover image
   */
  server.route({
    method: 'DELETE',
    path: '/api/articles/image/{articleId}',
    handler: async (request, h) => {
      try {
        const { articleId } = request.params;

        const article = await request.server.app.prisma.article.findUnique({
          where: { id: articleId },
          select: { coverImage: true }
        });

        if (!article?.coverImage) {
          return h.response({
            success: false,
            error: 'No image found'
          }).code(404);
        }

        // Delete the file
        await deleteArticleImage(article.coverImage);

        // Update the article record
        await request.server.app.prisma.article.update({
          where: { id: articleId },
          data: {
            coverImage: null,
            coverOriginalName: null,
            coverSize: null,
            coverType: null
          }
        });

        return { success: true };
      } catch (error) {
        console.error('Error deleting image:', error);
        return h.response({
          success: false,
          error: error.message
        }).code(500);
      }
    }
  });
};
