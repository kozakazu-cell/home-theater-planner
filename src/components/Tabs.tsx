import React from 'react';
import { Info } from 'lucide-react';
import type { Language } from '../i18n';
import theaterSimPreview from '../assets/images/theater_sim_1779367933547.png';

export const HomeTab = ({ lang, onStart }: { lang: Language, onStart: () => void }) => {
  return (
    <main className="flex-1 overflow-y-auto bg-[#F8F9FA] dark:bg-zinc-950 p-6 sm:p-12">
      <div className="max-w-4xl mx-auto flex flex-col items-center">
        <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-zinc-900 dark:text-zinc-100 text-center">
          {lang === 'en' ? 'Plan Your Perfect Home Theater' : '理想のホームシアターを計画しよう'}
        </h2>
        <p className="text-zinc-500 dark:text-zinc-400 mb-8 text-center max-w-2xl text-lg">
          {lang === 'en'
            ? 'Easily simulate projector placement, optimal viewing distance, and screen size in 2D and 3D. Find the perfect gear tailored for your room.'
            : <>プロジェクターの配置、最適な視聴距離、スクリーンサイズを2Dと3Dで簡単にシミュレーション。<br />あなたの部屋に合ったプロジェクターを見つけましょう。</>}
        </p>

        <img src={theaterSimPreview} alt="Simulation Preview" className="w-full max-w-2xl rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-800 mb-10 object-cover" />

        <div className="grid sm:grid-cols-3 gap-6 w-full mb-12">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
            </div>
            <h3 className="font-bold text-zinc-900 dark:text-zinc-100 mb-2">{lang === 'en' ? 'Projector Compatibility' : 'プロジェクターの適合性'}</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">{lang === 'en' ? 'Check if the projector fits your room dimensions' : '選んだプロジェクターが実際の部屋のサイズに収まるか確認できます。'}</p>
          </div>
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
            </div>
            <h3 className="font-bold text-zinc-900 dark:text-zinc-100 mb-2">{lang === 'en' ? 'Optimal Distance' : '最適な視聴距離'}</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">{lang === 'en' ? 'Find the ideal seating position based on THX/SMPTE standards.' : 'THXやSMPTEなどの基準に基づき、最も没入感のある距離を導き出します。'}</p>
          </div>
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" /></svg>
            </div>
            <h3 className="font-bold text-zinc-900 dark:text-zinc-100 mb-2">{lang === 'en' ? '3D Visualization' : '3Dによる視覚化'}</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">{lang === 'en' ? 'Explore your planned layout in a fully interactive 3D space.' : '直感的な3D空間で、予定しているレイアウトをあらゆる角度から確認できます。'}</p>
          </div>
        </div>

        <button 
          onClick={onStart}
          className="px-8 py-4 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold rounded-lg text-lg hover:scale-105 transition-transform shadow-xl"
        >
          {lang === 'en' ? 'Start Simulation' : 'シミュレーションを始める'}
        </button>
      </div>
    </main>
  );
};
