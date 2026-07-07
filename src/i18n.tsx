import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'en' | 'ja';

type Translations = {
  [key in Language]: {
    [key: string]: string;
  };
};

const translations: Translations = {
  en: {
    appTitle: 'HOME THEATER PLANNER',
    exportCad: 'Export CAD',
    systemReady: 'System Ready',
    topView: 'Top View',
    frontView: 'Front View',
    sideView: 'Side View',
    projectorLayer: 'Projector',
    screenPathLayer: 'Screen Path',
    viewerSofaLayer: 'Viewer',
    help: 'How to use',
    close: 'Close',
    roomSize: 'Room Size',
    width: 'Width',
    depth: 'Depth',
    height: 'Height',
    screen: 'Screen',
    screenSize: 'Screen Size',
    screenHeightLimit: 'Screen Bottom Height',
    viewerSofa: 'Viewer Z Pos',
    projectorSet: 'Projector Settings',
    resolution: 'Resolution',
    brightness: 'Brightness',
    light: 'Light Source',
    officialSite: 'Official Site',
    checkShop: 'Check Shop',
    amazonSearch: 'Amazon',
    rakutenSearch: 'Rakuten',
    affiliateNote: '※ This site contains affiliate links. Purchases made through these links may generate revenue used for system maintenance and operation.',
    offsetHelp: 'Projection Offset: 50% means the lens aligns with the screen center. 100% means it aligns with the screen edge. >100% means the image starts beyond the lens center (common in UST).',
    ratioHelp: 'Throw Ratio: The ratio of projection distance to screen width. A smaller number means shorter distance needed for the same screen size.',
    helpTitle: 'How to use this app',
    helpDesc1: '1. Set Room Size: Adjust the width, depth, and height of your room.',
    helpDesc2: '2. Select Projector: Choose a model from the list. Standard and UST (Ultra Short Throw) projectors behave differently.',
    helpDesc3: '3. Position Objects: Drag the projector on the screen or adjust the sliders to position the screen height and sofa.',
    helpDesc4: '4. Check Views: Switch between Top, Front, and Side views to verify the projection path and clearance.',
    projectorWarning: 'OUT OF RANGE: The throw distance does not match the screen size. Please adjust the "Projector Z Pos" or the "Screen Size".',
    lensShiftNote: 'Does not support exact lens shift calculation. Assuming projector lens center.',
    projectorModel: 'Projector Model',
    projectorXPos: 'Projector X Pos',
    projectorZPos: 'Distance from Screen',
    projectorYPos: 'Mounting Height',
    throwRange: 'Target Lens Distance',
    throwRangeDesc: '(Calculated from Screen Size and Throw Ratio)',
    installationSpecs: 'Mounting Specs',
    projectionSpecs: 'Projection Specs',
    throwDist: 'Throw Distance',
    opticPath: 'Projected Beam',
    clearValid: 'CLEAR / VALID',
    targetScreen: 'Target Screen',
    projector: 'Projector',
    size: 'Size',
    weight: 'Weight',
    throwRatio: 'Throw Ratio',
    offset: 'Offset',
    throwDistCanvas: 'Dist',
    optimalViewDist: 'Viewing Distance',
    throwTypeUST: 'UST',
    throwTypeStandard: 'Standard',
    throwTypeShort: 'Short',
    throwTypeMobile: 'Mobile',
    contentMovie: 'Movie',
    contentLive: 'Live Concert',
    contentSports: 'Sports',
    contentGame: 'Gaming',
  },
  ja: {
    appTitle: 'HOME THEATER PLANNER',
    exportCad: 'CADエクスポート',
    systemReady: 'システム準備完了',
    topView: '上面図',
    frontView: '正面図',
    sideView: '側面図',
    projectorLayer: 'プロジェクター',
    screenPathLayer: 'スクリーン / 投影光',
    viewerSofaLayer: '視聴者',
    help: '使い方',
    close: '閉じる',
    roomSize: '部屋のサイズ',
    width: '幅',
    depth: '奥行き',
    height: '高さ',
    screen: 'スクリーン',
    screenSize: 'スクリーンサイズ',
    screenHeightLimit: 'スクリーン下端高さ',
    viewerSofa: '視聴位置',
    projectorSet: 'プロジェクター設定',
    resolution: '解像度',
    brightness: '明るさ',
    light: '光源',
    officialSite: '公式サイト ↗',
    checkShop: 'ショップで確認',
    amazonSearch: 'Amazonで探す',
    rakutenSearch: '楽天で探す',
    affiliateNote: '※当サイトのリンクにはアフィリエイトリンクが含まれています。各ショップ経由でのご購入により、システム維持・運営費として収益が還元される場合があります。',
    offsetHelp: '打ち込み角（オフセット）: 50%はレンズがスクリーンの中央と一致。100%は端と一致。100%超は画像がレンズ中心から離れた位置から始まることを意味します（短焦点機で一般的です）。',
    ratioHelp: 'スローレシオ（投写比）: 投写距離とスクリーン幅の比率。数値が小さいほど同じ画面サイズでも短い距離で投写できます。',
    helpTitle: 'このアプリの使い方',
    helpDesc1: '1. 部屋のサイズ設定: 部屋の幅、奥行き、高さを設定します。',
    helpDesc2: '2. プロジェクターの選択: リストからモデルを選びます。標準レンズと超短焦点（UST）で挙動が異なります。',
    helpDesc3: '3. 配置の調整: プロジェクターをドラッグしたり、スライダーでスクリーン高さやソファ位置を変更できます。',
    helpDesc4: '4. 視点の切り替え: 上面、正面、側面から投影光や干渉を確認します。',
    projectorWarning: '設置不可: 現在の距離ではこのスクリーンサイズを映せません。「設置位置」または「スクリーンサイズ」を調整してください。',
    lensShiftNote: '※厳密なレンズシフト計算は未サポートです。',
    projectorModel: 'プロジェクター機種',
    projectorXPos: 'プロジェクター X座標',
    projectorZPos: '設置位置 (スクリーンからの距離)',
    projectorYPos: '設置高さ',
    throwRange: '設置可能範囲 (レンズ位置)',
    throwRangeDesc: '（スクリーンサイズと投写比から算出）',
    installationSpecs: '設置仕様',
    projectionSpecs: '投影スペック',
    throwDist: '投写距離',
    opticPath: '投影光',
    clearValid: '干渉なし / OK',
    targetScreen: 'ターゲットスクリーン',
    projector: 'プロジェクター',
    size: 'サイズ',
    weight: '重量',
    throwRatio: '投写比(スローレシオ)',
    offset: 'オフセット',
    throwDistCanvas: '投写距離',
    optimalViewDist: '最適視聴距離',
    throwTypeUST: '超単焦点',
    throwTypeStandard: '標準焦点',
    throwTypeShort: '単焦点',
    throwTypeMobile: 'モバイル',
    contentMovie: '映画',
    contentLive: 'ライブ',
    contentSports: 'スポーツ',
    contentGame: 'ゲーム',
  }
};

type I18nContextType = {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
};

const I18nContext = createContext<I18nContextType>({
  lang: 'ja',
  setLang: () => {},
  t: (key: string) => key,
});

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLang] = useState<Language>('ja');

  const t = (key: string) => {
    return translations[lang][key] || key;
  };

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => useContext(I18nContext);
