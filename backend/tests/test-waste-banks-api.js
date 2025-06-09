const { PrismaClient } = require('@prisma/client');
const fetch = require('node-fetch');

const prisma = new PrismaClient();

// Simple test script for waste banks API
async function testWasteBanksAPI() {
  console.log('🚀 Testing Waste Banks API...\n');

  try {
    // Test 1: Get all waste banks
    console.log('1. Testing GET /api/waste-banks');
    const response1 = await fetch('http://localhost:3001/api/waste-banks');
    const data1 = await response1.json();
    
    if (data1.success && data1.data && data1.data.length > 0) {
      console.log('✅ GET all waste banks: SUCCESS');
      console.log(`   Found ${data1.count} waste banks`);
    } else {
      console.log('❌ GET all waste banks: FAILED');
      console.log('   Response:', data1);
    }

    // Test 2: Get single waste bank
    if (data1.data && data1.data.length > 0) {
      const testId = data1.data[0].id;
      console.log('\n2. Testing GET /api/waste-banks/:id');
      const response2 = await fetch(`http://localhost:3001/api/waste-banks/${testId}`);
      const data2 = await response2.json();
      
      if (data2.success && data2.data && data2.data.id === testId) {
        console.log('✅ GET single waste bank: SUCCESS');
        console.log(`   Retrieved waste bank: ${data2.data.nama}`);
      } else {
        console.log('❌ GET single waste bank: FAILED');
        console.log('   Response:', data2);
      }
    }

    // Test 3: Test with location filtering
    console.log('\n3. Testing GET /api/waste-banks with location filtering');
    const response3 = await fetch('http://localhost:3001/api/waste-banks?lat=-6.2088&lng=106.8456&radius=100&limit=5');
    const data3 = await response3.json();
    
    if (data3.success && data3.data) {
      console.log('✅ GET with location filtering: SUCCESS');
      console.log(`   Found ${data3.count} waste banks within radius`);
      if (data3.data.length > 0 && data3.data[0].distance !== undefined) {
        console.log(`   Distance calculation working: ${data3.data[0].distance.toFixed(2)} km`);
      }
    } else {
      console.log('❌ GET with location filtering: FAILED');
      console.log('   Response:', data3);
    }

    // Test 4: Test search functionality
    console.log('\n4. Testing GET /api/waste-banks with search');
    const response4 = await fetch('http://localhost:3001/api/waste-banks?search=BANK');
    const data4 = await response4.json();
    
    if (data4.success && data4.data) {
      console.log('✅ GET with search: SUCCESS');
      console.log(`   Found ${data4.count} waste banks matching "BANK"`);
    } else {
      console.log('❌ GET with search: FAILED');
      console.log('   Response:', data4);
    }

    console.log('\n🎉 Waste Banks API testing completed!');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
if (require.main === module) {
  testWasteBanksAPI();
}

module.exports = testWasteBanksAPI;
