import ffStalk from 'x-ff-stalk';
async function test() {
  try {
    const data = await ffStalk('123456789');
    console.log(data);
  } catch (e) {
    console.error(e);
  }
}
test();
