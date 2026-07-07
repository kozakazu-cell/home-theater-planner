import React, { useMemo, useState } from 'react';
import { X, Check, AlertTriangle } from 'lucide-react';
import { ProjectorModel, PROJECTOR_DB, getScreenSizeMm, Room } from '../types/theater';
import { getInstallationFit } from '../utils/theaterFit';

import { useI18n } from '../i18n';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentProjectorId: string;
  onSelect: (p: ProjectorModel) => void;
  room: Room;
  screenSizeInch: number;
}

export function ProjectorSelectorModal({ isOpen, onClose, currentProjectorId, onSelect, room, screenSizeInch }: Props) {
  const { t, lang } = useI18n();
  const screenSz = getScreenSizeMm(screenSizeInch);
  const [filter, setFilter] = useState<'all' | 'UST' | 'Short' | 'Standard' | 'Mobile'>('all');

  const projectorsWithFit = useMemo(() => {
    return [...PROJECTOR_DB].map(p => {
      const pOffset = p.throwDistanceOffset || 0;
      // No projectorZ supplied here: these candidates haven't been positioned yet,
      // so we evaluate each at its own minimum (best-case) throw distance.
      const result = getInstallationFit(room, p, screenSz.w);
      return {
        p,
        minZ: result.minThrowDist,
        maxZ: result.maxThrowDist,
        fits: result.isWithinRoomDepth,
        margin: result.depthMargin,
        pOffset,
      };
    }).sort((a, b) => {
      // Sort by fits first
      if (a.fits && !b.fits) return -1;
      if (!a.fits && b.fits) return 1;
      return a.p.brand.localeCompare(b.p.brand);
    });
  }, [room.depth, screenSz.w]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#F1F3F5] w-full max-w-4xl h-full max-h-[85vh] rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="shrink-0 p-4 sm:px-6 sm:py-5 border-b border-[#E9ECEF] flex items-center justify-between bg-white z-10">
          <div>
            <h2 className="text-lg font-bold text-[#2D3436]">{lang === 'en' ? 'Select Projector' : 'プロジェクターを選択'}</h2>
            <p className="text-xs text-[#95A5A6] mt-1">
              {lang === 'en'
                ? `Current room size (Depth ${Math.round(room.depth / 10)}cm) and screen (${screenSizeInch}inches) are automatically judged for installability.`
                : `現在の部屋の奥行き（${Math.round(room.depth / 10)}cm）とスクリーンサイズ（${screenSizeInch}インチ）から、設置可否を自動判定しています。`}
            </p>
          </div>
          <button onClick={onClose} className="p-2 -mr-2 bg-[#F8F9FA] hover:bg-[#E9ECEF] text-[#2D3436] rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters */}
        <div className="shrink-0 px-4 sm:px-6 py-3 border-b border-[#E9ECEF] bg-white flex gap-2 overflow-x-auto scrollbar-hide shadow-sm z-10">
          {(['all', 'UST', 'Short', 'Standard', 'Mobile'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-colors ${
                filter === f 
                  ? 'bg-[#2D3436] text-white shadow-sm' 
                  : 'bg-[#F8F9FA] text-[#95A5A6] border border-[#DEE2E6] hover:bg-[#E9ECEF] hover:text-[#2D3436]'
              }`}
            >
              {f === 'all' ? (lang === 'en' ? 'All' : 'すべて') :
               f === 'UST' ? 'UST' :
               f === 'Short' ? (lang === 'en' ? 'Short Throw' : '短焦点') :
               f === 'Standard' ? (lang === 'en' ? 'Standard Throw' : '標準焦点') :
               (lang === 'en' ? 'Mobile' : 'モバイル')}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 pb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
            {projectorsWithFit.filter(x => filter === 'all' || x.p.type === filter).map(({ p, fits, margin, minZ, pOffset }) => {
              const isSelected = p.id === currentProjectorId;
              return (
                <div 
                  key={p.id} 
                  className={`bg-white rounded-xl overflow-hidden border-2 transition-all p-4 flex flex-col gap-4 relative ${
                    isSelected 
                      ? 'border-[#3B82F6] shadow-md ring-4 ring-blue-500/10' 
                      : !fits ? 'border-transparent opacity-75 grayscale-[30%]' : 'border-transparent hover:border-[#DEE2E6] hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-24 h-24 shrink-0 bg-[#F8F9FA] rounded border border-[#E9ECEF] p-2 flex items-center justify-center">
                      <img src={p.imageUrl} alt={p.name} className="max-w-full max-h-full object-contain mix-blend-multiply" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] uppercase font-bold tracking-wider text-[#95A5A6]">{p.brand}</div>
                      <h3 className="text-sm font-bold text-[#2D3436] leading-tight mt-0.5">{p.name}</h3>
                      <div className="mt-2 text-[10px] font-medium text-[#2D3436] flex flex-wrap gap-x-2 gap-y-1">
                        <span className="flex items-center gap-1 bg-[#F1F3F5] px-1.5 py-0.5 rounded text-[#495057]">{t('throwType' + p.type) || p.type}</span>
                        <span className="flex items-center gap-1 bg-[#F1F3F5] px-1.5 py-0.5 rounded text-[#495057]">{p.resolution}</span>
                        <span className="flex items-center gap-1 bg-[#F1F3F5] px-1.5 py-0.5 rounded text-[#495057]">{p.brightness}</span>
                        <span className="flex items-center gap-1 bg-[#F1F3F5] px-1.5 py-0.5 rounded text-[#495057]">{p.lightSource}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto pt-4 border-t border-[#E9ECEF] flex flex-col gap-3">
                    {/* Compatibility Badge */}
                    {fits ? (
                      <div className="flex items-start gap-2 text-xs text-[#16A34A] bg-[#DCFCE7] p-2.5 rounded-lg border border-[#BBF7D0]">
                        <Check className="w-4 h-4 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold">{lang === 'en' ? 'Installable in this room' : 'この部屋に設置できます'}</p>
                          <p className="text-[10px] opacity-80 mt-0.5">
                            {p.type === 'UST'
                              ? (lang === 'en'
                                  ? `Approx ${Math.round((p.throwRatio.min * screenSz.w) / 10)}cm from the wall`
                                  : `壁から約${Math.round((p.throwRatio.min * screenSz.w) / 10)}cm`)
                              : p.brand === 'Aladdin X'
                                ? (lang === 'en' ? `Approx ${Math.round(minZ / 10)}cm from the wall` : `壁から約${Math.round(minZ / 10)}cm`)
                                : (lang === 'en' ? `Approx ${Math.round((minZ - pOffset) / 10)}cm from the lens` : `レンズから約${Math.round((minZ - pOffset) / 10)}cm`)
                            }
                            {' '}
                            {lang === 'en' ? `(Depth margin: approx ${Math.round(margin / 10)}cm)` : `（奥行きの余裕: 約${Math.round(margin / 10)}cm）`}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-2 text-xs text-[#EF4444] bg-[#FEE2E2] p-2.5 rounded-lg border border-[#FECACA]">
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold">{lang === 'en' ? 'Insufficient depth' : '奥行きが不足しています'}</p>
                          <p className="text-[10px] opacity-80 mt-0.5">
                            {lang === 'en'
                              ? `An additional approx ${Math.round(Math.abs(margin) / 10)}cm of room depth is required.`
                              : `あと約${Math.round(Math.abs(margin) / 10)}cmの奥行きが必要です。`}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 relative z-10 mt-1">
                      <button
                        onClick={() => {
                          onSelect(p);
                          onClose();
                        }}
                        className={`flex-1 py-2.5 rounded text-xs font-bold transition-colors flex items-center justify-center gap-1 ${
                          isSelected 
                            ? 'bg-[#3B82F6] text-white hover:bg-blue-600' 
                            : 'bg-[#2D3436] text-white hover:bg-black'
                        }`}
                      >
                        {isSelected
                          ? (lang === 'en' ? 'Currently Selected' : '選択中')
                          : (lang === 'en' ? 'Simulate with this model' : 'この機種でシミュレート')}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
