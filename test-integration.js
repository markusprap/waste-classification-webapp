const fetch = globalThis.fetch || require('node-fetch');
const fs = require('fs');
const FormData = require('form-data');

async function testMLServiceDirect() {
    console.log('🧪 Testing ML Service directly...');
    
    try {        const testImagePath = 'ml-service/test_images/botol-plastik.png';
        const testImageBuffer = fs.readFileSync(testImagePath);
        
        const formData = new FormData();
        formData.append('image', testImageBuffer, {
            filename: 'botol-plastik.png',
            contentType: 'image/png'
        });

        const response = await fetch('http://localhost:5000/api/classify', {
            method: 'POST',
            body: formData,
            headers: formData.getHeaders(),
        });

        if (response.ok) {
            const result = await response.json();
            console.log('✅ ML Service direct test successful:', result);
            return true;
        } else {
            const errorText = await response.text();
            console.error('❌ ML Service direct test failed:', response.status, errorText);
            return false;
        }    } catch (error) {
        console.error('❌ ML Service direct test error:', error.message);
        return false;
    }
}

async function testBackendAPI() {
    console.log('🧪 Testing Backend API...');
    
    try {        const testImageBase64 = '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCvAA8A';

        const response = await fetch('http://localhost:3001/api/classify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                image: testImageBase64 
            }),
        });

        if (response.ok) {
            const result = await response.json();
            console.log('✅ Backend API test successful:', result);
            return true;
        } else {
            const errorText = await response.text();
            console.error('❌ Backend API test failed:', response.status, errorText);
            return false;
        }
    } catch (error) {
        console.error('❌ Backend API test error:', error.message);
        return false;
    }
}

async function testFrontendAPI() {
    console.log('🧪 Testing Frontend API...');
    
    try {        const testImageDataURL = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCvAA8A';

        const response = await fetch('http://localhost:3001/api/classify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                imageData: testImageDataURL 
            }),
        });

        if (response.ok) {
            const result = await response.json();
            console.log('✅ Frontend API test successful:', result);
            return true;
        } else {
            const errorText = await response.text();
            console.error('❌ Frontend API test failed:', response.status, errorText);
            return false;
        }
    } catch (error) {
        console.error('❌ Frontend API test error:', error.message);
        return false;
    }
}

async function runAllTests() {
    console.log('🚀 Starting integration tests...\n');
    
    const mlTest = await testMLServiceDirect();
    console.log('');
    
    const backendTest = await testBackendAPI();
    console.log('');
    
    const frontendTest = await testFrontendAPI();
    console.log('');
    
    console.log('📊 Test Results:');
    console.log(`ML Service Direct: ${mlTest ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Backend API: ${backendTest ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Frontend API: ${frontendTest ? '✅ PASS' : '❌ FAIL'}`);
    
    if (mlTest && backendTest && frontendTest) {
        console.log('\n🎉 All tests passed! Integration is working correctly.');
    } else {
        console.log('\n⚠️ Some tests failed. Check the logs above for details.');
    }
}

runAllTests().catch(console.error);
