// Test classification endpoint with the created user

async function testClassification() {
  try {
    console.log('Testing classification...');
    
    // First login to get a token
    const loginResponse = await fetch('http://localhost:3002/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'testuser@example.com',
        password: 'testpassword123'
      }),
    });

    const loginResult = await loginResponse.json();
    
    if (!loginResponse.ok) {
      console.log('❌ Login failed:', loginResult.error);
      return;
    }

    console.log('✅ Login successful, token received');
    
    // Test classification with a dummy image
    // Create a simple base64 image for testing
    const dummyImageData = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';
    
    const classificationResponse = await fetch('http://localhost:3002/api/classify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${loginResult.token}`
      },
      body: JSON.stringify({
        image: dummyImageData
      }),
    });

    const classificationResult = await classificationResponse.json();
    console.log('Classification response status:', classificationResponse.status);
    console.log('Classification result:', classificationResult);

    if (classificationResponse.ok) {
      console.log('✅ Classification successful!');
      console.log('Usage info:', classificationResult.usage);
    } else {
      console.log('❌ Classification failed:', classificationResult.error);
    }

  } catch (error) {
    console.error('Test error:', error.message);
  }
}

testClassification();
