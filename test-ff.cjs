const ffStalk = require('x-ff-stalk');
async function test() {
  try {
    const data = await ffStalk('123456789'); // Dummy ID, maybe returns error or null
    console.log(data);
  } catch (e) {
    console.error(e);
  }
}
test();
