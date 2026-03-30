const axios = require('axios');

async function finalVerify() {
  try {
    // 1. Login
    const loginRes = await axios.post('http://localhost:5001/login', {
      email: 'admin@examseat.com',
      password: 'Admin@2024!'
    });
    const token = loginRes.data.token;
    console.log('✅ Login successful as:', loginRes.data.user.role);

    const config = { headers: { Authorization: `Bearer ${token}` } };

    // 2. Test /exams
    const examsRes = await axios.get('http://localhost:5001/exams', config);
    console.log('✅ /exams fetch successful. Count:', examsRes.data.length);

    // 3. Test /stats
    const statsRes = await axios.get('http://localhost:5001/stats', config);
    console.log('✅ /stats fetch successful. Students:', statsRes.data.students);

    process.exit(0);
  } catch (err) {
    console.error('❌ Verification Failed:', err.response ? err.response.data : err.message);
    process.exit(1);
  }
}

finalVerify();
