import React, { useState, useEffect } from 'react';
import { TheaterCanvas } from './components/TheaterCanvas';
import { Theater3D } from './components/Theater3D';
import { Controls } from './components/Controls';
import { HomeTab } from './components/Tabs';
import { TheaterState, PROJECTOR_DB, getScreenSizeMm } from './types/theater';
import { useI18n } from './i18n';
import { Sun, Moon, Home, HelpCircle, Projector, ExternalLink } from 'lucide-react';

// Falls back to the documented default tag if the env var isn't set for this build,
// so affiliate links never silently ship untagged.
const AMAZON_ASSOCIATE_TAG_FALLBACK = 'theatersim-22';

const getProjectorAmazonUrl = (projector: Pick<TheaterState['projector'], 'brand' | 'name' | 'amazonASIN'>) => {
  const tag = import.meta.env.VITE_AMAZON_ASSOCIATE_TAG || AMAZON_ASSOCIATE_TAG_FALLBACK;
  if (projector.amazonASIN) {
    return `https://www.amazon.co.jp/dp/${projector.amazonASIN}?tag=${tag}`;
  }
  return `https://www.amazon.co.jp/s?k=${encodeURIComponent(projector.brand + ' ' + projector.name)}&tag=${tag}`;
};

// Amazon official brand store pages, keyed by the exact `brand` value used in PROJECTOR_DB.
// Brands without a confirmed store page fall back to a brand-name search link.
const BRAND_STORE_URLS: Record<string, string> = {
  BenQ: 'https://www.amazon.co.jp/stores/%E3%83%99%E3%83%B3%E3%82%AF%E3%83%A5%E3%83%BC%E3%82%B8%E3%83%A3%E3%83%91%E3%83%B3/%E3%83%97%E3%83%AD%E3%82%B8%E3%82%A7%E3%82%AF%E3%82%BF%E3%83%BC/page/B5F51FCB-A8E1-46E9-949F-E29AF3BFCD06',
  XGIMI: 'https://www.amazon.co.jp/stores/XGIMI/XGIMI/page/157C458F-0CBD-4216-AE74-7CAC2954C03F',
  ANKER: 'https://www.amazon.co.jp/stores/page/9FDB00B2-9C45-418D-B913-1D6297A37A92',
  Aladdin: 'https://www.amazon.co.jp/stores/AladdinX/page/ADCEBDFA-F5AF-4C90-9F73-FE7C73C5BABF',
  Dangbei: 'https://www.amazon.co.jp/stores/Dangbei/page/828B0947-3756-4E46-8991-C15909BC5BA2',
  EPSON: 'https://www.amazon.co.jp/s?k=EPSON+%E3%83%97%E3%83%AD%E3%82%B8%E3%82%A7%E3%82%AF%E3%82%BF%E3%83%BC&__mk_ja_JP=%E3%82%AB%E3%82%BF%E3%82%AB%E3%83%8A&crid=32IGYAZ7P2ZXM&sprefix=epson+%E3%83%97%E3%83%AD%E3%82%B8%E3%82%A7%E3%82%AF%E3%82%BF%E3%83%BC%2Caps%2C199&ref=nb_sb_noss_1',
  JMGO: 'https://www.amazon.co.jp/stores/JMGO%EF%BC%88%E3%82%B8%E3%82%A7%E3%82%A4%E3%82%A8%E3%83%A0%E3%82%B4%E3%83%BC%EF%BC%89/page/03933704-C9EE-43FE-A7AC-85EE098D3B3F',
};

const getBrandStoreUrl = (brand: string) => {
  const tag = import.meta.env.VITE_AMAZON_ASSOCIATE_TAG || AMAZON_ASSOCIATE_TAG_FALLBACK;
  const storeUrl = BRAND_STORE_URLS[brand];
  if (storeUrl) {
    return `${storeUrl}${storeUrl.includes('?') ? '&' : '?'}tag=${tag}`;
  }
  return `https://www.amazon.co.jp/s?k=${encodeURIComponent(brand)}&tag=${tag}`;
};

const getRandomProjector = () => {
  const randomIndex = Math.floor(Math.random() * PROJECTOR_DB.length);
  return PROJECTOR_DB[randomIndex];
};

const getInitialScreenBottomY = (projectorType: string, screenSizeInch: number, roomHeight: number) => {
  const screenSz = getScreenSizeMm(screenSizeInch);
  if (projectorType === 'UST') {
    return 600; // UST models commonly sit on a standard TV stand ~60cm tall
  }
  // Standard/Short-throw: attempt a center-of-wall height for the screen, but typical ~60cm-80cm from floor.
  // We'll calculate a bottom Y that centers the screen visually or just use ~700.
  const idealCenterY = roomHeight / 2;
  const bottomY = idealCenterY - (screenSz.h / 2);
  // screenSz.h comes from a trig ratio, so round to a whole mm for display/storage.
  return Math.round(Math.max(300, Math.min(bottomY, roomHeight - screenSz.h - 100)));
};

