// script to check if there are articles in the database
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkArticles() {
  try {
    // Count total articles
    const totalArticles = await prisma.article.count({
      where: { isPublished: true }
    });
    
    console.log(`Total published articles: ${totalArticles}`);
    
    if (totalArticles === 0) {
      console.log('No articles found, seeding test data...');
      
      // Create sample articles
      await prisma.article.createMany({
        data: [
          {
            title: 'Cara Memulai Daur Ulang di Rumah',
            slug: 'cara-memulai-daur-ulang-di-rumah',
            excerpt: 'Panduan langkah demi langkah untuk memulai kebiasaan daur ulang di rumah Anda.',
            content: '<h2>Langkah-langkah Memulai Daur Ulang</h2><p>Daur ulang adalah salah satu cara termudah dan paling efektif untuk mengurangi dampak lingkungan Anda. Berikut adalah beberapa langkah sederhana untuk memulai:</p><ul><li>Pisahkan sampah berdasarkan jenisnya: plastik, kertas, kaca, dan logam</li><li>Bilas wadah bekas makanan sebelum didaur ulang</li><li>Cari tahu apa yang bisa dan tidak bisa didaur ulang di daerah Anda</li></ul><p>Dengan memulai kebiasaan kecil ini, Anda sudah berkontribusi besar pada pelestarian lingkungan.</p>',
            coverImage: 'https://images.unsplash.com/photo-1604187351574-c75ca79f5807',
            category: 'Daur Ulang',
            tags: ['pemula', 'rumah tangga', 'tips'],
            author: 'Tim EcoWaste',
            readTime: 5,
            viewCount: 120,
            isPublished: true,
            createdAt: new Date('2025-01-15')
          },
          {
            title: 'Manfaat Kompos untuk Tanaman Rumah',
            slug: 'manfaat-kompos-untuk-tanaman-rumah',
            excerpt: 'Mengapa kompos organik adalah nutrisi terbaik untuk tanaman hias dan kebun rumah Anda.',
            content: '<h2>Mengapa Kompos Penting?</h2><p>Kompos adalah pupuk alami yang kaya akan nutrisi dan mineral penting untuk pertumbuhan tanaman. Berikut beberapa manfaatnya:</p><ul><li>Meningkatkan kesuburan tanah</li><li>Mengurangi kebutuhan pupuk kimia</li><li>Membantu tanah menahan air lebih baik</li><li>Mengurangi sampah organik yang berakhir di TPA</li></ul><p>Anda dapat membuat kompos sendiri dari sisa makanan dan potongan tanaman.</p>',
            coverImage: 'https://images.unsplash.com/photo-1585314062604-1a357de8b000',
            category: 'Pengomposan',
            tags: ['berkebun', 'organik', 'tanaman'],
            author: 'Tim EcoWaste',
            readTime: 7,
            viewCount: 89,
            isPublished: true,
            createdAt: new Date('2025-02-10')
          },
          {
            title: 'Inovasi Terbaru dalam Teknologi Daur Ulang Plastik',
            slug: 'inovasi-terbaru-dalam-teknologi-daur-ulang-plastik',
            excerpt: 'Penemuan dan teknologi baru yang mengubah cara kita mendaur ulang plastik.',
            content: '<h2>Revolusi dalam Daur Ulang Plastik</h2><p>Plastik telah menjadi salah satu tantangan lingkungan terbesar, tetapi inovasi terbaru memberikan harapan. Beberapa teknologi menjanjikan meliputi:</p><ul><li>Enzim pengurai plastik yang dapat memecah polimer menjadi komponen dasarnya</li><li>Sistem daur ulang kimia yang mengubah plastik kembali menjadi bahan baku berkualitas tinggi</li><li>Aplikasi AI untuk penyortiran plastik yang lebih efisien</li></ul><p>Teknologi-teknologi ini dapat secara signifikan meningkatkan tingkat daur ulang global.</p>',
            coverImage: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9',
            category: 'Teknologi',
            tags: ['inovasi', 'plastik', 'masa depan'],
            author: 'Tim EcoWaste',
            readTime: 10,
            viewCount: 156,
            isPublished: true,
            createdAt: new Date('2025-03-05')
          }
        ]
      });
      
      console.log('Sample articles created successfully!');
    } else {
      // Display some article info
      const articles = await prisma.article.findMany({
        where: { isPublished: true },
        select: {
          id: true,
          title: true,
          slug: true,
          category: true
        },
        take: 5
      });
      
      console.log('Latest articles:');
      articles.forEach(article => {
        console.log(`- ${article.title} (${article.category})`);
      });
    }
  } catch (error) {
    console.error('Error checking articles:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkArticles();
