import https from 'https';

https.get('https://www.valerion.com/jp/blog/projector-screen-size-viewing-distance-guide', {
  headers: { 'User-Agent': 'Mozilla/5.0' }
}, (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    const text = data.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
    console.log(text.substring(0, 4000));
    console.log(text.substring(4000, 8000));
  });
}).on('error', console.error);
