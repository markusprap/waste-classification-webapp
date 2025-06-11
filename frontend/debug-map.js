// Debug script to test waste bank loading and filtering
const http = require('http');

async function debugWasteBanks() {
  try {
    console.log('🔍 Fetching waste banks...');
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/waste-banks',
      method: 'GET'
    };
    
    const data = await new Promise((resolve, reject) => {
      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(e);
          }
        });
      });
      
      req.on('error', (e) => {
        reject(e);
      });
      
      req.end();
    });
    
    console.log('📊 Total waste banks:', data.data.length);
    
    // Check first few records
    const firstFew = data.data.slice(0, 5);
    console.log('📋 First 5 waste banks:');
    firstFew.forEach((bank, index) => {
      console.log(`${index + 1}. ${bank.nama} - Lat: ${bank.latitude}, Lng: ${bank.longitude}`);
    });
    
    // Filter valid coordinates
    const validCoords = data.data.filter(d => d.latitude && d.longitude);
    console.log('✅ Waste banks with valid coordinates:', validCoords.length);
      // Test with a sample location (Luwu Timur, Sulawesi - where the waste banks are)
    const testLocation = { lat: -2.55, lng: 120.75 };
    console.log('🗺️ Testing with location in Sulawesi:', testLocation);
    
    function calculateDistance(lat1, lng1, lat2, lng2) {
      const R = 6371;
      const dLat = (lat2 - lat1) * (Math.PI / 180);
      const dLng = (lng2 - lng1) * (Math.PI / 180);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    }
    
    const withDistances = validCoords.map(bank => ({
      ...bank,
      distance: calculateDistance(testLocation.lat, testLocation.lng, bank.latitude, bank.longitude)
    }));
    
    const within50km = withDistances.filter(bank => bank.distance <= 50);
    const within100km = withDistances.filter(bank => bank.distance <= 100);
    
    console.log('📍 Waste banks within 50km of Jakarta:', within50km.length);
    console.log('📍 Waste banks within 100km of Jakarta:', within100km.length);
    
    if (within50km.length > 0) {
      console.log('🎯 Closest waste banks:');
      within50km.sort((a, b) => a.distance - b.distance).slice(0, 3).forEach((bank, index) => {
        console.log(`${index + 1}. ${bank.nama} - ${bank.distance.toFixed(2)}km`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

debugWasteBanks();
