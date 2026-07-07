export type Vector3 = {
  x: number;
  y: number; // height from floor
  z: number; // depth
};

export type Size3 = {
  w: number;
  h: number;
  d: number;
};

export type WallType = 'GypsumBoard' | 'Concrete' | 'Wood' | 'MDF' | 'Other';
export type CeilingType = 'LightGauge' | 'RC' | 'Wood' | 'NoReinforcement' | 'Other';

export type Room = {
  width: number;
  height: number;
  depth: number;
  wallType?: WallType;
  ceilingType?: CeilingType;
  existingOutlets?: number;
};

export type ProjectorType = 'UST' | 'Short' | 'Standard' | 'Mobile';

export interface ProjectorModel {
  id: string;
  brand: string;
  name: string;
  type: ProjectorType;
  throwRatio: { min: number; max: number };
  throwDistanceOffset?: number;
  // Offset represents how much the image is shifted vertically relative to the lens.
  // For UST, it's typically a large positive value.
  // For standard it might be 0% to 50% (where 50% means the lens aligns with the bottom/top edge)
  offsetPercent: number; 
  size: Size3;
  weight: number; // kg
  imageUrl: string;
  websiteUrl: string;
  affiliateUrl?: string;
  resolution?: string;
  brightness?: string;
  lightSource?: string;
  projectionMethod?: string;
  minSizeInch?: number;
  maxSizeInch?: number;
  os?: string;
}



