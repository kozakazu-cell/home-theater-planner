import React, { useState } from 'react';
import { Settings2, ChevronDown, ChevronUp, ShoppingCart, Info, Search, CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react';
import { TheaterState, PROJECTOR_DB, getScreenSizeMm } from '../types/theater';
import { useI18n } from '../i18n';
import { ProjectorSelectorModal } from './ProjectorSelectorModal';
import { getInstallationFit } from '../utils/theaterFit';

const getAmazonSearchUrl = (keyword: string) => {
  const base = `https://www.amazon.co.jp/s?k=${encodeURIComponent(keyword)}`;
  const tag = import.meta.env.VITE_AMAZON_ASSOCIATE_TAG;
  if (tag) {
    return `${base}&tag=${tag}`;
  }
  return base;
};



function AccordionSection({ title, children, defaultOpen = true, isDarkMode = false }: { title: string, children: React.ReactNode, defaultOpen?: boolean, isDarkMode?: boolean }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="bg-white dark:bg-zinc-900 border-b border-[#DEE2E6] dark:border-zinc-800">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="w-full flex items-center justify-between p-4 hover:bg-[#F8F9FA]/60 dark:hover:bg-zinc-800/50 transition-colors"
      >
        <span className="text-[10px] font-bold text-[#2D3436] dark:text-zinc-200 uppercase tracking-wider">{title}</span>
        <div className="p-1 rounded-full bg-[#F1F3F5] dark:bg-zinc-800 text-[#95A5A6] dark:text-zinc-400">
          {isOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </div>
      </button>
      {isOpen && (
        <div className="p-4 pt-0">
          {children}
        </div>
      )}
    </div>
  );
}

function InfoField({ title, value, content, isDarkMode = false }: { title: string, value: React.ReactNode, content?: string, isDarkMode?: boolean }) {
  const [show, setShow] = useState(false);
  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex justify-between items-start leading-tight">
        {content ? (
          <span 
            onClick={() => setShow(!show)} 
            className="font-bold text-[#95A5A6] cursor-pointer hover:text-[#2D3436] dark:hover:text-zinc-100 flex items-center gap-1 border-b border-dashed border-[#95A5A6]/80 transition-colors select-none"
          >
            {title}
            <Info className="w-3.5 h-3.5 text-[#95A5A6] shrink-0" />
          </span>
        ) : (
          <span className="font-bold text-[#95A5A6]">{title}</span>
        )}
        <div className="text-right font-mono text-[#2D3436] dark:text-zinc-100 pl-2">{value}</div>
      </div>
      {show && content && (
        <div className="mt-1.5 mb-1 p-2 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-[10px] text-[#2D3436] dark:text-zinc-200 rounded shadow-sm font-sans leading-relaxed normal-case w-full transition-all">
          {content}
        </div>
      )}
    </div>
  );
}

interface ControlsProps {
  state: TheaterState;
  onUpdateState: (state: Partial<TheaterState>) => void;
  view: 'top' | 'side' | 'front' | '3d';
  setView: (v: 'top' | 'side' | 'front' | '3d') => void;
  isDarkMode?: boolean;
}

