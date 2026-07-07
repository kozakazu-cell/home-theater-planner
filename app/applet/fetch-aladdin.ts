import * as fs from 'fs';
fetch('https://www.aladdinx.jp/pages/aladdin-x2-plus-spec-use').then(res => res.text()).then(body => {
  const tableIndex = body.indexOf('インチ');
  console.log(body.substring(tableIndex - 100, tableIndex + 1000).replace(/<[^>]+>/g, ' '));
}).catch(console.log);
