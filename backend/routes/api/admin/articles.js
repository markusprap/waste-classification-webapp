const { storeArticleImage } = require('../../utils/image-storage');
const formidable = require('formidable');
const fs = require('fs').promises;

module.exports = [
  {
    method: 'POST',
    path: '/api/admin/articles',
    options: {
      payload: {
        maxBytes: 10 * 1024 * 1024, // 10MB
        output: 'stream',
        parse: true,
        multipart: true,
        allow: 'multipart/form-data'
      }
    },
    handler: async (request, h) => {
      const form = new formidable.IncomingForm();
      
      try {
        // Parse form data
        const [fields, files] = await new Promise((resolve, reject) => {
          form.parse(request.raw.req, (err, fields, files) => {
            if (err) reject(err);
            resolve([fields, files]);
          });
        });

        let coverImage = null;
        
        // Handle image upload if exists
        if (files.image) {
          const file = files.image;
          const imageInfo = await storeArticleImage(file);
          coverImage = imageInfo.url;
        }

        // Create article with image
        const article = await request.server.app.prisma.article.create({
          data: {
            title: fields.title,
            slug: fields.slug,
            content: fields.content,
            excerpt: fields.excerpt,
            category: fields.category,
            tags: fields.tags,
            author: fields.author,
            readTime: parseInt(fields.readTime),
            coverImage: coverImage || fields.coverImage, // Use uploaded image or URL
            isPublished: true
          }
        });

        return h.response(article).code(201);
      } catch (error) {
        console.error('Error creating article:', error);
        return h.response({ error: error.message || 'Failed to create article' }).code(500);
      }
    }
  }
];
