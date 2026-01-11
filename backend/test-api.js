const axios = require('axios');

async function testAPI() {
  try {
    console.log('Testing login...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      username: 'admin',
      password: 'admin123'
    });
    console.log('Login successful:', loginResponse.data);
    
    const token = loginResponse.data.token;
    console.log('Token received');
    
    console.log('Testing inventory fetch...');
    const inventoryResponse = await axios.get('http://localhost:5000/api/inventory', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('Inventory data:', inventoryResponse.data);
    
    console.log('Testing adding an item...');
    const addItemResponse = await axios.post('http://localhost:5000/api/inventory', {
      name: 'Test Item',
      category: 'Grains',
      quantity: 10,
      unit: 'kg',
      reorderLevel: 5
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('Add item response:', addItemResponse.data);
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testAPI();