const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function migrateWasteBanksData() {
  try {
    console.log('🚀 Starting waste banks data migration...');
    
    // Read JSON file from frontend
    const jsonPath = path.join(__dirname, '..', '..', 'frontend', 'src', 'components', 'features', 'maps', 'wastebanks.json');
    
    if (!fs.existsSync(jsonPath)) {
      console.error('❌ JSON file not found at:', jsonPath);
      process.exit(1);
    }
    
    const wasteBanksData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    console.log(`📄 Found ${wasteBanksData.length} waste banks in JSON file`);

    // Clear existing data
    console.log('🗑️ Clearing existing waste banks data...');
    await prisma.wasteBank.deleteMany();

    // Insert data in batches to avoid overwhelming the database
    const batchSize = 100;
    let processedCount = 0;

    for (let i = 0; i < wasteBanksData.length; i += batchSize) {
      const batch = wasteBanksData.slice(i, i + batchSize);
      
      // Prepare batch data with validation
      const validBatch = batch
        .filter(bank => {
          // Only include banks with valid coordinates and name
          return bank.nama && 
                 bank.alamat && 
                 typeof bank.latitude === 'number' && 
                 typeof bank.longitude === 'number' &&
                 !isNaN(bank.latitude) && 
                 !isNaN(bank.longitude);
        })
        .map(bank => ({
          nama: bank.nama.trim(),
          alamat: bank.alamat.trim(),
          latitude: bank.latitude,
          longitude: bank.longitude,
          telepon: bank.telepon || null,
          email: bank.email || null,
          jamOperasi: bank.jamOperasi || null,
          jenisWaste: bank.jenisWaste || null,
          deskripsi: bank.deskripsi || null,
          isActive: true
        }));

      if (validBatch.length > 0) {
        await prisma.wasteBank.createMany({
          data: validBatch
        });

        processedCount += validBatch.length;
        console.log(`✅ Processed ${processedCount}/${wasteBanksData.length} waste banks`);
      }
    }

    console.log(`🎉 Migration completed! Successfully migrated ${processedCount} waste banks to database`);

    // Verify the data
    const totalCount = await prisma.wasteBank.count();
    console.log(`📊 Total waste banks in database: ${totalCount}`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
if (require.main === module) {
  migrateWasteBanksData();
}

module.exports = migrateWasteBanksData;
