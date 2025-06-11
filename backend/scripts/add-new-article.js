// Script untuk menambahkan artikel baru
const { PrismaClient } = require('@prisma/client');

// Konfigurasi Prisma Client dengan path database yang benar
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "file:../database/prisma/dev.db"
    }
  }
});

async function addNewArticle() {
  try {
    // Data artikel baru
    const newArticle = {
      title: "Mengapa Sampah Plastik Menjadi Masalah Global",
      slug: "mengapa-sampah-plastik-menjadi-masalah-global",
      excerpt: "Dampak sampah plastik terhadap lingkungan global dan solusi yang dapat kita terapkan untuk mengatasi masalah ini.",
      content: `
        <h2>Masalah Global Sampah Plastik</h2>
        <p>Sampah plastik telah menjadi masalah lingkungan utama di seluruh dunia. Plastik membutuhkan waktu ratusan tahun untuk terurai, mencemari lautan, merusak ekosistem, dan membahayakan kehidupan laut. Penggunaan plastik sekali pakai yang berlebihan memperparah kondisi ini.</p>
        
        <h3>Dampak Terhadap Lingkungan</h3>
        <p>Setiap tahun, jutaan ton sampah plastik berakhir di lautan kita. Ini menciptakan "pulau sampah" di berbagai samudera dan mengancam kehidupan laut yang sering salah mengira plastik sebagai makanan. Lebih dari 100.000 hewan laut mati setiap tahun karena menelan atau terjerat plastik.</p>
        
        <h3>Tantangan Daur Ulang</h3>
        <p>Meskipun daur ulang adalah solusi yang sering dianjurkan, kenyataannya kurang dari 10% plastik di dunia benar-benar didaur ulang. Kompleksitas bahan plastik dan biaya pengolahan menjadi kendala utama.</p>
        
        <h3>Solusi yang Dibutuhkan</h3>
        <p>Untuk mengatasi masalah ini, diperlukan pendekatan komprehensif yang meliputi:</p>
        <ul>
          <li>Pengurangan penggunaan plastik sekali pakai</li>
          <li>Peningkatan infrastruktur dan teknologi daur ulang</li>
          <li>Pengembangan alternatif ramah lingkungan</li>
          <li>Edukasi dan kampanye kesadaran masyarakat</li>
          <li>Kebijakan dan regulasi yang lebih ketat</li>
        </ul>
        
        <h3>Apa yang Dapat Kita Lakukan?</h3>
        <p>Sebagai individu, kita dapat berperan dengan mengurangi penggunaan plastik sekali pakai, membawa tas belanja sendiri, menggunakan botol air yang dapat digunakan kembali, dan mendukung produk dari perusahaan yang berkomitmen pada keberlanjutan.</p>
        
        <p>Dengan tindakan kolektif, kita dapat membantu mengurangi dampak plastik pada lingkungan dan menciptakan masa depan yang lebih berkelanjutan untuk generasi mendatang.</p>
      `,      coverImage: "https://images.unsplash.com/photo-1604187351574-c75ca79f5807",
      category: "Pengelolaan Plastik",
      tags: "plastik,lingkungan,daur ulang,global",
      author: "Tim EcoWaste",
      readTime: 8,
      viewCount: 0,
      isPublished: true,
      createdAt: new Date("2025-06-09T00:00:00Z")
    };

    // Tambahkan artikel baru ke database
    const article = await prisma.article.create({
      data: newArticle
    });

    console.log('Artikel baru berhasil ditambahkan:');
    console.log(`ID: ${article.id}`);
    console.log(`Judul: ${article.title}`);
    console.log(`Slug: ${article.slug}`);
    console.log(`Kategori: ${article.category}`);
    console.log(`Tanggal Publikasi: ${article.createdAt}`);

    return article;
  } catch (error) {
    console.error('Error menambahkan artikel:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Jalankan fungsi
addNewArticle()
  .then(() => console.log('Proses selesai'))
  .catch(err => console.error('Proses gagal:', err));