export const PROJECTOR_DB: ProjectorModel[] = [
  {
    id: '1',
    brand: 'Anker',
    name: 'Nebula Capsule 3 Laser',
    type: 'Mobile',
    throwRatio: { min: 1.2, max: 1.2 },
    throwDistanceOffset: 0,
    offsetPercent: 100,
    size: { w: 83, h: 170, d: 83 },
    weight: 0.95,
    imageUrl: 'https://placehold.co/400x300/e2e8f0/1e293b?text=Nebula+Capsule+3',
    websiteUrl: 'https://www.amazon.co.jp/dp/B013DE3427',
    resolution: 'Full HD',
    brightness: '300 ANSI Lumens',
    lightSource: 'Laser',
    projectionMethod: 'DLP',
    minSizeInch: 40,
    maxSizeInch: 120,
    os: 'Android TV',
  },
  {
    id: '2',
    brand: 'XGIMI',
    name: 'Halo+',
    type: 'Mobile',
    throwRatio: { min: 1.2, max: 1.2 },
    throwDistanceOffset: 0,
    offsetPercent: 100,
    size: { w: 113.5, h: 171.5, d: 145 },
    weight: 1.6,
    imageUrl: 'https://placehold.co/400x300/e2e8f0/1e293b?text=XGIMI+Halo%2B',
    websiteUrl: 'https://www.amazon.co.jp/dp/B0646EDC54',
    resolution: 'Full HD',
    brightness: '700 ISO Lumens',
    lightSource: 'LED',
    projectionMethod: 'DLP',
    minSizeInch: 40,
    maxSizeInch: 200,
    os: 'Android TV',
  },
  {
    id: '3',
    brand: 'Aladdin X',
    name: 'Aladdin X2 Plus',
    type: 'Short',
    throwRatio: { min: 0.72, max: 0.72 },
    throwDistanceOffset: 238,
    offsetPercent: 50,
    size: { w: 476, h: 145, d: 476 },
    weight: 4.9,
    imageUrl: 'https://placehold.co/400x300/e2e8f0/1e293b?text=Aladdin+X2+Plus',
    websiteUrl: 'https://www.amazon.co.jp/dp/B066940CB8',
    resolution: 'Full HD',
    brightness: '900 ANSI Lumens',
    lightSource: 'LED',
    projectionMethod: 'DLP',
    minSizeInch: 40,
    maxSizeInch: 120,
    os: 'Aladdin OS (Custom Android)',
  },
  {
    id: '4',
    brand: 'EPSON',
    name: 'EH-TW6250',
    type: 'Standard',
    throwRatio: { min: 1.32, max: 2.15 },
    throwDistanceOffset: 0,
    offsetPercent: 50,
    size: { w: 333, h: 124, d: 275 },
    weight: 4.1,
    imageUrl: 'https://placehold.co/400x300/e2e8f0/1e293b?text=EH-TW6250',
    websiteUrl: 'https://www.amazon.co.jp/dp/B0358AD398',
    resolution: '4K PRO-UHD',
    brightness: '2800 Lumens',
    lightSource: 'Lamp',
    projectionMethod: '3LCD',
    minSizeInch: 40,
    maxSizeInch: 500,
    os: 'Android TV',
  },
  {
    id: '5',
    brand: 'XGIMI',
    name: 'Elfin',
    type: 'Mobile',
    throwRatio: { min: 1.2, max: 1.2 },
    throwDistanceOffset: 0,
    offsetPercent: 100,
    size: { w: 192, h: 50, d: 194 },
    weight: 0.9,
    imageUrl: 'https://placehold.co/400x300/e2e8f0/1e293b?text=XGIMI+Elfin',
    websiteUrl: 'https://www.amazon.co.jp/dp/B0048B66F7',
    resolution: 'Full HD',
    brightness: '800 ANSI Lumens',
    lightSource: 'LED',
    projectionMethod: 'DLP',
    minSizeInch: 40,
    maxSizeInch: 200,
    os: 'Android TV',
  },
  {
    id: '6',
    brand: 'BenQ',
    name: 'GV31',
    type: 'Mobile',
    throwRatio: { min: 1.2, max: 1.2 },
    throwDistanceOffset: 0,
    offsetPercent: 100,
    size: { w: 120, h: 196, d: 185 },
    weight: 1.7,
    imageUrl: 'https://placehold.co/400x300/e2e8f0/1e293b?text=BenQ+GV31',
    websiteUrl: 'https://www.amazon.co.jp/dp/B054F5732A',
    resolution: 'Full HD',
    brightness: '300 ANSI Lumens',
    lightSource: 'LED',
    projectionMethod: 'DLP',
    minSizeInch: 30,
    maxSizeInch: 120,
    os: 'Android TV',
  },
  {
    id: '7',
    brand: 'Anker',
    name: 'Nebula Cosmos Laser 4K',
    type: 'Standard',
    throwRatio: { min: 1.2, max: 1.2 },
    throwDistanceOffset: 0,
    offsetPercent: 100,
    size: { w: 263, h: 265, d: 220 },
    weight: 4.8,
    imageUrl: 'https://placehold.co/400x300/e2e8f0/1e293b?text=Cosmos+Laser+4K',
    websiteUrl: 'https://www.amazon.co.jp/dp/B004B95904',
    resolution: '4K UHD',
    brightness: '2200 ANSI Lumens',
    lightSource: 'Laser',
    projectionMethod: 'DLP',
    minSizeInch: 60,
    maxSizeInch: 150,
    os: 'Android TV',
  },
  {
    id: '8',
    brand: 'XGIMI',
    name: 'HORIZON Pro',
    type: 'Standard',
    throwRatio: { min: 1.2, max: 1.2 },
    throwDistanceOffset: 0,
    offsetPercent: 50,
    size: { w: 208.4, h: 136.2, d: 218.4 },
    weight: 2.9,
    imageUrl: 'https://placehold.co/400x300/e2e8f0/1e293b?text=HORIZON+Pro',
    websiteUrl: 'https://www.amazon.co.jp/dp/B0366EE9D8',
    resolution: '4K UHD',
    brightness: '1500 ISO Lumens',
    lightSource: 'LED',
    projectionMethod: 'DLP',
    minSizeInch: 40,
    maxSizeInch: 200,
    os: 'Android TV',
  },
  {
    id: '9',
    brand: 'Dangbei',
    name: 'Atom',
    type: 'Mobile',
    throwRatio: { min: 1.2, max: 1.2 },
    throwDistanceOffset: 0,
    offsetPercent: 100,
    size: { w: 195, h: 47.5, d: 195 },
    weight: 1.28,
    imageUrl: 'https://placehold.co/400x300/e2e8f0/1e293b?text=Dangbei+Atom',
    websiteUrl: 'https://www.amazon.co.jp/dp/B030BD1564',
    resolution: 'Full HD',
    brightness: '1200 ISO Lumens',
    lightSource: 'Laser',
    projectionMethod: 'DLP',
    minSizeInch: 40,
    maxSizeInch: 180,
    os: 'Google TV',
  },
  {
    id: '10',
    brand: 'EPSON',
    name: 'EH-LS800',
    type: 'UST',
    throwRatio: { min: 0.16, max: 0.16 },
    throwDistanceOffset: -86,
    offsetPercent: 120,
    size: { w: 695, h: 156, d: 341 },
    weight: 12.3,
    imageUrl: 'https://placehold.co/400x300/e2e8f0/1e293b?text=EH-LS800',
    websiteUrl: 'https://www.amazon.co.jp/dp/B04825E683',
    resolution: '4K PRO-UHD',
    brightness: '4000 Lumens',
    lightSource: 'Laser',
    projectionMethod: '3LCD',
    minSizeInch: 80,
    maxSizeInch: 150,
    os: 'Android TV',
  }
,
  {
  "id": "jmgo-o2s-ultra-4k",
  "brand": "JMGO",
  "name": "O2S Ultra 4K",
  "type": "UST",
  "throwRatio": {
    "min": 0.25,
    "max": 0.25
  },
  "throwDistanceOffset": -100,
  "offsetPercent": 120,
  "size": {
    "w": 312,
    "h": 142,
    "d": 298
  },
  "weight": 4.6,
  "imageUrl": "https://placehold.co/400x300/e2e8f0/1e293b?text=O2S+Ultra+4K",
  "websiteUrl": "https://www.amazon.co.jp/dp/B0G1KSZ4B8",
  "resolution": "4K",
  "brightness": "2500 ANSI Lumens",
  "lightSource": "Laser",
  "projectionMethod": "DLP",
  "minSizeInch": 80,
  "maxSizeInch": 120,
  "os": "Android TV"
},
  {
  "id": "jmgo-n3-ultimate",
  "brand": "JMGO",
  "name": "N3 Ultimate",
  "type": "Standard",
  "throwRatio": {
    "min": 1.2,
    "max": 1.2
  },
  "throwDistanceOffset": 0,
  "offsetPercent": 50,
  "size": {
    "w": 241,
    "h": 236,
    "d": 203
  },
  "weight": 4.5,
  "imageUrl": "https://placehold.co/400x300/e2e8f0/1e293b?text=N3+Ultimate",
  "websiteUrl": "https://www.amazon.co.jp/dp/B0DGTJ7ZJ3",
  "resolution": "4K",
  "brightness": "3000 ANSI Lumens",
  "lightSource": "Laser",
  "projectionMethod": "DLP",
  "minSizeInch": 60,
  "maxSizeInch": 150,
  "os": "Google TV"
},
  {
  "id": "jmgo-n1s-ultimate-4k",
  "brand": "JMGO",
  "name": "N1S Ultimate 4K",
  "type": "Standard",
  "throwRatio": {
    "min": 1.2,
    "max": 1.2
  },
  "throwDistanceOffset": 0,
  "offsetPercent": 50,
  "size": {
    "w": 241,
    "h": 236,
    "d": 203
  },
  "weight": 4.5,
  "imageUrl": "https://placehold.co/400x300/e2e8f0/1e293b?text=N1S+Ultimate+4K",
  "websiteUrl": "https://www.amazon.co.jp/dp/B0DGTJ7ZJ2",
  "resolution": "4K",
  "brightness": "3500 ANSI Lumens",
  "lightSource": "Laser",
  "projectionMethod": "DLP",
  "minSizeInch": 60,
  "maxSizeInch": 150,
  "os": "Android TV"
},
  {
  "id": "jmgo-n1s-ultra-4k",
  "brand": "JMGO",
  "name": "N1S Ultra 4K",
  "type": "Standard",
  "throwRatio": {
    "min": 1.2,
    "max": 1.2
  },
  "throwDistanceOffset": 0,
  "offsetPercent": 50,
  "size": {
    "w": 241,
    "h": 236,
    "d": 203
  },
  "weight": 4.5,
  "imageUrl": "https://placehold.co/400x300/e2e8f0/1e293b?text=N1S+Ultra+4K",
  "websiteUrl": "https://www.amazon.co.jp/dp/B0DGTJ7ZJ5",
  "resolution": "4K",
  "brightness": "3000 ANSI Lumens",
  "lightSource": "Laser",
  "projectionMethod": "DLP",
  "minSizeInch": 60,
  "maxSizeInch": 150,
  "os": "Android TV"
},
  {
  "id": "jmgo-n1s-pro-4k",
  "brand": "JMGO",
  "name": "N1S Pro 4K",
  "type": "Standard",
  "throwRatio": {
    "min": 1.2,
    "max": 1.2
  },
  "throwDistanceOffset": 0,
  "offsetPercent": 50,
  "size": {
    "w": 241,
    "h": 236,
    "d": 203
  },
  "weight": 4.5,
  "imageUrl": "https://placehold.co/400x300/e2e8f0/1e293b?text=N1S+Pro+4K",
  "websiteUrl": "https://www.amazon.co.jp/dp/B0DGTJ7ZJ6",
  "resolution": "4K",
  "brightness": "2000 ANSI Lumens",
  "lightSource": "Laser",
  "projectionMethod": "DLP",
  "minSizeInch": 60,
  "maxSizeInch": 150,
  "os": "Android TV"
},
  {
  "id": "jmgo-n1s-4k",
  "brand": "JMGO",
  "name": "N1S 4K",
  "type": "Standard",
  "throwRatio": {
    "min": 1.2,
    "max": 1.2
  },
  "throwDistanceOffset": 0,
  "offsetPercent": 50,
  "size": {
    "w": 241,
    "h": 236,
    "d": 203
  },
  "weight": 4.5,
  "imageUrl": "https://placehold.co/400x300/e2e8f0/1e293b?text=N1S+4K",
  "websiteUrl": "https://www.amazon.co.jp/dp/B0DGTJ7ZJ7",
  "resolution": "4K",
  "brightness": "1500 ANSI Lumens",
  "lightSource": "Laser",
  "projectionMethod": "DLP",
  "minSizeInch": 60,
  "maxSizeInch": 150,
  "os": "Android TV"
},
  {
  "id": "jmgo-n1s",
  "brand": "JMGO",
  "name": "N1S",
  "type": "Standard",
  "throwRatio": {
    "min": 1.2,
    "max": 1.2
  },
  "throwDistanceOffset": 0,
  "offsetPercent": 50,
  "size": {
    "w": 197,
    "h": 187,
    "d": 167
  },
  "weight": 2,
  "imageUrl": "https://placehold.co/400x300/e2e8f0/1e293b?text=N1S",
  "websiteUrl": "https://www.amazon.co.jp/dp/B0DGTJ7ZJ8",
  "resolution": "Full HD",
  "brightness": "900 ANSI Lumens",
  "lightSource": "Laser",
  "projectionMethod": "DLP",
  "minSizeInch": 40,
  "maxSizeInch": 120,
  "os": "Android TV"
},
  {
  "id": "jmgo-n1s-nano",
  "brand": "JMGO",
  "name": "N1S Nano",
  "type": "Mobile",
  "throwRatio": {
    "min": 1.2,
    "max": 1.2
  },
  "throwDistanceOffset": 0,
  "offsetPercent": 100,
  "size": {
    "w": 120,
    "h": 120,
    "d": 120
  },
  "weight": 1,
  "imageUrl": "https://placehold.co/400x300/e2e8f0/1e293b?text=N1S+Nano",
  "websiteUrl": "https://www.amazon.co.jp/dp/B0DGTJ7ZJ9",
  "resolution": "Full HD",
  "brightness": "500 ANSI Lumens",
  "lightSource": "Laser",
  "projectionMethod": "DLP",
  "minSizeInch": 40,
  "maxSizeInch": 100,
  "os": "Android TV"
},
  {
  "id": "jmgo-picoflix",
  "brand": "JMGO",
  "name": "PicoFlix",
  "type": "Mobile",
  "throwRatio": {
    "min": 1.2,
    "max": 1.2
  },
  "throwDistanceOffset": 0,
  "offsetPercent": 100,
  "size": {
    "w": 100,
    "h": 100,
    "d": 100
  },
  "weight": 0.8,
  "imageUrl": "https://placehold.co/400x300/e2e8f0/1e293b?text=PicoFlix",
  "websiteUrl": "https://www.amazon.co.jp/dp/B0DGTJ7ZJA",
  "resolution": "Full HD",
  "brightness": "400 ANSI Lumens",
  "lightSource": "LED",
  "projectionMethod": "DLP",
  "minSizeInch": 30,
  "maxSizeInch": 100,
  "os": "Android TV"
},
  {
  "id": "jmgo-picoplay-plus",
  "brand": "JMGO",
  "name": "PicoPlay+",
  "type": "Mobile",
  "throwRatio": {
    "min": 1.2,
    "max": 1.2
  },
  "throwDistanceOffset": 0,
  "offsetPercent": 100,
  "size": {
    "w": 90,
    "h": 90,
    "d": 90
  },
  "weight": 0.7,
  "imageUrl": "https://placehold.co/400x300/e2e8f0/1e293b?text=PicoPlay%2B",
  "websiteUrl": "https://www.amazon.co.jp/dp/B0DGTJ7ZJB",
  "resolution": "Full HD",
  "brightness": "300 ANSI Lumens",
  "lightSource": "LED",
  "projectionMethod": "DLP",
  "minSizeInch": 30,
  "maxSizeInch": 100,
  "os": "Android TV"
}
];

export type ViewerModel = 'human' | 'bear' | 'hero';

export interface UserDemands {
  preferHiddenWiring: boolean;
  allowCeilingDrilling: boolean;
}

export interface TheaterState {
  room: Room;
  projector: ProjectorModel;
  projectorPos: Vector3; // Position of the projector center
  screenSizeInch: number; // e.g., 100
  screenBottomY: number; // e.g., 600
  viewingMode?: 'cinema' | 'living' | 'general4k' | 'general1080p' | 'custom';
  audioPos: Vector3[];
  audiencePos: Vector3;
  audienceSize: { w: number; d: number; h: number };
  showViewer: boolean;
  viewerModel?: ViewerModel;
  contentMode: 'movie' | 'live' | 'sports' | 'game' | 'off';
  cameraState?: {
    position: [number, number, number];
    target: [number, number, number];
  };
  userDemands: UserDemands;
}

// 100 inches in 16:9 -> 2214mm x 1245mm
export const getScreenSizeMm = (inches: number) => {
  const diagMm = inches * 25.4;
  const angle = Math.atan(9 / 16);
  return {
    w: diagMm * Math.cos(angle),
    h: diagMm * Math.sin(angle),
  };
};
