const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// fix simulator icon
code = code.replace(/onClick=\{\(\) => setActiveTab\('simulator'\)\}([\s\S]*?)<Home className="w-4 h-4" \/>/, "onClick={() => setActiveTab('simulator')}$1<Box className=\"w-4 h-4\" />");

// fix shop -> links tab
code = code.replace(/activeTab === 'shop'/g, "activeTab === 'links'");
code = code.replace(/<ShoppingBag className="w-4 h-4" \/>\s*\{lang === 'en' \? '[^']*' : '[^']*'\}/, "<ExternalLink className=\"w-4 h-4\" />\n            {lang === 'en' ? 'Links' : 'リンク'}");

// Now we need to modify the contents of the 'links' tab (which was 'shop').
// We want to replace the whole content of `activeTab === 'links' && (...)` with a simple list of projectors.
// Wait, I can just find `activeTab === 'links' && (` and replace everything inside.
const linksTabContent = `
      {activeTab === 'links' && (
        <main className="flex-1 overflow-y-auto bg-[#F8F9FA] dark:bg-zinc-950 p-6 sm:p-12">
          <div className="max-w-4xl mx-auto space-y-12">
            <div>
              <h2 className="text-3xl font-bold mb-4 text-zinc-900 dark:text-zinc-100">{lang === 'en' ? 'Projector Links' : 'プロジェクター リンク'}</h2>
              <p className="text-zinc-500 dark:text-zinc-400 mb-8">{lang === 'en' ? 'Direct links to the projectors.' : 'プロジェクターの販売ページへのリンクです。'}</p>
              
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
                {PROJECTOR_DB.map((item, idx) => (
                  <div key={idx} className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm flex flex-col">
                    <h3 className="font-bold text-zinc-900 dark:text-zinc-100 mb-2">{item.name}</h3>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed flex-1 mb-4">
                      {item.brand} / {item.resolution} / {item.brightness}lm
                    </p>
                    <div className="flex items-center gap-2 mt-auto">
                      <a href={item.websiteUrl || \`https://www.amazon.co.jp/s?k=\${encodeURIComponent(item.name)}\`} target="_blank" rel="noopener noreferrer" className="flex-1 px-3 py-2 bg-gradient-to-b from-[#FF9900] to-[#E38800] hover:shadow-[0_4px_8px_rgba(255,153,0,0.4)] transition-all rounded text-center text-xs font-bold text-white truncate shadow-[0_2px_4px_rgba(255,153,0,0.3)]">
                        Amazonで探す
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <h3 className="font-bold text-zinc-900 dark:text-zinc-100 mb-3 flex items-center gap-2">
                <Info className="w-4 h-4 text-zinc-400" />
                {lang === 'en' ? 'Disclaimer / Affiliate Notice' : '免責事項 / アフィリエイトについて'}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                {lang === 'en' ? 'Some links utilize affiliate programs. Prices and stock may vary.' : '当ページの一部リンクはアフィリエイトプログラムを利用しています。購入者に追加料金はかかりません。'}
              </p>
            </div>
          </div>
        </main>
      )}
`;

// regex to find the activeTab === 'links' && (...)
code = code.replace(/\{activeTab === 'links' && \([\s\S]*?<\/main>\s*\)\}/, linksTabContent.trim());

fs.writeFileSync('src/App.tsx', code);
