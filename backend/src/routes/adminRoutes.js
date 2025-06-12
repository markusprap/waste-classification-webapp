const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.post('/articles', async (req, res) => {
  try {
    const {
      title,
      slug,
      excerpt,
      content,
      coverImage,
      category,
      tags,
      author,
      readTime,
      isPublished = true
    } = req.body;

    if (!title || !slug || !content || !category) {
      return res.status(400).json({ error: 'Title, slug, content, and category are required' });
    }

    const existingArticle = await prisma.article.findUnique({
      where: { slug }
    });

    if (existingArticle) {
      return res.status(409).json({ error: 'An article with this slug already exists' });
    }

    const article = await prisma.article.create({
      data: {
        title,
        slug,
        excerpt: excerpt || title,
        content,
        coverImage,
        category,
        tags: typeof tags === 'string' ? tags : (Array.isArray(tags) ? tags.join(',') : ''),
        author: author || 'Tim EcoWaste',
        readTime: readTime || 5,
        isPublished,
        viewCount: 0
      }
    });

    res.status(201).json(article);
  } catch (error) {
    console.error('Error creating article:', error);
    res.status(500).json({ error: 'Failed to create article' });
  }
});

module.exports = router;
