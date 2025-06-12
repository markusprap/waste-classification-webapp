const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = [
  {
    method: 'POST',
    path: '/api/admin/articles',
    handler: async (request, h) => {
      try {
        const payload = request.payload;
        
        if (!payload.title || !payload.slug || !payload.content || !payload.category) {
          return h.response({ 
            error: 'Data tidak lengkap. Harap isi semua field yang wajib.' 
          }).code(400);
        }
        
        const existingArticle = await prisma.article.findUnique({
          where: { slug: payload.slug }
        });
        
        if (existingArticle) {
          return h.response({ 
            error: 'Artikel dengan slug ini sudah ada. Gunakan slug yang berbeda.' 
          }).code(409);
        }
        
        const article = await prisma.article.create({
          data: {
            title: payload.title,
            slug: payload.slug,
            excerpt: payload.excerpt || payload.title,
            content: payload.content,
            coverImage: payload.coverImage,
            category: payload.category,
            tags: payload.tags || '',
            author: payload.author || 'Tim EcoWaste',
            readTime: parseInt(payload.readTime) || 5,
            isPublished: payload.isPublished !== undefined ? payload.isPublished : true,
            viewCount: 0,
            createdAt: payload.createdAt ? new Date(payload.createdAt) : new Date(),
          }
        });
        
        return h.response({ 
          message: 'Artikel berhasil dibuat',
          article: {
            id: article.id,
            title: article.title,
            slug: article.slug,
            category: article.category,
            createdAt: article.createdAt
          }
        }).code(201);
      } catch (error) {
        console.error('Error creating article:', error);
        return h.response({ 
          error: 'Gagal membuat artikel. Silakan coba lagi nanti.' 
        }).code(500);
      }
    }
  },
  {
    method: 'DELETE',
    path: '/api/admin/articles/{id}',
    handler: async (request, h) => {
      try {
        const { id } = request.params;
        
        if (!id) {
          return h.response({ 
            error: 'ID artikel tidak valid.' 
          }).code(400);
        }
          
        const article = await prisma.article.findUnique({
          where: { id: id }
        });
        
        if (!article) {
          return h.response({ 
            error: 'Artikel tidak ditemukan.' 
          }).code(404);
        }
        
        await prisma.article.delete({
          where: { id: id }
        });
        
        return h.response({ 
          message: 'Artikel berhasil dihapus',
          id: parseInt(id)
        }).code(200);
      } catch (error) {
        console.error('Error deleting article:', error);
        return h.response({ 
          error: 'Gagal menghapus artikel. Silakan coba lagi nanti.' 
        }).code(500);
      }
    }
  }
];
