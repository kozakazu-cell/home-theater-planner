import https from 'https';

https.get('https://www.valerion.com/jp/projector', {
  headers: { 'User-Agent': 'Mozilla/5.0' }
}, (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    const text = data.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
    console.log(text.substring(0, 1500));
    const items = text.match(/VisionMaster [a-zA-Z0-9 ]+/g) || [];
    console.log(Array.from(new Set(items)));
  });
}).on('error', console.error);
