const multer = require('multer');
const { storeArticleImage, deleteArticleImage } = require('../../utils/image-storage');

module.exports = async (server) => {
  server.route({
    method: 'POST',
    path: '/api/articles/upload',
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
        const { articleId } = request.query;
        const file = request.payload.file;

        if (!file) {
          return h.response({
            success: false,
            error: 'No file provided'
          }).code(400);
        }

        const storedFile = await storeArticleImage(file);

        if (articleId) {
          const article = await request.server.app.prisma.article.findUnique({
            where: { id: articleId },
            select: { coverImage: true }
          });

          if (article?.coverImage) {
            await deleteArticleImage(article.coverImage);
          }
        }

        return {
          success: true,
          file: {
            filename: storedFile.filename,
            originalname: storedFile.originalname,
            mimetype: storedFile.mimetype,
            size: storedFile.size
          }
        };
      } catch (error) {
        console.error('Error uploading file:', error);
        return h.response({
          success: false,
          error: error.message
        }).code(500);
      }
    }
  });

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

        await deleteArticleImage(article.coverImage);

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
