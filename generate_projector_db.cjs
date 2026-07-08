const fs = require('fs');
const path = require('path');

// Read the CSV data
const csvContent = fs.readFileSync(
  path.join(__dirname, 'プライムデー_プロジェクター一覧.csv'),
  'utf-8'
);

// Parse CSV
const lines = csvContent.split('\n');
const headers = lines[0].split(',');
const projectors = [];

for (let i = 1; i < lines.length; i++) {
  if (!lines[i].trim()) continue;
  
  const values = lines[i].split(',');
  const row = {};
  headers.forEach((header, idx) => {
    row[header] = values[idx]?.trim() || '';
  });
  
  // Map CSV columns to ProjectorModel fields
  const typeMap = {
    'ホーム(ジンバル一体型)': 'Standard',
    'ホーム(ジンバル一体型・着脱式スピーカー)': 'Standard',
    'ホーム': 'Standard',
    'ホーム(セット品)': 'Standard',
    'ホーム(フラグシップ)': 'Standard',
    'ホーム(4K)': 'Standard',
    'モバイル(バッテリー内蔵)': 'Mobile',
    'モバイル(バッテリー内蔵・世界最小級)': 'Mobile',
    'ポータブル小型': 'Mobile',
    'ジンバル一体型小型': 'Mobile',
    'ジンバル一体型小型(150°角度調整)': 'Mobile',
    'ジンバル一体型': 'Mobile',
    'ポータブル': 'Mobile',
    'ポータブル(ジンバル一体型)': 'Mobile',
    'ポータブル(ジンバル一体型・回転ボトル型)': 'Mobile',
    'コンパクト(縦投影対応・回転ボトル型)': 'Mobile',
    '超短焦点(UST)': 'UST',
    '超短焦点(UST)(セット品)': 'UST',
    '小型ホーム': 'Mobile',
    '小型(スタンド一体型)': 'Mobile',
    '照明一体型(シーリング)': 'Standard',
    '照明一体型(シーリング・セット品)': 'Standard',
    '天井投影モバイル(バッテリー内蔵)': 'Mobile',
    '天井投影モバイル': 'Mobile',
    '短焦点(ビジネス向けDLP)': 'Standard',
    'ホーム(フリップ式スピーカー)': 'Mobile',
  };

  const parseBrightness = (brightness) => {
    return brightness.replace(/\s*/g, '');
  };

  const obj = {
    id: `${row['メーカー'].toLowerCase()}-${row['ASIN'].toLowerCase()}`,
    brand: row['メーカー'],
    name: row['商品名'],
    type: typeMap[row['タイプ']] || 'Standard',
    throwRatio: { min: 1.2, max: 1.2 },
    throwDistanceOffset: 0,
    offsetPercent: 50,
    size: { w: 200, h: 150, d: 150 },
    weight: 2.0,
    imageUrl: `/images/${row['ASIN']}.jpg`,
    websiteUrl: row['商品URL'],
    resolution: row['解像度'],
    brightness: parseBrightness(row['輝度']),
    lightSource: row['光源'],
    projectionMethod: 'DLP',
    minSizeInch: 40,
    maxSizeInch: 200,
    os: row['OS'],
    // 新フィールド
    amazonASIN: row['ASIN'],
    priceJPY: parseInt(row['参考価格']) || undefined,
    salePriceJPY: parseInt(row['セール価格(税込)']) || undefined,
    discountPercent: parseFloat(row['割引率']) * 100,
    isOnPrimeDaySale: row['セール種別'].includes('プライムデー'),
    saleType: row['セール種別'],
  };
  
  projectors.push(obj);
}

// Generate TypeScript code
const output = `// Auto-generated from プライムデー_プロジェクター一覧.csv
// Generated at: ${new Date().toISOString()}

export const PROJECTOR_DB: ProjectorModel[] = [
${projectors.map(p => `  {
    id: '${p.id}',
    brand: '${p.brand}',
    name: '${p.name}',
    type: '${p.type}',
    throwRatio: { min: ${p.throwRatio.min}, max: ${p.throwRatio.max} },
    throwDistanceOffset: ${p.throwDistanceOffset},
    offsetPercent: ${p.offsetPercent},
    size: { w: ${p.size.w}, h: ${p.size.h}, d: ${p.size.d} },
    weight: ${p.weight},
    imageUrl: '${p.imageUrl}',
    websiteUrl: '${p.websiteUrl}',
    resolution: '${p.resolution}',
    brightness: '${p.brightness}',
    lightSource: '${p.lightSource}',
    projectionMethod: '${p.projectionMethod}',
    minSizeInch: ${p.minSizeInch},
    maxSizeInch: ${p.maxSizeInch},
    os: '${p.os}',
    amazonASIN: '${p.amazonASIN}',
    priceJPY: ${p.priceJPY || 'undefined'},
    salePriceJPY: ${p.salePriceJPY || 'undefined'},
    discountPercent: ${p.discountPercent ? Math.round(p.discountPercent * 10) / 10 : 'undefined'},
    isOnPrimeDaySale: ${p.isOnPrimeDaySale},
    saleType: '${p.saleType}',
  },`).join('\n')}
];`;

console.log(output);
