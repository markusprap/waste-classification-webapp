// Use built-in fetch for Node.js 18+

async function testAuth() {
  try {
    console.log('Testing registration...');
      // Test registration
    const registerResponse = await fetch('http://localhost:3002/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test User',
        email: 'testuser@example.com',
        password: 'testpassword123'
      }),
    });

    console.log('Register response status:', registerResponse.status);
    console.log('Register response headers:', Object.fromEntries(registerResponse.headers.entries()));
    
    const registerText = await registerResponse.text();
    console.log('Register response text:', registerText.substring(0, 500));
    
    let registerResult;
    try {
      registerResult = JSON.parse(registerText);
    } catch (parseError) {
      console.log('Failed to parse JSON:', parseError.message);
      return;
    }
    
    console.log('Registration result:', registerResult);

    if (registerResponse.ok) {
      console.log('✅ Registration successful!');
      
      // Test login
      console.log('Testing login...');
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
      console.log('Login result:', loginResult);

      if (loginResponse.ok) {
        console.log('✅ Login successful!');
        console.log('Token:', loginResult.token);
        console.log('User data:', loginResult.user);
        
        // Test profile endpoint
        console.log('Testing profile...');
        const profileResponse = await fetch('http://localhost:3002/api/auth/profile', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${loginResult.token}`,
          },
        });

        const profileResult = await profileResponse.json();
        console.log('Profile result:', profileResult);

        if (profileResponse.ok) {
          console.log('✅ Profile fetch successful!');
        } else {
          console.log('❌ Profile fetch failed:', profileResult.error);
        }
      } else {
        console.log('❌ Login failed:', loginResult.error);
      }
    } else {
      console.log('❌ Registration failed:', registerResult.error);
    }

  } catch (error) {
    console.error('Test error:', error.message);
  }
}

testAuth();
