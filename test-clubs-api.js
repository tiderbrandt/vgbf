// Test script to verify clubs API is working in production
// This simulates what the admin interface does when editing a club

const testClubData = {
  id: "test-club-123",
  name: "Test Club",
  description: "A test club for verification",
  address: "Test Address 123",
  postalCode: "12345",
  city: "Test City",
  email: "test@example.com",
  phone: "123-456-7890",
  website: "https://test.example.com",
  imageUrl: "",
  latitude: 0,
  longitude: 0,
  archeryTypes: ["Outdoor"],
  facilities: ["Range"],
  established: 2024,
  members: 10,
  achievements: []
};

const testAuth = {
  username: process.env.ADMIN_USERNAME || 'vgbf_admin',
  password: process.env.ADMIN_PASSWORD || 'default_password'
};

async function testClubsAPI() {
  try {
    console.log('Testing production clubs API...');
    
    // First get auth token
    const authResponse = await fetch('https://vgbf.vercel.app/api/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testAuth)
    });
    
    if (!authResponse.ok) {
      console.error('Auth failed:', authResponse.status, authResponse.statusText);
      return;
    }
    
    const authData = await authResponse.json();
    const token = authData.token;
    console.log('Auth successful, got token');
    
    // Now test PUT to clubs endpoint
    const putResponse = await fetch('https://vgbf.vercel.app/api/clubs', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(testClubData)
    });
    
    console.log('PUT response status:', putResponse.status);
    console.log('PUT response headers:', Object.fromEntries(putResponse.headers.entries()));
    
    if (putResponse.ok) {
      const responseData = await putResponse.json();
      console.log('SUCCESS! Response data:', responseData);
    } else {
      const errorText = await putResponse.text();
      console.error('PUT failed:', putResponse.status, putResponse.statusText);
      console.error('Error response:', errorText);
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testClubsAPI();
