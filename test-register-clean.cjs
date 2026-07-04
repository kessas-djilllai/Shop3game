const axios = require('axios');
axios.post('http://localhost:3000/api/register', { account_id: 'TestUser123!', password: 'password123' })
  .then(res => console.log('Success:', res.data))
  .catch(err => console.log('Error:', err.response?.data || err.message));
