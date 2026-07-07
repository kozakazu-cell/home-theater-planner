import * as fs from 'fs';
fetch('https://www.aladdinx.jp/pages/aladdin-x2-plus-spec-use').then(res => res.text()).then(body => {
  const tableIndex = body.indexOf('inch');
  console.log(body.substring(tableIndex - 1000, tableIndex + 1000));
}).catch(console.log);