// Initial state generator
const generateInitialState = (): TheaterState => {
  const room = { 
    width: 4000, 
    depth: 5000, 
    height: 2400,
    wallType: 'GypsumBoard' as const,
    ceilingType: 'NoReinforcement' as const,
    existingOutlets: 2
  };
  const projector = getRandomProjector();
  const screenSizeInch = 100;
  const screenBottomY = getInitialScreenBottomY(projector.type, screenSizeInch, room.height);
  
  // Calculate valid throw distance (in mm) for this projector+screen combo
  const screenSz = getScreenSizeMm(screenSizeInch);
  const offset = projector.throwDistanceOffset || 0;
  const minThrowDist = projector.throwRatio.min * screenSz.w + offset;
  const maxThrowDist = projector.throwRatio.max * screenSz.w + offset;
  const isFixedThrow = projector.throwRatio.min === projector.throwRatio.max;
  
  // Use midpoint of valid throw range, or minThrowDist if fixed throw.
  // screenSz.w is derived from a trig ratio, so round to a whole mm for display/storage.
  const initialZ = Math.round(isFixedThrow ? minThrowDist : (minThrowDist + maxThrowDist) / 2);
  
  return {
    room,
    projector,
    projectorPos: { x: 2000, y: projector.type === 'UST' ? screenBottomY - 200 : 2200, z: initialZ },
    screenSizeInch,
    screenBottomY,
    audioPos: [],
    audiencePos: { x: 2000, y: 1000, z: 3000 },
    audienceSize: { w: 1800, d: 900, h: 800 },
    showViewer: true,
    viewerModel: 'human',
    contentMode: 'movie',
    viewingMode: 'cinema',
    userDemands: {
      preferHiddenWiring: true,
      allowCeilingDrilling: false
    }
  };
};

