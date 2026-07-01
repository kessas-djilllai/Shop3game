const axios = require('axios');
require('dotenv').config();
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_ANON_KEY;
axios.get(url + '/rest/v1/?apikey=' + key).then(r => console.log(Object.keys(r.data.definitions.users.properties))).catch(console.error);
