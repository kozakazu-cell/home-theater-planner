import React, { useState } from 'react';
import { Settings2, ChevronDown, ChevronUp, ShoppingCart, Info, Search, ChevronRight } from 'lucide-react';
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

        {/* Viewing Mode */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-[#DEE2E6] dark:border-zinc-800 p-4 space-y-3">
          <div className="text-[10px] font-bold text-[#95A5A6] dark:text-zinc-400 uppercase tracking-wider mb-1">Viewing Mode</div>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <button
              onClick={() => onUpdateState({ viewingMode: 'cinema' })}
              title="Immersive distance for cinema based on THX. 1.1x to 1.5x screen width recommended."
              className={`py-2 px-2.5 rounded-lg text-[10px] font-bold transition-all text-center leading-tight flex flex-col justify-center items-center h-10 ${
                state.viewingMode === 'cinema' 
                ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-sm ring-2 ring-zinc-900/20' 
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              <div>Cinema Immersion (THX)</div>
              <div className="text-[8px] font-normal opacity-85">((THX Recommended))</div>
            </button>
            <button
              onClick={() => onUpdateState({ viewingMode: 'living' })}
              title="Standard distance for living rooms based on SMPTE. 1.5x to 2.0x screen width recommended."
              className={`py-2 px-2.5 rounded-lg text-[10px] font-bold transition-all text-center leading-tight flex flex-col justify-center items-center h-10 ${
                state.viewingMode === 'living' 
                ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-sm ring-2 ring-zinc-900/20' 
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              <div>Living Room (SMPTE)</div>
              <div className="text-[8px] font-normal opacity-85">((SMPTE TV Recommended))</div>
            </button>
            <button
              onClick={() => onUpdateState({ viewingMode: 'general4k' })}
              title="General guide for 4K. 1.0x to 1.5x screen diagonal recommended."
              className={`col-span-2 py-2 px-2.5 rounded-lg text-[10px] font-bold transition-all text-center leading-tight flex flex-col justify-center items-center h-10 ${
                state.viewingMode === 'general4k' 
                ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-sm ring-2 ring-zinc-900/20' 
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              {lang === 'en' ? '4K Resolution Guide' : '4K解像度基準'}
              <div className="text-[8px] font-normal opacity-85">((General Guide))</div>
            </button>
            <button
              onClick={() => onUpdateState({ viewingMode: 'custom' })}
              className={`col-span-2 py-2 px-2.5 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1.5 h-9 ${
                (state.viewingMode === 'custom' || !state.viewingMode) 
                ? 'bg-[#E59700] text-white shadow-sm ring-2 ring-amber-500/20' 
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-[#E9ECEF] dark:hover:bg-zinc-700'
              }`}
            >
              <Settings2 className="w-3.5 h-3.5" />
              Custom Manual
            </button>
          </div>

          {/* Dynamic Viewing Mode Guidance Area for Touch Screens / Mobile */}
          <div className="bg-zinc-50 dark:bg-zinc-800/40 rounded-lg p-2.5 border border-zinc-200 dark:border-zinc-800/60 text-[10px] leading-relaxed text-zinc-600 dark:text-zinc-300 mb-2 mt-0.5 select-none">
            <div className="font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-1.5 mb-1 text-[11px]">
              <Info className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500 shrink-0" />
              {(() => {
                switch (state.viewingMode) {
                  case 'cinema': return 'Cinema Immersion (THX) (THX Cinema)';
                  case 'living': return 'Living Room (SMPTE) (SMPTE TV)';
                  case 'general4k': return lang === 'en' ? '4K Resolution Guide ((General Guide))' : '4K解像度基準 ((General Guide))';
                  default: return 'Custom Manual';
                }
              })()}
            </div>
            {(() => {
              switch (state.viewingMode) {
                case 'cinema': 
                  return (
                    <div className="space-y-1.5 text-zinc-600 dark:text-zinc-300">
                      <p>Highly immersive experience like a movie theater. 40° viewing angle, 1.1–1.5x screen width.</p>
                      <div className="border-t border-dashed border-zinc-200 dark:border-zinc-800 pt-1.5 mt-1.5 text-[9px] text-zinc-500 dark:text-zinc-400 space-y-1">
                        <div className="font-bold text-zinc-700 dark:text-zinc-300">🛋️ Simulator changes in this mode:</div>
                        <ul className="list-disc pl-3.5 space-y-0.5">
                          <li><span className="font-bold text-zinc-600 dark:text-zinc-300">Optimal Distance:</span>1.1x to 1.5x screen width（{(screenSz.w * 1.1 / 1000).toFixed(1)}m〜{(screenSz.w * 1.5 / 1000).toFixed(1)}m） automatically set</li>
                          <li><span className="font-bold text-zinc-600 dark:text-zinc-300">2D Recommendation Mark:</span>Pink/red "Recommended Viewing Area" on the floor plan syncs to THX distance standard</li>
                          <li><span className="font-bold text-zinc-600 dark:text-zinc-300">Real-time Validation:</span>Status and warnings display if the sofa is outside the recommended range</li>
                        </ul>
                      </div>
                    </div>
                  );
                case 'living': 
                  return (
                    <div className="space-y-1.5 text-zinc-600 dark:text-zinc-300">
                      <p>Standard view assuming a 30° viewing angle, suitable for TV or sports (1.5–2.0x screen width).</p>
                      <div className="border-t border-dashed border-zinc-200 dark:border-zinc-800 pt-1.5 mt-1.5 text-[9px] text-zinc-500 dark:text-zinc-400 space-y-1">
                        <div className="font-bold text-zinc-700 dark:text-zinc-300">🛋️ Simulator changes in this mode:</div>
                        <ul className="list-disc pl-3.5 space-y-0.5">
                          <li><span className="font-bold text-zinc-600 dark:text-zinc-300">Optimal Distance:</span>1.5x to 2.0x screen width（{(screenSz.w * 1.5 / 1000).toFixed(1)}m〜{(screenSz.w * 2.0 / 1000).toFixed(1)}m） automatically set</li>
                          <li><span className="font-bold text-zinc-600 dark:text-zinc-300">2D Recommendation Mark:</span>Recommended area dynamically updates to a slightly farther position suited for TV viewing.</li>
                          <li><span className="font-bold text-zinc-600 dark:text-zinc-300">Real-time Validation:</span> Validates if sofa position is eye-friendly for living room viewing.</li>
                        </ul>
                      </div>
                    </div>
                  );
                case 'general4k': 
                  return (
                    <div className="space-y-1.5 text-zinc-600 dark:text-zinc-300">
                      <p>Close distance to experience extreme resolution. 1.0-1.5x screen diagonal.</p>
                      <div className="border-t border-dashed border-zinc-200 dark:border-zinc-800 pt-1.5 mt-1.5 text-[9px] text-zinc-500 dark:text-zinc-400 space-y-1">
                        <div className="font-bold text-zinc-700 dark:text-zinc-300">🛋️ Simulator changes in this mode:</div>
                        <ul className="list-disc pl-3.5 space-y-0.5">
                          <li><span className="font-bold text-zinc-600 dark:text-zinc-300">Optimal Distance:</span>1.0-1.5x screen diagonal（{(state.screenSizeInch * 25.4 * 1.0 / 1000).toFixed(1)}m〜{(state.screenSizeInch * 25.4 * 1.5 / 1000).toFixed(1)}m） automatically set</li>
                          <li><span className="font-bold text-zinc-600 dark:text-zinc-300">2D Recommendation Mark:</span>Recommended area moves closer to the screen to utilize maximum high definition benefits.</li>
                          <li><span className="font-bold text-zinc-600 dark:text-zinc-300">Real-time Validation:</span>Validates if the sofa is placed at distance for extreme HD immersion without visible pixels.</li>
                        </ul>
                      </div>
                    </div>
                  );
                default: 
                  return (
                    <div className="space-y-1.5 text-zinc-600 dark:text-zinc-300">
                      <p>Manual adjustment of all layouts in millimeters. Unrestricted custom design.</p>
                      <div className="border-t border-dashed border-zinc-200 dark:border-zinc-800 pt-1.5 mt-1.5 text-[9px] text-zinc-500 dark:text-zinc-400 space-y-1">
                        <div className="font-bold text-zinc-700 dark:text-zinc-300">🛋️ Manual Adjustment Checks:</div>
                        <ul className="list-disc pl-3.5 space-y-0.5">
                          <li><span className="font-bold text-zinc-600 dark:text-zinc-300">Free Config:</span>Use the control sliders below to change parameters freely.</li>
                          <li><span className="font-bold text-zinc-600 dark:text-zinc-300">Optimal Guide:</span>Compliance with standards is judged in real-time.</li>
                        </ul>
                      </div>
                    </div>
                  );
              }
            })()}
          </div>
        </div>

        {/* Content Mode */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-[#DEE2E6] dark:border-zinc-800 p-4 space-y-3">
          <div className="text-[10px] font-bold text-[#95A5A6] dark:text-zinc-400 uppercase tracking-wider block">Content Mode</div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onUpdateState({ contentMode: 'movie' })}
              className={`py-1.5 rounded text-[10px] font-bold transition-all flex flex-col items-center justify-center gap-1 ${
                state.contentMode === 'movie' 
                ? 'bg-[#1E3A8A] text-white shadow-sm ring-2 ring-blue-500/20' 
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              <div className={`w-1.5 h-1.5 rounded-full ${state.contentMode === 'movie' ? 'bg-blue-300' : 'bg-zinc-400'}`} />
              {t('contentMovie')}
            </button>
            <button
              onClick={() => onUpdateState({ contentMode: 'live' })}
              className={`py-1.5 rounded text-[10px] font-bold transition-all flex flex-col items-center justify-center gap-1 ${
                state.contentMode === 'live' 
                ? 'bg-[#581C87] text-white shadow-sm ring-2 ring-purple-500/20' 
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-[#E9ECEF] dark:hover:bg-zinc-700'
              }`}
            >
              <div className={`w-1.5 h-1.5 rounded-full ${state.contentMode === 'live' ? 'bg-purple-300' : 'bg-zinc-400'}`} />
              {t('contentLive')}
            </button>
            <button
              onClick={() => onUpdateState({ contentMode: 'sports' })}
              className={`py-1.5 rounded text-[10px] font-bold transition-all flex flex-col items-center justify-center gap-1 ${
                state.contentMode === 'sports' 
                ? 'bg-[#064E3B] text-white shadow-sm ring-2 ring-emerald-500/20' 
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              <div className={`w-1.5 h-1.5 rounded-full ${state.contentMode === 'sports' ? 'bg-emerald-300' : 'bg-zinc-400'}`} />
              {t('contentSports')}
            </button>
            <button
              onClick={() => onUpdateState({ contentMode: 'game' })}
              className={`py-1.5 rounded text-[10px] font-bold transition-all flex flex-col items-center justify-center gap-1 ${
                state.contentMode === 'game' 
                ? 'bg-[#9F1239] text-white shadow-sm ring-2 ring-rose-500/20' 
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-[#E9ECEF] dark:hover:bg-zinc-700'
              }`}
            >
              <div className={`w-1.5 h-1.5 rounded-full ${state.contentMode === 'game' ? 'bg-rose-300' : 'bg-zinc-400'}`} />
              {t('contentGame')}
            </button>
            <button
              onClick={() => onUpdateState({ contentMode: 'off' })}
              className={`col-span-2 py-1.5 rounded text-[10px] font-bold transition-all flex items-center justify-center gap-1.5 ${
                state.contentMode === 'off' 
                ? 'bg-zinc-700 dark:bg-zinc-200 text-white dark:text-zinc-900 shadow-sm ring-2 ring-zinc-500/20' 
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-[#95A5A6] hover:bg-[#E9ECEF] dark:hover:bg-zinc-700'
              }`}
            >
              <div className={`w-1.5 h-1.5 rounded-full ${state.contentMode === 'off' ? 'bg-zinc-300' : 'bg-zinc-500'}`} />
              Lights Out / Projector Off
            </button>
          </div>
        </div>

        {/* 機材アフィリエイト提案 */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-[#DEE2E6] dark:border-zinc-800 overflow-hidden mb-6">
          <div className="p-4 bg-gradient-to-br from-zinc-50 to-white dark:from-zinc-900 dark:to-zinc-800">
            <div className="flex items-center gap-2 mb-3">
               <div className="w-6 h-6 rounded-md bg-orange-50 dark:bg-orange-950/40 flex items-center justify-center">
                  <ShoppingCart className="w-3.5 h-3.5 text-[#FF9900]" />
               </div>
               <div>
                  <h4 className="text-[10px] font-bold text-black dark:text-zinc-100 uppercase tracking-widest leading-none">
                    {lang === 'en' ? 'Required Gear & Parts' : '必要機材・周辺パーツを用意する'}
                  </h4>
                  <div className="text-[8px] text-[#95A5A6] font-medium mt-0.5">
                    {lang === 'en' ? 'Items and materials matching configured simulation' : '現在のシミュレーション設定に合わせたおすすめ機材です'}
                  </div>
               </div>
            </div>

            <div className="space-y-2.5">
              {/* Projector */}
              <a href={getAmazonSearchUrl(`${projector.brand} ${projector.name}`)} target="_blank" rel="noopener noreferrer sponsored" className="flex items-center justify-between p-2.5 rounded-lg border border-[#E9ECEF] dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-[#FF9900] transition-colors group shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-[#F8F9FA] dark:bg-zinc-900 flex items-center justify-center p-1 border border-[#DEE2E6] dark:border-zinc-700">
                    <img src={projector.imageUrl} alt={projector.name} className="max-w-full max-h-full object-contain mix-blend-multiply dark:mix-blend-normal rounded-sm" />
                  </div>
                  <div>
                    <div className="text-[8px] font-bold text-[#95A5A6] uppercase">{lang === 'en' ? 'Projector' : 'プロジェクター（本体）'}</div>
                    <div className="text-xs font-bold text-[#2D3436] dark:text-zinc-100 group-hover:text-[#FF9900] transition-colors">{projector.brand} {projector.name}</div>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-[#95A5A6] group-hover:text-[#FF9900]" />
              </a>

              {/* Screen */}
              <a href={getAmazonSearchUrl(lang === 'en' ? `Projector Screen ${screenSizeInch} inch` : `プロジェクタースクリーン ${screenSizeInch}インチ`)} target="_blank" rel="noopener noreferrer sponsored" className="flex items-center justify-between p-2.5 rounded-lg border border-[#E9ECEF] dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-[#FF9900] transition-colors group shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-[#F8F9FA] dark:bg-zinc-900 flex items-center justify-center text-lg border border-[#DEE2E6] dark:border-zinc-700">
                    📺
                  </div>
                  <div>
                    <div className="text-[8px] font-bold text-[#95A5A6] uppercase">{lang === 'en' ? 'Screen (Calculated)' : '投写スクリーン（想定サイズ）'}</div>
                    <div className="text-xs font-bold text-[#2D3436] dark:text-zinc-100 group-hover:text-[#FF9900] transition-colors">{screenSizeInch}{lang === 'en' ? ' inch 16:9 Screen' : 'インチ 16:9 スクリーン'}</div>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-[#95A5A6] group-hover:text-[#FF9900]" />
              </a>

              {/* Install Mount */}
              <a href={getAmazonSearchUrl(projectorPos.y > 1500 ? (lang === 'en' ? 'Projector Ceiling Mount' : 'プロジェクター 天吊り金具 天井') : (lang === 'en' ? 'Projector Stand Floor' : 'プロジェクター スタンド 床置き'))} target="_blank" rel="noopener noreferrer sponsored" className="flex items-center justify-between p-2.5 rounded-lg border border-[#E9ECEF] dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-[#FF9900] transition-colors group shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-[#F8F9FA] dark:bg-zinc-900 flex items-center justify-center text-lg border border-[#DEE2E6] dark:border-zinc-700">
                    🛠️
                  </div>
                  <div>
                    <div className="text-[8px] font-bold text-[#95A5A6] uppercase">{lang === 'en' ? 'Installation' : '金具・設置マウント'}</div>
                    <div className="text-xs font-bold text-[#2D3436] dark:text-zinc-100 group-hover:text-[#FF9900] transition-colors">
                      {projectorPos.y > 1500 ? (lang === 'en' ? 'Ceiling Mount Bracket' : '天吊りブラケット') : (lang === 'en' ? 'Floor/Table Stand' : '床置き/テーブル用スタンド')}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-[#95A5A6] group-hover:text-[#FF9900]" />
              </a>

              {/* Cabling */}
              <a href={getAmazonSearchUrl(lang === 'en' ? 'HDMI 2.1 long cable' : 'HDMI 2.1 ロングケーブル')} target="_blank" rel="noopener noreferrer sponsored" className="flex items-center justify-between p-2.5 rounded-lg border border-[#E9ECEF] dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-[#FF9900] transition-colors group shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-[#F8F9FA] dark:bg-zinc-900 flex items-center justify-center text-lg border border-[#DEE2E6] dark:border-zinc-700">
                    🔌
                  </div>
                  <div>
                    <div className="text-[8px] font-bold text-[#95A5A6] uppercase">{lang === 'en' ? 'Cabling' : '配線'}</div>
                    <div className="text-xs font-bold text-[#2D3436] dark:text-zinc-100 group-hover:text-[#FF9900] transition-colors">
                      {lang === 'en' ? `HDMI 2.1 Cable (~${Math.max(3, Math.ceil(projectorPos.z / 1000) + 1)}m)` : `HDMI2.1対応ケーブル（目安 ${Math.max(3, Math.ceil(projectorPos.z / 1000) + 1)}m）`}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-[#95A5A6] group-hover:text-[#FF9900]" />
              </a>
            </div>

            <p className="text-[8px] text-[#95A5A6] leading-relaxed mt-3 pt-2 border-t border-dashed border-[#E9ECEF] dark:border-zinc-800">
              {lang === 'en'
                ? '※ This page contains promotional/affiliate links (Amazon Associates). As an Amazon Associate, we earn from qualifying purchases.'
                : '※本ページはAmazonアソシエイト・プログラムのPRリンクを含みます。適格販売により収入を得ています。'}
            </p>
          </div>
        </div>

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
