const axios = require('axios');

async function testAllRegions(uid) {
  const regions = ['ME', 'IND', 'BR', 'US', 'SG', 'ID', 'EU', 'VN', 'TH', 'PK', 'BD', 'CIS'];
  for (const r of regions) {
    try {
      const res = await axios.get(`https://freefireinfo-zy9l.onrender.com/api/v1/player-profile?uid=${uid}&server=${r}`);
      if (res.data.status === 'success') {
        console.log(`Found in region ${r}:`, res.data.player.nickname);
        return;
      }
    } catch (e) {
      if (e.response && e.response.status === 404) {
        // not found here
      } else {
        console.log(`Error in ${r}:`, e.message);
      }
    }
  }
  console.log("Not found in any region");
}

testAllRegions('9067719977');
