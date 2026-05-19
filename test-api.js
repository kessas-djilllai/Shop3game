const axios = require('axios');
axios.get('https://freefireinfo-zy9l.onrender.com/api/v1/player-stats?uid=9067719977').then(res => console.log(JSON.stringify(res.data, null, 2))).catch(err => console.error(err.message));
