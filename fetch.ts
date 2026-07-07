import * as fs from 'fs';
fetch('https://www.aladdinx.jp/pages/aladdin-x2-plus-spec-use').then(res => res.text()).then(body => {
  const tableIndex = body.indexOf('0.85');
  console.log(body.substring(tableIndex - 300, tableIndex + 1000).replace(/<[^>]+>/g, ' ').replace(/\\s+/g, ' '));
}).catch(console.log);
