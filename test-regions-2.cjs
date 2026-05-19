const axios = require('axios');
axios.get('https://freefireinfo-zy9l.onrender.com/api/v1/player-profile?uid=9067719977&server=ME')
  .then(r => console.log('ME:', r.data.status))
  .catch(e => console.log('ME ERROR:', e.response?.status));
axios.get('https://freefireinfo-zy9l.onrender.com/api/v1/player-profile?uid=9067719977&server=US')
  .then(r => console.log('US:', r.data.status))
  .catch(e => console.log('US ERROR:', e.response?.status));
