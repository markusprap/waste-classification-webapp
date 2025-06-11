const { PrismaClient } = require('@prisma/client');
const path = require('path');
const fs = require('fs');

const dbPath = path.resolve(__dirname, '..', 'database', 'prisma', 'dev.db');
const logPath = path.resolve(__dirname, 'article-counter.log');

// Clear previous log
fs.writeFileSync(logPath, '');

// Create a logging function
const log = (msg) => {
  const line = msg + '\n';
  fs.appendFileSync(logPath, line);
  console.log(msg);
};

(async () => {
  const prisma = new PrismaClient();
  
  try {
    log('Database path: ' + dbPath);
    log('Starting article count...');

    const count = await prisma.article.count();
    log(`Total articles: ${count}`);

    const categories = await prisma.article.groupBy({
      by: ['category'],
      _count: { category: true }
    });

    log('\nCategory distribution:');
    for (const cat of categories) {
      log(`${cat.category}: ${cat._count.category}`);
    }

    const articles = await prisma.article.findMany({
      select: {
        title: true,
        category: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    log('\nMost recent articles:');
    articles.slice(0, 10).forEach(article => {
      log(`${article.title} (${article.category}) - ${article.createdAt.toISOString()}`);
    });

  } catch (error) {
    log('Error: ' + error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
    log('\nDatabase connection closed');
    console.log(`Results written to ${logPath}`);
  }
})();
