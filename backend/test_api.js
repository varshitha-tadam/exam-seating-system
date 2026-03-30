const axios = require('axios');

async function testAPI() {
  try {
    const res = await axios.get('http://localhost:5001/');
    console.log('Health check:', res.data);
    
    // We can't easily get data without token, but health check is enough to see if it's up.
  } catch (err) {
    console.error('API Error:', err.message);
  }
}

testAPI();