export function Controls({ state, onUpdateState, view, setView, isDarkMode = false }: ControlsProps) {
  const { t, lang } = useI18n();
  const { room, projector, screenSizeInch, projectorPos } = state;
  const screenSz = getScreenSizeMm(screenSizeInch);
  const [isModalOpen, setIsModalOpen] = useState(false);
  

  
  const fit = getInstallationFit(room, projector, screenSz.w, projectorPos.z);
  const { minThrowDist, maxThrowDist, isInstallationValid } = fit;

  return (
    <div className="w-full md:w-[350px] bg-[#F1F3F5] dark:bg-zinc-950 flex-1 min-h-0 md:flex-none md:h-full flex flex-col z-10 border-t md:border-t-0 md:border-l border-[#E9ECEF] dark:border-zinc-800">
      <div className="p-4 border-b border-[#DEE2E6] dark:border-zinc-800 flex justify-between items-center bg-white dark:bg-zinc-900 shadow-sm z-10">
        <div className="flex items-center gap-2">
          <Settings2 className="w-4 h-4 text-[#2D3436] dark:text-zinc-200" />
          <h2 className="text-xs font-bold text-[#2D3436] dark:text-zinc-200 uppercase tracking-wide">Simulation Params</h2>
        </div>
        <div className="text-[10px] font-bold text-[#95A5A6] bg-[#F8F9FA] dark:bg-zinc-800 px-2 py-1 rounded">
          {view.toUpperCase()} VIEW
        </div>
      </div>

      {/* Fit verdict — always visible, the single most important simulation output */}
      <div className={`px-4 py-2.5 flex items-center justify-between gap-2 border-b shrink-0 ${
        isInstallationValid
          ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/50'
          : 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900/50'
      }`}>
        <div className={`flex items-center gap-1.5 text-xs font-bold ${isInstallationValid ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
          {isInstallationValid
            ? <CheckCircle2 className="w-4 h-4 shrink-0" />
            : <AlertTriangle className="w-4 h-4 shrink-0" />}
          <span>
            {isInstallationValid
              ? (lang === 'en' ? 'This setup fits your room' : 'この構成で設置できます')
              : (lang === 'en' ? 'Adjust distance or size' : '距離かサイズの調整が必要')}
          </span>
        </div>
        <span className="font-mono text-[10px] text-zinc-500 dark:text-zinc-400 shrink-0">
          {screenSizeInch}&quot; / {projectorPos.z}mm
        </span>
      </div>

      <div className="flex-1 overflow-y-auto w-full scrollbar-default p-3 space-y-3">
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-[#DEE2E6] dark:border-zinc-800 overflow-hidden">
          <AccordionSection title={t('projectorSet')} isDarkMode={isDarkMode}>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[#95A5A6] dark:text-zinc-400 uppercase block mb-1">{t('projectorModel')}</label>
              
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full bg-white dark:bg-zinc-900 border-2 border-[#3B82F6] hover:border-blue-600 dark:hover:border-blue-400 rounded-lg p-3 text-left transition-all flex items-center justify-between group shadow-sm ring-4 ring-blue-500/10"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded bg-[#F8F9FA] dark:bg-zinc-800 flex items-center justify-center p-1 border border-[#E9ECEF] dark:border-zinc-700 shrink-0">
                    <img src={projector.imageUrl} alt={projector.name} className="max-w-full max-h-full object-contain mix-blend-multiply dark:mix-blend-normal" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] uppercase font-bold text-[#95A5A6] dark:text-zinc-400 truncate">{projector.brand}</div>
                    <div className="text-sm font-bold text-[#2D3436] dark:text-zinc-100 mt-0.5 group-hover:text-[#3B82F6] dark:group-hover:text-blue-400 transition-colors truncate">{projector.name}</div>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950/45 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform ml-2">
                  <Search className="w-4 h-4 text-[#3B82F6]" />
                </div>
              </button>
            </div>

            <div className={`space-y-2 pt-2 ${!isInstallationValid ? 'bg-red-50 dark:bg-red-950/20 p-2 rounded -mx-2 px-2 border border-red-200 dark:border-red-900/40' : ''}`}>
            <div className={`flex justify-between items-center text-[10px] font-bold uppercase ${!isInstallationValid ? 'text-red-600 dark:text-red-400' : 'text-[#95A5A6] dark:text-zinc-400'}`}>
              <span>{t('screenSize')}</span>
              <div className="flex items-center gap-1 font-mono text-[#2D3436] dark:text-zinc-100">
                <input 
                  type="number" 
                  value={screenSizeInch}
                  onChange={(e) => onUpdateState({ screenSizeInch: parseInt(e.target.value) || 0 })}
                  className="w-12 text-right bg-transparent border-b border-transparent hover:border-[#DEE2E6] dark:hover:border-zinc-700 focus:border-black dark:focus:border-white focus:outline-none"
                />
                <span>&#34;</span>
              </div>
            </div>
            <input 
              type="range" min="60" max="200" step="5" 
              value={screenSizeInch} 
              onChange={(e) => onUpdateState({ screenSizeInch: parseInt(e.target.value) })}
              className="w-full accent-black dark:accent-zinc-200"
            />
          </div>

          <div className="space-y-2 pt-2">
            <div className="flex justify-between items-center text-[10px] font-bold text-[#95A5A6] dark:text-zinc-400 uppercase">
              <span>{t('screenHeightLimit')} (Y)</span>
              <div className="flex items-center gap-1 font-mono text-[#2D3436] dark:text-zinc-100">
                <input 
                  type="number" 
                  value={state.screenBottomY}
                  onChange={(e) => onUpdateState({ screenBottomY: Math.max(0, parseInt(e.target.value) || 0) })}
                  className="w-14 text-right bg-transparent border-b border-transparent hover:border-[#DEE2E6] dark:hover:border-zinc-700 focus:border-black dark:focus:border-white focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={projector.type === 'UST'}
                />
                <span>mm</span>
              </div>
            </div>
            <input 
              type="range" min="0" max={Math.max(0, room.height - screenSz.h)} step="10" 
              value={state.screenBottomY} 
              onChange={(e) => onUpdateState({ screenBottomY: Math.max(0, parseInt(e.target.value) || 0) })}
              className={`w-full accent-black dark:accent-zinc-200 ${projector.type === 'UST' ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={projector.type === 'UST'}
            />
          </div>

          <div className="space-y-2 pt-4 mt-2">
            <label className="flex items-center gap-2 cursor-pointer text-[10px] font-bold text-[#95A5A6] dark:text-zinc-400 uppercase mt-2">
              <input 
                type="checkbox"
                checked={state.showViewer}
                onChange={(e) => onUpdateState({ showViewer: e.target.checked })}
                className="accent-black dark:accent-zinc-200"
              />
              {t('viewerSofaLayer')}
            </label>
            {state.showViewer && (
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-bold text-[#95A5A6] dark:text-zinc-400 uppercase">
                    <span>{t('viewerSofa')} Size</span>
                  </div>
                  <select 
                    value={state.audienceSize?.w || 1800}
                    onChange={(e) => onUpdateState({ audienceSize: { w: parseInt(e.target.value), d: 900, h: 800 } })}
                    className="w-full bg-[#F8F9FA] dark:bg-zinc-800 border border-[#DEE2E6] dark:border-zinc-700 text-[#2D3436] dark:text-zinc-100 text-xs py-2 px-2 rounded focus:outline-none focus:border-black dark:focus:border-white appearance-none"
                  >
                    <option value="900">{lang === 'en' ? '1 Seat (900mm)' : '1人掛け (900mm)'}</option>
                    <option value="1600">{lang === 'en' ? '2 Seats (1600mm)' : '2人掛け (1600mm)'}</option>
                    <option value="1800">{lang === 'en' ? '2.5 Seats (1800mm)' : '2.5人掛け (1800mm)'}</option>
                    <option value="2200">{lang === 'en' ? '3 Seats (2200mm)' : '3人掛け (2200mm)'}</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-bold text-[#95A5A6] dark:text-zinc-400 uppercase">
                    <span>{t('viewerSofa')} Character</span>
                  </div>
                  <select 
                    value={state.viewerModel || 'human'}
                    onChange={(e) => onUpdateState({ viewerModel: e.target.value as any })}
                    className="w-full bg-[#F8F9FA] dark:bg-zinc-800 border border-[#DEE2E6] dark:border-zinc-700 text-[#2D3436] dark:text-zinc-100 text-xs py-2 px-2 rounded focus:outline-none focus:border-black dark:focus:border-white appearance-none"
                  >
                    <option value="human">{lang === 'en' ? 'Standard (Human)' : '標準（人間）'}</option>
                    <option value="bear">{lang === 'en' ? 'Teddy Bear' : '熊のぬいぐるみ'}</option>
                    <option value="hero">{lang === 'en' ? 'Action Hero' : 'アクションヒーロー'}</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-bold text-[#95A5A6] dark:text-zinc-400 uppercase">
                    <span>{t('viewerSofa')}</span>
                    <div className="flex items-center gap-1 font-mono text-[#2D3436] dark:text-zinc-100">
                      <input 
                        type="number" 
                        value={state.audiencePos.z}
                        onChange={(e) => onUpdateState({ audiencePos: { ...state.audiencePos, z: parseInt(e.target.value) || 0 } })}
                        className="w-14 text-right bg-transparent border-b border-transparent hover:border-[#DEE2E6] dark:hover:border-zinc-700 focus:border-black dark:focus:border-white focus:outline-none"
                      />
                      <span>mm</span>
                    </div>
                  </div>
                  <input 
                    type="range" min="1000" max={room.depth - 500} step="50" 
                    value={state.audiencePos.z} 
                    onChange={(e) => onUpdateState({ audiencePos: { ...state.audiencePos, z: parseInt(e.target.value) } })}
                    className="w-full accent-black dark:accent-zinc-200"
                  />
                </div>
              </div>
            )}
          </div>

{/* X position input removed to simplify and fix it to center */}

          <div className={`space-y-2 pt-2 ${!isInstallationValid ? 'bg-red-50 dark:bg-red-950/20 p-2 rounded -mx-2 px-2 border border-red-200 dark:border-red-900/40' : ''}`}>
            <div className={`flex justify-between items-center text-[10px] font-bold uppercase ${!isInstallationValid ? 'text-red-600 dark:text-red-400' : 'text-[#95A5A6] dark:text-zinc-400'}`}>
              <span>{t('projectorZPos')}</span>
              <div className="flex items-center gap-1 font-mono text-[#2D3436] dark:text-zinc-100">
                <input 
                  type="number" 
                  value={projectorPos.z}
                  onChange={(e) => onUpdateState({ projectorPos: { ...projectorPos, z: parseInt(e.target.value) || 0 } })}
                  className="w-14 text-right bg-transparent border-b border-transparent hover:border-[#DEE2E6] dark:hover:border-zinc-700 focus:border-black dark:focus:border-white focus:outline-none text-[#2D3436] dark:text-zinc-100"
                />
                <span>mm</span>
              </div>
            </div>
            <input 
              type="range" min="50" max={room.depth - 50} step="10" 
              value={projectorPos.z} 
              onChange={(e) => onUpdateState({ projectorPos: { ...projectorPos, z: parseInt(e.target.value) } })}
              className="w-full accent-black dark:accent-zinc-200"
            />
            <div className="mt-2 bg-[#F8F9FA] dark:bg-zinc-800 border border-[#DEE2E6] dark:border-zinc-700 rounded p-2">
              <div className="flex justify-between items-center mb-1 text-[10px]">
                <span className="font-bold text-[#2D3436] dark:text-zinc-200 uppercase">{t('throwRange')}</span>
                <span className="font-mono font-bold text-[#2D3436] dark:text-zinc-100">{Math.round(minThrowDist)} - {Math.round(maxThrowDist)} mm</span>
              </div>
              <div className="text-[9px] text-[#95A5A6] leading-tight break-words">
                {t('throwRangeDesc')}
              </div>
            </div>
          </div>



          <div className="space-y-2 pt-2">
            <div className="flex justify-between items-center text-[10px] font-bold text-[#95A5A6] dark:text-zinc-400 uppercase">
              <span>{t('projectorYPos')}</span>
              <div className="flex items-center gap-1 font-mono text-[#2D3436] dark:text-zinc-100">
                <input 
                  type="number" 
                  value={projectorPos.y}
                  onChange={(e) => {
                    const newY = parseInt(e.target.value) || 0;
                    onUpdateState({ projectorPos: { ...projectorPos, y: newY } });
                  }}
                  className="w-14 text-right bg-transparent border-b border-transparent hover:border-[#DEE2E6] dark:hover:border-zinc-700 focus:border-black dark:focus:border-white focus:outline-none text-[#2D3436] dark:text-zinc-100"
                />
                <span>mm</span>
              </div>
            </div>
            <input 
              type="range" min="0" max={room.height} step="10" 
              value={projectorPos.y} 
              onChange={(e) => {
                const newY = parseInt(e.target.value) || 0;
                onUpdateState({ projectorPos: { ...projectorPos, y: newY } });
              }}
              className="w-full accent-black dark:accent-zinc-200"
            />
          </div>
          </div>
        </AccordionSection>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-[#DEE2E6] dark:border-zinc-800 overflow-hidden">
          <AccordionSection title={t('roomSize')} defaultOpen={false} isDarkMode={isDarkMode}>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px] font-bold text-[#95A5A6] dark:text-zinc-400 uppercase">
                <span>{t('depth')}</span>
                <div className="flex items-center gap-1 font-mono text-[#2D3436] dark:text-zinc-100">
                  <input 
                    type="number" 
                    value={room.depth}
                    onChange={(e) => onUpdateState({ room: { ...room, depth: parseInt(e.target.value) || 0 } })}
                    className="w-14 text-right bg-transparent border-b border-transparent hover:border-[#DEE2E6] dark:hover:border-zinc-700 focus:border-black dark:focus:border-white focus:outline-none text-[#2D3436] dark:text-zinc-100"
                  />
                  <span>mm</span>
                </div>
              </div>
              <input 
                type="range" min="2000" max="8000" step="100" 
                value={room.depth} 
                onChange={(e) => onUpdateState({ room: { ...room, depth: parseInt(e.target.value) } })}
                className="w-full accent-black dark:accent-zinc-200"
              />
            </div>

            <div className="space-y-2 pt-2">
              <div className="flex justify-between items-center text-[10px] font-bold text-[#95A5A6] dark:text-zinc-400 uppercase">
                <span>{t('width')} (X)</span>
                <div className="flex items-center gap-1 font-mono text-[#2D3436] dark:text-zinc-100">
                  <input 
                    type="number" 
                    value={room.width}
                    onChange={(e) => onUpdateState({ room: { ...room, width: parseInt(e.target.value) || 0 } })}
                    className="w-14 text-right bg-transparent border-b border-transparent hover:border-[#DEE2E6] dark:hover:border-zinc-700 focus:border-black dark:focus:border-white focus:outline-none text-[#2D3436] dark:text-zinc-100"
                  />
                  <span>mm</span>
                </div>
              </div>
              <input 
                type="range" min="2000" max="8000" step="100" 
                value={room.width} 
                onChange={(e) => onUpdateState({ room: { ...room, width: parseInt(e.target.value) } })}
                className="w-full accent-black dark:accent-zinc-200"
              />
            </div>

            <div className="space-y-2 pt-2">
              <div className="flex justify-between items-center text-[10px] font-bold text-[#95A5A6] dark:text-zinc-400 uppercase">
                <span>{t('height')} (Y)</span>
                <div className="flex items-center gap-1 font-mono text-[#2D3436] dark:text-zinc-100">
                  <input 
                    type="number" 
                    value={room.height}
                    onChange={(e) => onUpdateState({ room: { ...room, height: parseInt(e.target.value) || 0 } })}
                    className="w-14 text-right bg-transparent border-b border-transparent hover:border-[#DEE2E6] dark:hover:border-zinc-700 focus:border-black dark:focus:border-white focus:outline-none text-[#2D3436] dark:text-zinc-100"
                  />
                  <span>mm</span>
                </div>
              </div>
              <input 
                type="range" min="2000" max="4000" step="100" 
                value={room.height} 
                onChange={(e) => onUpdateState({ room: { ...room, height: parseInt(e.target.value) } })}
                className="w-full accent-black dark:accent-zinc-200"
              />
            </div>

          </div>
        </AccordionSection>
        </div>

        {/* Gear list — the shopping funnel, promoted above play features */}
        <div id="gear-panel" className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border-2 border-[#FF9900]/30 dark:border-[#FF9900]/25 overflow-hidden">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-3">
               <div className="w-6 h-6 rounded-md bg-orange-50 dark:bg-orange-950/40 flex items-center justify-center">
                  <ShoppingCart className="w-3.5 h-3.5 text-[#FF9900]" />
               </div>
               <div>
                  <h4 className="text-[11px] font-bold text-black dark:text-zinc-100 leading-none">
                    {lang === 'en' ? 'Gear for this setup' : 'この構成に必要な機材'}
                  </h4>
                  <div className="text-[9px] text-[#95A5A6] font-medium mt-0.5">
                    {lang === 'en' ? 'Matched to your current simulation' : 'いまのシミュレーション設定に連動しています'}
                  </div>
               </div>
            </div>

            <div className="space-y-2">
              {[
                {
                  icon: <img src={projector.imageUrl} alt={projector.name} className="max-w-full max-h-full object-contain mix-blend-multiply dark:mix-blend-normal rounded-sm" />,
                  cat: lang === 'en' ? 'Projector' : 'プロジェクター本体',
                  name: `${projector.brand} ${projector.name}`,
                  kw: `${projector.brand} ${projector.name}`,
                },
                {
                  icon: <span className="text-lg">📺</span>,
                  cat: lang === 'en' ? 'Screen' : 'スクリーン',
                  name: lang === 'en' ? `${screenSizeInch}″ 16:9 screen` : `${screenSizeInch}インチ 16:9`,
                  kw: lang === 'en' ? `Projector Screen ${screenSizeInch} inch` : `プロジェクタースクリーン ${screenSizeInch}インチ`,
                },
                {
                  icon: <span className="text-lg">🛠️</span>,
                  cat: lang === 'en' ? 'Mount' : '設置マウント',
                  name: projectorPos.y > 1500
                    ? (lang === 'en' ? 'Ceiling mount bracket' : '天吊りブラケット')
                    : (lang === 'en' ? 'Floor / table stand' : '床置き・テーブル用スタンド'),
                  kw: projectorPos.y > 1500
                    ? (lang === 'en' ? 'Projector Ceiling Mount' : 'プロジェクター 天吊り金具 天井')
                    : (lang === 'en' ? 'Projector Stand Floor' : 'プロジェクター スタンド 床置き'),
                },
                {
                  icon: <span className="text-lg">🔌</span>,
                  cat: lang === 'en' ? 'Cable' : 'ケーブル',
                  name: lang === 'en'
                    ? `HDMI 2.1 (~${Math.max(3, Math.ceil(projectorPos.z / 1000) + 1)}m)`
                    : `HDMI 2.1（目安 ${Math.max(3, Math.ceil(projectorPos.z / 1000) + 1)}m）`,
                  kw: lang === 'en' ? 'HDMI 2.1 long cable' : 'HDMI 2.1 ロングケーブル',
                },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg border border-[#E9ECEF] dark:border-zinc-700 bg-white dark:bg-zinc-900">
                  <div className="w-10 h-10 rounded bg-[#F8F9FA] dark:bg-zinc-800 flex items-center justify-center p-1 border border-[#DEE2E6] dark:border-zinc-700 shrink-0">
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[8px] font-bold text-[#95A5A6] uppercase">{item.cat}</div>
                    <div className="text-xs font-bold text-[#2D3436] dark:text-zinc-100 truncate">{item.name}</div>
                  </div>
                  <a
                    href={getAmazonSearchUrl(item.kw)}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-[#FF9900] hover:bg-[#e68a00] text-white text-[10px] font-bold transition-colors"
                  >
                    {lang === 'en' ? 'Amazon' : 'Amazonで見る'}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              ))}
            </div>

            <p className="text-[8px] text-[#95A5A6] leading-relaxed mt-3 pt-2 border-t border-dashed border-[#E9ECEF] dark:border-zinc-800">
              {lang === 'en'
                ? '※ This page contains promotional/affiliate links (Amazon Associates). As an Amazon Associate, we earn from qualifying purchases.'
                : '※本ページはAmazonアソシエイト・プログラムのPRリンクを含みます。適格販売により収入を得ています。'}
            </p>
          </div>
        </div>

        {/* Viewing Mode — compact segmented control with one-line summary */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-[#DEE2E6] dark:border-zinc-800 p-4 space-y-2.5">
          <div className="text-[10px] font-bold text-[#95A5A6] dark:text-zinc-400 uppercase tracking-wider">{lang === 'en' ? 'Viewing Mode' : '視聴モード'}</div>
          <div className="grid grid-cols-4 gap-1 p-1 rounded-lg bg-zinc-100 dark:bg-zinc-800">
            {([
              { key: 'cinema', label: lang === 'en' ? 'Cinema' : 'シネマ' },
              { key: 'living', label: lang === 'en' ? 'Living' : 'リビング' },
              { key: 'general4k', label: '4K' },
              { key: 'custom', label: lang === 'en' ? 'Custom' : '自由' },
            ] as const).map(({ key, label }) => {
              const active = state.viewingMode === key || (key === 'custom' && !state.viewingMode);
              return (
                <button
                  key={key}
                  onClick={() => onUpdateState({ viewingMode: key })}
                  className={`py-1.5 rounded-md text-[10px] font-bold transition-colors ${
                    active
                      ? 'bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 shadow-sm'
                      : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
          <p className="text-[10px] leading-relaxed text-zinc-500 dark:text-zinc-400">
            {(() => {
              switch (state.viewingMode) {
                case 'cinema':
                  return lang === 'en'
                    ? `THX immersive: seat ${(screenSz.w * 1.1 / 1000).toFixed(1)}–${(screenSz.w * 1.5 / 1000).toFixed(1)}m from screen. The pink zone in the floor plan updates.`
                    : `THX基準の没入距離。スクリーンから ${(screenSz.w * 1.1 / 1000).toFixed(1)}〜${(screenSz.w * 1.5 / 1000).toFixed(1)}m が推奨。図面のピンク領域が連動します。`;
                case 'living':
                  return lang === 'en'
                    ? `SMPTE living-room: seat ${(screenSz.w * 1.5 / 1000).toFixed(1)}–${(screenSz.w * 2.0 / 1000).toFixed(1)}m from screen, suited for TV and sports.`
                    : `SMPTE基準のテレビ向け距離。${(screenSz.w * 1.5 / 1000).toFixed(1)}〜${(screenSz.w * 2.0 / 1000).toFixed(1)}m が推奨。テレビ・スポーツ観戦向き。`;
                case 'general4k':
                  return lang === 'en'
                    ? `4K close-up: ${(state.screenSizeInch * 25.4 / 1000).toFixed(1)}–${(state.screenSizeInch * 25.4 * 1.5 / 1000).toFixed(1)}m to enjoy full resolution without visible pixels.`
                    : `4K解像度を活かす近距離。${(state.screenSizeInch * 25.4 / 1000).toFixed(1)}〜${(state.screenSizeInch * 25.4 * 1.5 / 1000).toFixed(1)}m で画素を感じず高精細を体感。`;
                default:
                  return lang === 'en'
                    ? 'Free layout in millimeters. Standards compliance is still validated in real time.'
                    : 'すべてmm単位で自由に配置。基準への適合は上の判定バーでリアルタイムに確認できます。';
              }
            })()}
          </p>
        </div>

        {/* Content Mode — compact chip row */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-[#DEE2E6] dark:border-zinc-800 p-4 space-y-2.5">
          <div className="text-[10px] font-bold text-[#95A5A6] dark:text-zinc-400 uppercase tracking-wider">{lang === 'en' ? 'Screen Content' : 'スクリーンに映す映像'}</div>
          <div className="flex flex-wrap gap-1.5">
            {([
              { key: 'movie', label: t('contentMovie') },
              { key: 'live', label: t('contentLive') },
              { key: 'sports', label: t('contentSports') },
              { key: 'game', label: t('contentGame') },
              { key: 'off', label: lang === 'en' ? 'Off' : '消灯' },
            ] as const).map(({ key, label }) => {
              const active = state.contentMode === key;
              return (
                <button
                  key={key}
                  onClick={() => onUpdateState({ contentMode: key })}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-colors border ${
                    active
                      ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-zinc-900 dark:border-zinc-100'
                      : 'bg-white dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        
        </div>

      {/* Sticky purchase CTA — the funnel is always one tap away */}
      <div className="shrink-0 p-3 border-t border-[#DEE2E6] dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <a
          href={getAmazonSearchUrl(`${projector.brand} ${projector.name}`)}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#FF9900] hover:bg-[#e68a00] text-white text-xs font-bold transition-colors"
        >
          <ShoppingCart className="w-4 h-4" />
          {lang === 'en' ? `View ${projector.name} on Amazon` : `『${projector.name}』をAmazonで見る`}
        </a>
        <p className="text-[8px] text-center text-[#95A5A6] mt-1.5">{lang === 'en' ? 'PR: affiliate link' : 'PR：アフィリエイトリンクを含みます'}</p>
      </div>

      <ProjectorSelectorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentProjectorId={projector.id}
        room={room}
        screenSizeInch={screenSizeInch}
        onSelect={(p) => {
          const pOffset = p.throwDistanceOffset || 0;
          const newMinDist = p.throwRatio.min * screenSz.w + pOffset;
          const newMaxDist = p.throwRatio.max * screenSz.w + pOffset;
          let newZ = projectorPos.z;
          if (newZ < newMinDist || newZ > newMaxDist) {
            newZ = p.throwRatio.min === p.throwRatio.max ? newMinDist : (newMinDist + newMaxDist) / 2;
          }
          let newY = projectorPos.y;
          if (p.type === 'UST') {
            newY = 350 + p.size.h / 2;
          } else if (projector.type === 'UST') {
            newY = room.height - p.size.h / 2 - 100;
          }
          onUpdateState({ 
            projector: p,
            projectorPos: { ...projectorPos, z: Math.round(newZ), y: Math.round(newY) }
          });
        }}
      />
    </div>
  );
}
