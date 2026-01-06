const { storeArticleImage } = require('../../../utils/image-storage');
const formidable = require('formidable');
const fs = require('fs').promises;

module.exports = [
  {
    method: 'POST',
    path: '/api/admin/articles',
    options: {
      payload: {
        maxBytes: 10 * 1024 * 1024,
        output: 'stream',
        parse: false,
        multipart: true,
        allow: 'multipart/form-data'
      },
      cors: {
        origin: ['*'],
        additionalHeaders: ['cache-control', 'x-requested-with', 'content-type', 'accept'],
        credentials: true
      }
    },
    handler: async (request, h) => {
      console.log('=== [ADMIN ARTICLES] Handler called ===');
      const form = new formidable.IncomingForm({
        keepExtensions: true,
        maxFileSize: 5 * 1024 * 1024
      });
      try {
        console.log('Parsing form...');
        const [fields, files] = await new Promise((resolve, reject) => {
          form.parse(request.raw.req, (err, fields, files) => {
            if (err) {
              console.error('Error parsing form:', err);
              reject(err);
            }
            console.log('Form parsed successfully:', { fieldKeys: Object.keys(fields), fileKeys: Object.keys(files) });
            resolve([fields, files]);
          });
        });
        console.log('Fields:', fields);
        console.log('Files:', files);
        // Helper to get single value
        const getSingleValue = (val) => Array.isArray(val) ? val[0] : val;

        const title = getSingleValue(fields.title);
        const slug = getSingleValue(fields.slug);
        const content = getSingleValue(fields.content);
        const category = getSingleValue(fields.category);
        const tags = getSingleValue(fields.tags);
        const author = getSingleValue(fields.author);
        const readTime = getSingleValue(fields.readTime);
        const coverImageUrl = getSingleValue(fields.coverImage);

        if (!title || !slug || !content || !category) {
          console.error('Field wajib kosong:', fields);
          return h.response({ error: 'Field wajib tidak boleh kosong' }).code(400);
        }
        let coverImage = null;
        if (files.image) {
          try {
            console.log('Processing image upload...');
            let file = Array.isArray(files.image) ? files.image[0] : files.image;

            if (file.filepath && !file.buffer) {
              const buffer = await fs.readFile(file.filepath);
              file = {
                buffer,
                mimetype: file.mimetype || file.type || 'image/jpeg',
                originalname: file.originalFilename || file.name || 'image.jpg',
                size: file.size || buffer.length
              };
            }
            const imageInfo = await storeArticleImage(file);
            coverImage = `/uploads/articles/${imageInfo.filename}`;
            console.log('Image processed successfully:', coverImage);
          } catch (imgErr) {
            console.error('Error processing image:', imgErr);
            throw imgErr;
          }
        } else {
          console.log('No image file provided');
        }
        const articleData = {
          title,
          slug,
          content,
          excerpt: getSingleValue(fields.excerpt),
          category,
          tags,
          author: author || 'Tim EcoWaste',
          readTime: parseInt(readTime) || 5,
          coverImage: coverImage || coverImageUrl,
          isPublished: true
        };
        console.log('Data untuk Prisma:', articleData);
        try {
          console.log('Creating article in DB...');
          const article = await request.server.app.prisma.article.create({ data: articleData });
          console.log('Article created successfully:', article.id);
          return h.response(article).code(201);
        } catch (dbErr) {
          console.error('Error Prisma:', dbErr);
          return h.response({ error: dbErr.message, details: dbErr.meta || dbErr }).code(500);
        }
      } catch (error) {
        console.error('Error creating article:', error);
        return h.response({ error: error.message || 'Failed to create article', details: error.stack }).code(500);
      }
    }
  },
  {
    method: 'DELETE', path: '/api/admin/articles/{id}',
    handler: async (request, h) => {
      try {
        const { id } = request.params;

        if (!id) {
          return h.response({
            error: 'ID artikel tidak valid.'
          }).code(400);
        }

        const article = await request.server.app.prisma.article.findUnique({
          where: { id: id }
        });

        if (!article) {
          return h.response({
            error: 'Artikel tidak ditemukan.'
          }).code(404);
        }

        await request.server.app.prisma.article.delete({
          where: { id: id }
        });

        return h.response({
          message: 'Artikel berhasil dihapus',
          id: id
        }).code(200);
      } catch (error) {
        console.error('Error deleting article:', error);
        return h.response({
          error: error.message || 'Gagal menghapus artikel.'
        }).code(500);
      }
    }
  }
];