export default function App() {
  const [state, setState] = useState<TheaterState>(() => generateInitialState());
  const [view, setView] = useState<'top' | 'front' | 'side' | '3d'>('top');
  const [activeTab, setActiveTab] = useState<'home' | 'simulator' | 'guide' | 'links'>('home');
  const { t, lang, setLang } = useI18n();
  const [showHelp, setShowHelp] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Calculate strict initial positioning requirements on mount
  useEffect(() => {
    updateState({});
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => {
      const next = !prev;
      localStorage.setItem('theme', next ? 'dark' : 'light');
      return next;
    });
  };

  const updateState = (updates: Partial<TheaterState>) => {
    setState(prev => {
      const nextState = { ...prev, ...updates };
      const screenSz = getScreenSizeMm(nextState.screenSizeInch);

      // If user explicitly changed the audience position, transition viewingMode to 'custom'
      if (updates.audiencePos !== undefined && updates.audiencePos.z !== prev.audiencePos.z) {
        nextState.viewingMode = 'custom';
      }
      
      // If we are in an active preset viewing mode, automatically adjust perfect sofa distance
      if (nextState.viewingMode && nextState.viewingMode !== 'custom') {
        let idealZ = nextState.audiencePos.z;
        if (nextState.viewingMode === 'cinema') {
          idealZ = Math.round(screenSz.w * 1.30);
        } else if (nextState.viewingMode === 'living') {
          idealZ = Math.round(screenSz.w * 1.75);
        } else if (nextState.viewingMode === 'general4k') {
          idealZ = Math.round(nextState.screenSizeInch * 25.4 * 1.25);
        }
        
        // Clamp to ensure it doesn't push beyond room depth (with a 500mm safety buffer from back wall)
        nextState.audiencePos = {
          ...nextState.audiencePos,
          z: Math.max(1000, Math.min(nextState.room.depth - 500, idealZ))
        };
      }
      
      // UST screen position calculation
      if (nextState.projector.type === 'UST') {
        const projectorTopY = nextState.projectorPos.y + nextState.projector.size.h / 2;
        const offsetRatio = (nextState.projector.offsetPercent - 100) / 100;
        nextState.screenBottomY = Math.round(projectorTopY + offsetRatio * screenSz.h);
      }

      const maxScreenBottomY = nextState.room.height - screenSz.h;
      if (nextState.screenBottomY > maxScreenBottomY) {
        nextState.screenBottomY = Math.round(Math.max(0, maxScreenBottomY));
      }

      // Enforce X position to be strictly centered
      nextState.projectorPos.x = nextState.room.width / 2;
      nextState.audiencePos.x = nextState.room.width / 2;

      return nextState;
    });
  };

  return (
    <div className={`flex flex-col h-screen w-full bg-[#F8F9FA] dark:bg-zinc-950 text-[#2D3436] dark:text-zinc-100 font-sans overflow-hidden ${isDarkMode ? 'dark' : ''}`}>
      <header className="flex flex-col bg-white dark:bg-zinc-900 border-b border-[#E9ECEF] dark:border-zinc-800 shrink-0">
        <div className="h-16 flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-black dark:bg-zinc-800 rounded flex items-center justify-center text-white font-bold">H</div>
            <h1 className="text-lg font-semibold tracking-tight uppercase">
              {t('appTitle')} <span className="text-[#95A5A6] font-light hidden sm:inline">v2.5</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#F1F3F5] dark:bg-zinc-800 rounded-full border border-[#DEE2E6] dark:border-zinc-700">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              <span className="text-xs font-medium uppercase text-zinc-700 dark:text-zinc-300">{t('systemReady')}</span>
            </div>
            <button 
              onClick={() => {
                const text = `Planning a home theater!\nProjector: ${state.projector.brand} ${state.projector.name}\nScreen: ${state.screenSizeInch} inches\n\n#ProjectTheater`;
                window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
              }}
              className="flex items-center gap-2 px-3 py-1.5 bg-black dark:bg-zinc-800 text-white text-xs font-bold rounded uppercase hover:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors"
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              <span className="hidden sm:inline">{lang === 'en' ? 'Share' : 'シェア'}</span>
            </button>
            
            {/* Dark mode toggle */}
            <button
              onClick={toggleDarkMode}
              className="w-8 h-8 flex items-center justify-center border border-[#DEE2E6] dark:border-zinc-700 rounded-full text-[#95A5A6] dark:text-zinc-400 hover:bg-[#F8F9FA] dark:hover:bg-zinc-800 hover:text-[#2D3436] dark:hover:text-zinc-100 transition-colors"
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <div className="flex border border-[#DEE2E6] dark:border-zinc-700 rounded overflow-hidden">
              <button 
                onClick={() => setLang('ja')} 
                className={`px-3 py-1.5 text-xs font-bold transition-colors ${lang === 'ja' ? 'bg-[#2D3436] dark:bg-zinc-700 text-white' : 'bg-white dark:bg-zinc-800 text-[#95A5A6] dark:text-zinc-400 hover:bg-[#F8F9FA] dark:hover:bg-zinc-700'}`}
              >
                JA
              </button>
              <button 
                onClick={() => setLang('en')} 
                className={`px-3 py-1.5 text-xs font-bold transition-colors ${lang === 'en' ? 'bg-[#2D3436] dark:bg-zinc-700 text-white' : 'bg-white dark:bg-zinc-800 text-[#95A5A6] dark:text-zinc-400 hover:bg-[#F8F9FA] dark:hover:bg-zinc-700'}`}
              >
                EN
              </button>
            </div>
            <button onClick={() => setShowHelp(true)} className="w-8 h-8 flex items-center justify-center border border-[#DEE2E6] dark:border-zinc-700 rounded-full text-[#95A5A6] dark:text-zinc-400 hover:bg-[#F8F9FA] dark:hover:bg-zinc-800 hover:text-[#2D3436] dark:hover:text-zinc-100 transition-colors" title={t('help')}>
              ?
            </button>
          </div>
        </div>

        {/* Global Navigation Bar */}
        <div className="flex items-center gap-1 px-6 pb-2">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition-colors border-b-2 font-bold text-[11px] uppercase tracking-wider ${
              activeTab === 'home'
                ? 'border-black dark:border-zinc-100 text-black dark:text-zinc-100'
                : 'border-transparent text-zinc-500 hover:text-black dark:hover:text-zinc-300'
            }`}
          >
            <Home className="w-4 h-4" />
            {lang === 'en' ? 'Home' : 'ホーム'}
          </button>
          <button
            onClick={() => setActiveTab('simulator')}
            className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition-colors border-b-2 font-bold text-[11px] uppercase tracking-wider ${
              activeTab === 'simulator'
                ? 'border-black dark:border-zinc-100 text-black dark:text-zinc-100'
                : 'border-transparent text-zinc-500 hover:text-black dark:hover:text-zinc-300'
            }`}
          >
            <Projector className="w-4 h-4" />
            {lang === 'en' ? 'Simulator' : 'シミュレーター'}
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition-colors border-b-2 font-bold text-[11px] uppercase tracking-wider ${
              activeTab === 'guide'
                ? 'border-black dark:border-zinc-100 text-black dark:text-zinc-100'
                : 'border-transparent text-zinc-500 hover:text-black dark:hover:text-zinc-300'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            {lang === 'en' ? 'Guide & Basics' : '使い方・基礎知識'}
          </button>
          <button
            onClick={() => setActiveTab('links')}
            className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition-colors border-b-2 font-bold text-[11px] uppercase tracking-wider ${
              activeTab === 'links'
                ? 'border-black dark:border-zinc-100 text-black dark:text-zinc-100'
                : 'border-transparent text-zinc-500 hover:text-black dark:hover:text-zinc-300'
            }`}
          >
            <ExternalLink className="w-4 h-4" />
            {lang === 'en' ? 'Projector Links' : 'プロジェクタリンク'}
          </button>
        </div>
      </header>

      {showHelp && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl w-full max-w-md p-6 border border-[#E9ECEF] dark:border-zinc-800">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">{t('helpTitle')}</h2>
              <button onClick={() => setShowHelp(false)} className="text-[#95A5A6] hover:text-[#2D3436] p-1">&times;</button>
            </div>
            <div className="space-y-4 text-sm leading-relaxed text-[#2D3436] dark:text-zinc-300">
              <p>{t('helpDesc1')}</p>
              <p>{t('helpDesc2')}</p>
              <p>{t('helpDesc3')}</p>
              <p>{t('helpDesc4')}</p>
              <div className="bg-[#FFFBEB] dark:bg-amber-950/40 text-[#B45309] dark:text-amber-200 p-3 rounded border border-[#FEF3C7] dark:border-amber-900/30 mt-4">
                {t('lensShiftNote')}
              </div>
            </div>
            <button onClick={() => setShowHelp(false)} className="mt-6 w-full py-2 bg-black dark:bg-zinc-800 text-white text-sm font-bold rounded hover:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors">
              {t('close')}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'home' && (
        <HomeTab lang={lang} onStart={() => setActiveTab('simulator')} />
      )}

      {activeTab === 'simulator' && (
        <>
          <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            <div className="h-[35vh] sm:h-[40vh] lg:h-auto lg:flex-1 relative bg-white dark:bg-zinc-900 flex flex-col border-r border-[#E9ECEF] dark:border-zinc-800">
              <div className="absolute top-3 left-1/2 -translate-x-1/2 flex bg-white/90 dark:bg-zinc-900/90 border border-[#DEE2E6] dark:border-zinc-800 rounded p-1 z-10 shadow-sm backdrop-blur-sm w-full max-w-[400px]">
                 {['top', 'side', 'front', '3d'].map((v) => (
                    <button
                      key={v}
                      onClick={() => setView(v as any)}
                      className={`flex-1 py-1.5 text-[10px] font-bold uppercase rounded-sm transition-all duration-200 ${
                        view === v ? 'bg-[#2D3436] dark:bg-zinc-700 text-white shadow-sm' : 'text-[#95A5A6] dark:text-zinc-400 hover:text-[#2D3436] dark:hover:text-zinc-200'
                      }`}
                    >
                      {v === 'top' ? t('topView') : v === 'front' ? t('frontView') : v === 'side' ? t('sideView') : '3D'}
                    </button>
                  ))}
              </div>
              {view === '3d' ? (
                <Theater3D state={state} onUpdateState={updateState} isDarkMode={isDarkMode} />
              ) : (
                <TheaterCanvas 
                  view={view as any} 
                  state={state} 
                  onUpdateState={updateState} 
                  isDarkMode={isDarkMode}
                />
              )}
            </div>
            
            <Controls 
              state={state} 
              onUpdateState={updateState} 
              view={view as any}
              setView={setView as any}
              isDarkMode={isDarkMode}
            />
          </main>

          <footer className="h-12 bg-white dark:bg-zinc-900 border-t border-[#E9ECEF] dark:border-zinc-800 px-6 flex items-center justify-between shrink-0">
            <div className="flex gap-4 sm:gap-8 overflow-x-auto whitespace-nowrap scrollbar-hide">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#DCFCE7] dark:bg-emerald-950/40 border border-[#10B981] rounded-sm"></div>
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-60 dark:text-zinc-300">{t('projectorLayer')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#DBEAFE] dark:bg-blue-950/50 border border-[#3B82F6] rounded-sm"></div>
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-60 dark:text-zinc-300">{t('screenPathLayer')}</span>
              </div>
              <div className={`flex items-center gap-2 transition-opacity ${!state.showViewer ? 'opacity-30' : ''}`}>
                <div className="w-3 h-3 bg-[#FFE4E6] dark:bg-rose-950/50 border border-[#FDA4AF] rounded-sm"></div>
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-60 dark:text-zinc-300">{t('viewerSofaLayer')}</span>
              </div>
            </div>
            <div className="text-[10px] font-mono text-[#95A5A6] dark:text-zinc-500 hidden md:block">
              XYZ: {Math.round(state.projectorPos.x)} | {Math.round(state.projectorPos.y)} | {Math.round(state.projectorPos.z)}
            </div>
          </footer>
        </>
      )}

      {activeTab === 'guide' && (
        <main className="flex-1 overflow-y-auto bg-[#F8F9FA] dark:bg-zinc-950 p-6 sm:p-12">
          <div className="max-w-4xl mx-auto space-y-12">
            <div>
              <h2 className="text-3xl font-bold mb-6 text-zinc-900 dark:text-zinc-100">{lang === 'en' ? 'How to use simulator' : 'シミュレーターの使い方'}</h2>
              <div className="bg-white dark:bg-zinc-900 p-6 sm:p-8 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
                
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center text-sm">1</span>
                      {lang === 'en' ? 'Select Gear' : '機材を選ぶ'}
                    </h3>
                    <p className="text-sm text-zinc-650 dark:text-zinc-400 leading-relaxed">
                      {lang === 'en' ? 'Click the "Change Projector" button from the right control panel and select the projector model you want to place. Adjust "Screen Size" to match your goal.' : '右側のコントロールパネルからプロジェクターを選択し、画面サイズを調整します。'}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 flex items-center justify-center text-sm">2</span>
                      {lang === 'en' ? 'Set Room Size' : '部屋のサイズを設定'}
                    </h3>
                    <p className="text-sm text-zinc-650 dark:text-zinc-400 leading-relaxed">
                      {lang === 'en' ? 'Enter the actual "Width, Depth, Height" of the room where the projector will be placed.' : '部屋の「幅、奥行き、高さ」を入力すると、よりリアルなシミュレーションが可能になります。'}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 flex items-center justify-center text-sm">3</span>
                      {lang === 'en' ? 'Adjust Placement' : '配置を調整する'}
                    </h3>
                    <p className="text-sm text-zinc-650 dark:text-zinc-400 leading-relaxed">
                      {lang === 'en' ? 'Drag the gear or sofa on the simulator screen or enter numbers directly.' : 'シミュレーター画面で直接ドラッグするか、スライダーで詳細な数値を調整します。'}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 flex items-center justify-center text-sm">4</span>
                      {lang === 'en' ? 'Check in 3D' : '3Dで確認する'}
                    </h3>
                    <p className="text-sm text-zinc-650 dark:text-zinc-400 leading-relaxed">
                      {lang === 'en' ? 'Select "3D" to check the entire space. Drag to rotate the view.' : '「3D」タブを選択すると空間全体を3Dで確認できます。ドラッグで視点を回転できます。'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold mb-6 text-zinc-900 dark:text-zinc-100">{lang === 'en' ? 'Home Theater Basics' : 'ホームシアターの基礎知識'}</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                  <h3 className="text-lg font-bold mb-3">{lang === 'en' ? 'What is Throw Ratio?' : 'スローレシオ（投写比）'}</h3>
                  <p className="text-zinc-650 dark:text-zinc-400 text-sm leading-relaxed mb-4">
                    {lang === 'en' ? 'The ratio between projection distance and screen width.' : 'プロジェクターからスクリーンまでの距離(D)と投影画面の幅(W)の比率です。'}
                  </p>
                  <ul className="text-sm space-y-2 text-zinc-650 dark:text-zinc-400">
                    <li><span className="font-bold text-zinc-900 dark:text-zinc-200">{lang === 'en' ? 'Ultra Short Throw (0.2-0.4):' : '超短焦点 (0.2-0.4):'}</span> {lang === 'en' ? '100-inch projection from just a few centimeters.' : '壁から数センチ〜数十センチで100インチの大画面が可能です。'}</li>
                    <li><span className="font-bold text-zinc-900 dark:text-zinc-200">{lang === 'en' ? 'Short Throw (0.5-0.9):' : '短焦点 (0.5-0.9):'}</span> {lang === 'en' ? 'Large screen from a short distance.' : '約1mなどの短い距離から大画面投影が可能です。'}</li>
                    <li><span className="font-bold text-zinc-900 dark:text-zinc-200">{lang === 'en' ? 'Standard (1.0-2.0):' : '標準 (1.0-2.0):'}</span> {lang === 'en' ? 'Standard home use. 100 inches from about 2.5m-3m.' : '一般的な家庭用。約2.5m〜3mで100インチ。'}</li>
                  </ul>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                  <h3 className="text-lg font-bold mb-3">{lang === 'en' ? 'Lens Shift and Offset' : 'レンズシフトとオフセット'}</h3>
                  <p className="text-zinc-650 dark:text-zinc-400 text-sm leading-relaxed mb-4">
                    {lang === 'en' ? 'Lens shift allows sliding the image without moving the projector.' : 'プロジェクター本体を動かさずに映像を上下左右に動かせる機能で、設置の自由度が大幅に上がります。'}
                  </p>
                  <p className="text-zinc-650 dark:text-zinc-400 text-sm leading-relaxed">
                    {lang === 'en' ? 'Most project upwards from the center of the lens when placed horizontally.' : '平置きした場合、レンズの中心から上に向かって映像が広がる「打ち込み（オフセット）」を持つ機種が一般的です。'}
                  </p>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                  <h3 className="text-lg font-bold mb-3">{lang === 'en' ? 'Lumens (Brightness) Guide' : 'ルーメン（明るさ）の目安'}</h3>
                  <p className="text-zinc-650 dark:text-zinc-400 text-sm leading-relaxed mb-4">
                    {lang === 'en' ? 'Brightness is expressed in lumens. ANSI/ISO lumens are standardized.' : '明るさは「ルーメン(lm)」で表されます。ANSIやISOなどの国際基準の数値がより正確です。'}
                  </p>
                  <ul className="text-sm space-y-2 text-zinc-650 dark:text-zinc-400">
                    <li><span className="font-bold text-zinc-900 dark:text-zinc-200">{lang === 'en' ? 'Dark Room Only:' : '暗室専用:'}</span> {lang === 'en' ? '500-1000 lumens. Good for dark rooms.' : '500〜1000ルーメン。照明を消せば十分楽しめます。'}</li>
                    <li><span className="font-bold text-zinc-900 dark:text-zinc-200">{lang === 'en' ? 'Dim Room:' : '薄暗い部屋:'}</span> {lang === 'en' ? '1500-2000 lumens. Okay with blackout curtains.' : '1500〜2000ルーメン。遮光カーテンがあれば昼間でもOKです。'}</li>
                    <li><span className="font-bold text-zinc-900 dark:text-zinc-200">{lang === 'en' ? 'Living Room:' : 'リビングルーム:'}</span> {lang === 'en' ? '2500+ lumens. Usable with ambient lighting.' : '2500ルーメン以上。間接照明があっても楽しめる明るさです。'}</li>
                  </ul>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                  <h3 className="text-lg font-bold mb-3">{lang === 'en' ? 'Light Source Types' : '光源の種類'}</h3>
                  <p className="text-zinc-650 dark:text-zinc-400 text-sm leading-relaxed mb-4">
                    {lang === 'en' ? 'Light sources affect lifespan and color. Laser and LED are mainstream.' : '寿命や色再現性、起動時間に大きく影響します。現在はレーザーとLEDが主流です。'}
                  </p>
                  <ul className="text-sm space-y-2 text-zinc-650 dark:text-zinc-400">
                    <li><span className="font-bold text-zinc-900 dark:text-zinc-200">{lang === 'en' ? 'Laser:' : 'レーザー:'}</span> {lang === 'en' ? 'Bright and long-lasting. Instant startup.' : '圧倒的な明るさと長寿命。起動も早く、高品質なホームシアターの第一候補。'}</li>
                    <li><span className="font-bold text-zinc-900 dark:text-zinc-200">{lang === 'en' ? 'LED:' : 'LED:'}</span> {lang === 'en' ? 'Compact, good colors, long lifespan.' : 'コンパクトで色再現性が良く、長寿命。モバイルや小型機に多く採用。'}</li>
                    <li><span className="font-bold text-zinc-900 dark:text-zinc-200">{lang === 'en' ? 'Mercury Lamp:' : '水銀ランプ:'}</span> {lang === 'en' ? 'Traditional, inexpensive, requires lamp replacement.' : '昔ながらの光源。安価で色バランスが良いですが、数千時間でランプ交換が必要です。'}</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div>
              <h2 className="text-3xl font-bold mb-6 text-zinc-900 dark:text-zinc-100">{lang === 'en' ? 'Optimal Viewing Distance Guide' : '最適な視聴距離の目安'}</h2>
              <div className="bg-white dark:bg-zinc-900 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <table className="w-full text-sm text-left">
                  <thead className="bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
                    <tr>
                      <th className="px-6 py-4 font-bold text-zinc-900 dark:text-zinc-100">Mode</th>
                      <th className="px-6 py-4 font-bold text-zinc-900 dark:text-zinc-100">{lang === 'en' ? 'Reference Distance' : '距離の目安'}</th>
                      <th className="px-6 py-4 font-bold text-zinc-900 dark:text-zinc-100">{lang === 'en' ? 'Characteristics' : '特徴'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    <tr>
                      <td className="px-6 py-4 font-bold">Cinema Immersion (THX)</td>
                      <td className="px-6 py-4">{lang === 'en' ? 'Width × 1.2' : '画面幅 × 1.2'}</td>
                      <td className="px-6 py-4 text-zinc-650 dark:text-zinc-400">{lang === 'en' ? 'Highly immersive, 40° viewing angle.' : '映画館の中央席のような高い没入感。視野角40度。'}</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 font-bold">Living Room (SMPTE)</td>
                      <td className="px-6 py-4">{lang === 'en' ? 'Width × 1.6' : '画面幅 × 1.6'}</td>
                      <td className="px-6 py-4 text-zinc-650 dark:text-zinc-400">{lang === 'en' ? 'Standard viewing, 30° viewing angle.' : 'テレビ視聴に適した標準的な距離。視野角30度。'}</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 font-bold">4K Resolution Standard</td>
                      <td className="px-6 py-4">{lang === 'en' ? 'Diagonal × 1.0-1.5' : '対角インチ × 1.0〜1.5'}</td>
                      <td className="px-6 py-4 text-zinc-650 dark:text-zinc-400">{lang === 'en' ? 'Close-up viewing to maximize 4K resolution clarity.' : '4Kの精細感を損なわず、かつ圧迫感のない実用的な近接視聴距離の目安。'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            
            <div>
              <h2 className="text-3xl font-bold mb-6 text-zinc-900 dark:text-zinc-100">{lang === 'en' ? 'How the Fit Judgment Works' : '設置可否の判定ロジックについて'}</h2>
              <div className="bg-white dark:bg-zinc-900 p-6 sm:p-8 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
                <p className="text-zinc-650 dark:text-zinc-400 text-sm leading-relaxed">
                  {lang === 'en'
                    ? 'The verdict bar (✓ / adjustment needed) is calculated from two conditions, both of which must pass:'
                    : '画面上部の判定バー（✓設置できます／要調整）は、以下の2つの条件を両方満たすかどうかで判定しています。'}
                </p>
                <ul className="text-sm space-y-3 text-zinc-650 dark:text-zinc-400 list-decimal list-inside">
                  <li>
                    <span className="font-bold text-zinc-900 dark:text-zinc-200">{lang === 'en' ? 'Throw distance is within the projector’s supported range: ' : '投写距離がプロジェクターの対応範囲内であること：'}</span>
                    {lang === 'en'
                      ? 'For the selected screen width, the projector’s throw ratio (min–max) defines a valid distance range. The projector position (Z) must fall inside that range (with a small margin for zoom/fixed-throw lenses).'
                      : '選んだスクリーン幅に対して、プロジェクターの投写比（最小〜最大）から算出される許容距離の範囲内に、実際の設置距離（Z）が収まっている必要があります（ズーム・固定焦点レンズ用に若干の余裕を持たせています）。'}
                  </li>
                  <li>
                    <span className="font-bold text-zinc-900 dark:text-zinc-200">{lang === 'en' ? 'The room has enough depth: ' : '部屋の奥行きに余裕があること：'}</span>
                    {lang === 'en'
                      ? 'Projector body depth plus a 5cm safety clearance from the back wall must fit within the room depth you entered.'
                      : 'プロジェクター本体の奥行きに加えて、後壁からの安全マージン（5cm）を確保した上で、入力した部屋の奥行きに収まっている必要があります。'}
                  </li>
                </ul>
                <div className="bg-[#FFFBEB] dark:bg-amber-950/40 text-[#B45309] dark:text-amber-200 p-3 rounded border border-[#FEF3C7] dark:border-amber-900/30 text-sm leading-relaxed">
                  {lang === 'en'
                    ? '⚠️ This judgment is a theoretical calculation based on published throw-ratio specs, not a guarantee. Actual installations are also affected by lens shift range, keystone correction, ceiling/wall obstructions, and cabling. Always confirm the exact specifications on the manufacturer’s official product page before purchasing.'
                    : '⚠️ この判定はスローレシオ（投写比）の公表値に基づく理論上の計算であり、設置を保証するものではありません。実際の設置ではレンズシフト範囲、台形補正の限界、天井・壁の障害物、配線なども影響します。購入前には必ずメーカーの製品ページで正確な仕様をご確認ください。'}
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold mb-6 text-zinc-900 dark:text-zinc-100">{lang === 'en' ? 'Frequently Asked Questions' : 'よくある質問'}</h2>
              <div className="space-y-4">
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                  <h4 className="font-bold mb-2">{lang === 'en' ? 'Q: Which is better, ceiling mount or shelf placement?' : 'Q: 天井吊りと棚置き、どちらが良いですか？'}</h4>
                  <p className="text-zinc-650 dark:text-zinc-400 text-sm">{lang === 'en' ? 'A: Ceiling mount is permanent but needs wiring. Shelf is easy but shadows may occur.' : 'A: 部屋によります。天吊りは影ができにくく常設に便利ですが工事や配線が必要です。棚置きは手軽ですが、人が横切ると影ができます。'}</p>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                  <h4 className="font-bold mb-2">{lang === 'en' ? 'Q: What is the ideal screen height?' : 'Q: 理想的なスクリーンの高さは？'}</h4>
                  <p className="text-zinc-650 dark:text-zinc-400 text-sm">{lang === 'en' ? 'A: Eye level should be at the lower 1/3 to 1/2 of the screen.' : 'A: ソファに座った時の目線（約90〜100cm）が、スクリーンの下から1/3〜1/2の高さに来るのが理想的です。高すぎると首が疲れます。'}</p>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                  <h4 className="font-bold mb-2">{lang === 'en' ? 'Q: Can I trust the "fits" / "adjustment needed" verdict?' : 'Q: 「設置できます」「要調整」の判定は信用できますか？'}</h4>
                  <p className="text-zinc-650 dark:text-zinc-400 text-sm">{lang === 'en' ? 'A: It’s a theoretical estimate based on published throw-ratio and dimension specs, not a guarantee. See "How the Fit Judgment Works" above, and always verify the official specs before buying.' : 'A: 公表されている投写比・寸法データに基づく理論上の目安であり、設置を保証するものではありません。上記「設置可否の判定ロジックについて」もあわせてご確認のうえ、購入前に必ずメーカー公式の仕様をご確認ください。'}</p>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                  <h4 className="font-bold mb-2">{lang === 'en' ? 'Q: About affiliate links' : 'Q: アフィリエイトリンクについて'}</h4>
                  <p className="text-zinc-650 dark:text-zinc-400 text-sm">{lang === 'en' ? 'A: Purchases through external links may generate affiliate revenue for us. Screen/accessory links go to search results, so a matching product isn’t always guaranteed to be listed.' : 'A: 各ECサイトへのリンクから商品が購入されると、紹介料が発生する場合があります。スクリーンなどのアクセサリー類のリンクは検索結果のため、該当商品が確実に存在するとは限りません。'}</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      )}

      {activeTab === 'links' && (
        <main className="flex-1 overflow-y-auto bg-[#F8F9FA] dark:bg-zinc-950 p-6 sm:p-12">
          <div className="max-w-5xl mx-auto space-y-12">
            <div>
              <h2 className="text-3xl font-bold mb-4 text-zinc-900 dark:text-zinc-100">{lang === 'en' ? 'Projector Links' : 'プロジェクター リンク'}</h2>
              <p className="text-zinc-500 dark:text-zinc-400 mb-8">{lang === 'en' ? 'Direct links to the projectors\' Amazon product pages, organized by brand.' : 'プロジェクターのAmazon販売ページへのリンク（メーカー別に整理）です。'}</p>
              
              {(() => {
                // Group projectors by brand
                const grouped = PROJECTOR_DB.reduce((acc, proj) => {
                  if (!acc[proj.brand]) acc[proj.brand] = [];
                  acc[proj.brand].push(proj);
                  return acc;
                }, {} as Record<string, typeof PROJECTOR_DB>);
                
                // Sort brands alphabetically
                const sortedBrands = Object.keys(grouped).sort();
                
                return (
                  <div className="space-y-10">
                    {sortedBrands.map((brand) => (
                      <div key={brand}>
                        <h3 className="flex items-center justify-between gap-2 text-xl font-bold mb-4 text-zinc-900 dark:text-zinc-100 pb-2 border-b border-zinc-200 dark:border-zinc-800">
                          <span>{brand}</span>
                          <a
                            href={getBrandStoreUrl(brand)}
                            target="_blank"
                            rel="noopener noreferrer sponsored"
                            className="shrink-0 flex items-center gap-1 text-xs font-bold text-[#FF9900] hover:text-[#e68a00] transition-colors"
                          >
                            {lang === 'en' ? 'Amazon Store Page' : 'Amazonストアページ'}
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </h3>
                        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                          {grouped[brand].map((item, idx) => (
                            <div key={idx} className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 shadow-sm flex flex-col hover:shadow-md dark:hover:shadow-lg transition-shadow">
                              {item.imageUrl && (
                                <div className="w-full h-28 mb-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg overflow-hidden flex items-center justify-center p-2 relative">
                                   <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal" />
                                   {item.isOnPrimeDaySale && item.discountPercent && (
                                    <div className="absolute top-2 right-2 bg-[#FF9900] text-white text-[10px] font-bold px-2 py-1 rounded">
                                      {Math.round(item.discountPercent)}% OFF
                                    </div>
                                  )}
                                </div>
                              )}
                              <h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-1.5 text-sm line-clamp-2">{item.name}</h4>
                              <div className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed flex-1 mb-3 space-y-1.5">
                                <div className="flex flex-wrap gap-1">
                                  <span className="inline-block px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded text-[10px] font-medium">{item.type}</span>
                                  {item.lightSource && (
                                    <span className="inline-block px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded text-[10px] font-medium">{item.lightSource}</span>
                                  )}
                                </div>
                                <div>{item.resolution} {item.brightness && `/ ${item.brightness}`}</div>
                                {(item.minSizeInch || item.maxSizeInch) && (
                                  <div>{lang === 'en' ? 'Screen size' : '対応画面サイズ'}: {item.minSizeInch}–{item.maxSizeInch}″</div>
                                )}
                                {item.os && <div>OS: {item.os}</div>}
                              </div>
                              {/* Price display */}
                              {item.salePriceJPY && (
                                <div className="mb-2 pb-2 border-b border-[#E9ECEF] dark:border-zinc-700">
                                  <div className="text-xs font-bold text-[#FF9900]">
                                    ¥{item.salePriceJPY.toLocaleString('ja-JP')}
                                  </div>
                                  {item.discountPercent ? (
                                    <div className="text-[10px] line-through text-[#95A5A6]">
                                      ¥{item.priceJPY?.toLocaleString('ja-JP')}
                                    </div>
                                  ) : null}
                                </div>
                              )}
                              <a href={getProjectorAmazonUrl(item)} target="_blank" rel="noopener noreferrer sponsored" className="w-full px-3 py-2 bg-gradient-to-b from-[#FF9900] to-[#E38800] hover:shadow-[0_4px_8px_rgba(255,153,0,0.4)] active:from-[#E38800] active:to-[#CC7700] transition-all rounded text-center text-xs font-bold text-white shadow-[0_2px_4px_rgba(255,153,0,0.3)]">
                                {lang === 'en' ? 'View on Amazon' : 'Amazonで見る'}
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
            
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <h3 className="font-bold text-zinc-900 dark:text-zinc-100 mb-3 flex items-center gap-2">
                <Info className="w-4 h-4 text-zinc-400" />
                {lang === 'en' ? 'Disclaimer / Affiliate Notice' : '免責事項 / アフィリエイトについて'}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                {lang === 'en' ? 'Some links utilize affiliate programs (no extra cost to you). Prices and stock shown here are for reference only and the actual price on Amazon may differ.' : '当ページの一部リンクはアフィリエイトプログラムを利用しています（購入者に追加料金はかかりません）。表示している価格・在庫は参考情報であり、実際のAmazon販売価格とは異なる場合があります。'}
              </p>
            </div>
          </div>
        </main>
      )}
    </div>
  );
}

function Info(props: any) {
  return <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
}
