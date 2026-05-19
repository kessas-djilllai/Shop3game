const axios = require('axios');
axios.get('https://freefireinfo-zy9l.onrender.com/api/v1/player-profile?uid=9067719977&region=ME').then(res => console.log(JSON.stringify(res.data, null, 2))).catch(err => console.error(err.message));
axios.get('https://freefireinfo-zy9l.onrender.com/api/v1/player-profile?uid=9067719977&server=ME').then(res => console.log(JSON.stringify(res.data, null, 2))).catch(err => console.error(err.message));
