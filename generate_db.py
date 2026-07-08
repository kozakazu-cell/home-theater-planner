#!/usr/bin/env python3
import csv
import json

# Read the CSV
machines = []
with open('プライムデー_プロジェクター一覧.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for i, row in enumerate(reader, 1):
        # Clean up type mapping
        type_map = {
            'モバイル': 'Mobile',
            'ホーム': 'Standard',
            '超短焦点': 'UST',
            '短焦点': 'Standard',
            'ポータブル': 'Mobile',
            'ジンバル': 'Mobile',
            '照明': 'Standard',
            '天井': 'Mobile',
        }
        
        ptype = 'Standard'
        for key, val in type_map.items():
            if key in row.get('タイプ', ''):
                ptype = val
                break
        
        machine = {
            'id': f"{row['メーカー'].lower()}-{row['ASIN'].lower()}",
            'brand': row['メーカー'],
            'name': row['商品名'],
            'type': ptype,
            'throwRatio': {'min': 1.2, 'max': 1.2},
            'throwDistanceOffset': 0,
            'offsetPercent': 50,
            'size': {'w': 200, 'h': 150, 'd': 150},
            'weight': 2.0,
            'imageUrl': f"/images/{row['ASIN']}.jpg",
            'websiteUrl': row['商品URL'],
            'resolution': row.get('解像度', ''),
            'brightness': row.get('輝度', '').replace(' ', ''),
            'lightSource': row.get('光源', ''),
            'projectionMethod': 'DLP',
            'minSizeInch': 40,
            'maxSizeInch': 200,
            'os': row.get('OS', ''),
            'amazonASIN': row['ASIN'],
            'priceJPY': int(row['参考価格']) if row['参考価格'] else None,
            'salePriceJPY': int(row['セール価格(税込)']) if row['セール価格(税込)'] else None,
            'discountPercent': float(row['割引率'].rstrip('%')) if row['割引率'] else None,
            'isOnPrimeDaySale': 'プライムデー' in row.get('セール種別', ''),
            'saleType': row.get('セール種別', ''),
        }
        machines.append(machine)

# Generate TypeScript
print("export const PROJECTOR_DB: ProjectorModel[] = [")
for i, m in enumerate(machines):
    print(f"""  {{
    id: '{m['id']}',
    brand: '{m['brand']}',
    name: '{m['name']}',
    type: '{m['type']}',
    throwRatio: {{ min: {m['throwRatio']['min']}, max: {m['throwRatio']['max']} }},
    throwDistanceOffset: {m['throwDistanceOffset']},
    offsetPercent: {m['offsetPercent']},
    size: {{ w: {m['size']['w']}, h: {m['size']['h']}, d: {m['size']['d']} }},
    weight: {m['weight']},
    imageUrl: '{m['imageUrl']}',
    websiteUrl: '{m['websiteUrl']}',
    resolution: '{m['resolution']}',
    brightness: '{m['brightness']}',
    lightSource: '{m['lightSource']}',
    projectionMethod: '{m['projectionMethod']}',
    minSizeInch: {m['minSizeInch']},
    maxSizeInch: {m['maxSizeInch']},
    os: '{m['os']}',
    amazonASIN: '{m['amazonASIN']}',
    priceJPY: {m['priceJPY']},
    salePriceJPY: {m['salePriceJPY']},
    discountPercent: {m['discountPercent']},
    isOnPrimeDaySale: {str(m['isOnPrimeDaySale']).lower()},
    saleType: '{m['saleType']}',
  }},""")

print("];")
