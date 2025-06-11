const { PrismaClient } = require('@prisma/client');
const path = require('path');

const dbPath = path.resolve(__dirname, '..', 'database', 'prisma', 'dev.db');
process.stdout.write(`Database path: ${dbPath}\n`);

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: `file:${dbPath}`
    }
  },
  log: ['query', 'error', 'warn']
});

async function checkAndSeed() {
  try {
    // First, check current count
    const currentCount = await prisma.article.count();
    process.stdout.write(`Current article count: ${currentCount}\n`);
    
    // Get category distribution
    const categories = await prisma.article.groupBy({
      by: ['category'],
      _count: { category: true }
    });
    
    process.stdout.write('\nCategory distribution:\n');
    categories.forEach(cat => {
      process.stdout.write(`${cat.category}: ${cat._count.category}\n`);
    });

    // Add new articles if needed
    if (currentCount < 50) {
      process.stdout.write('\nNeed to add more articles...\n');
      
      // Define new article data
      const newArticles = [
        {
          title: "Model Kemitraan dalam Pengelolaan Sampah: Business-to-Community",
          slug: "model-kemitraan-pengelolaan-sampah-b2c",
          category: "Zero Waste",
          tags: "kemitraan,business,community,pengelolaan sampah,model bisnis",
          excerpt: "Eksplorasi model kemitraan yang menghubungkan pelaku bisnis dengan komunitas dalam pengelolaan sampah untuk menciptakan value chain yang berkelanjutan.",
          readTime: 15,
          content: `[Long content will be added here]`
        },
        {
          title: "Sistem Smart Collection untuk Efisiensi Pengangkutan Sampah",
          slug: "sistem-smart-collection-efisiensi-pengangkutan",
          category: "Teknologi",
          tags: "smart collection,IoT,efisiensi,pengangkutan,teknologi",
          excerpt: "Implementasi sistem smart collection berbasis IoT untuk optimasi rute dan jadwal pengangkutan sampah di wilayah perkotaan.",
          readTime: 13,
          content: `[Long content will be added here]`
        },
        {
          title: "Pengembangan Habitat Mikroorganisme dalam Sistem Pengomposan",
          slug: "pengembangan-habitat-mikroorganisme-pengomposan",
          category: "Pengomposan",
          tags: "mikroorganisme,habitat,pengomposan,biologi,efisiensi",
          excerpt: "Panduan teknis mengoptimalkan habitat mikroorganisme untuk meningkatkan efisiensi proses pengomposan.",
          readTime: 14,
          content: `[Long content will be added here]`
        }
      ];
      
      // Add articles one by one
      for (const article of newArticles) {
        try {
          const existing = await prisma.article.findUnique({
            where: { slug: article.slug }
          });
          
          if (!existing) {
            await prisma.article.create({
              data: {
                ...article,
                views: Math.floor(Math.random() * 200) + 50,
                createdAt: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)),
                updatedAt: new Date()
              }
            });
            process.stdout.write(`✓ Created: ${article.title}\n`);
          } else {
            process.stdout.write(`→ Skipped existing: ${article.title}\n`);
          }
        } catch (error) {
          process.stdout.write(`✗ Failed to create ${article.title}: ${error.message}\n`);
        }
      }
      
      // Get final count
      const finalCount = await prisma.article.count();
      process.stdout.write(`\nFinal article count: ${finalCount}\n`);
      
    } else {
      process.stdout.write('\nTarget article count reached!\n');
    }
    
  } catch (error) {
    process.stdout.write(`Error: ${error.message}\n`);
    throw error;
  } finally {
    await prisma.$disconnect();
    process.stdout.write('\nDatabase connection closed\n');
  }
}

checkAndSeed()
  .catch(error => {
    process.stdout.write(`Failed: ${error.message}\n`);
    process.exit(1);
  });
