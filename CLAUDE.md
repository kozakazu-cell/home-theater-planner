# home-theater-planner — Claude Development Guide

**Updated**: 2026-07-08 (Mobile UI & Links tab refinement)

---

## Project Vision

**Purpose**: Intuitive web-based projector installation simulator with Amazon Associates affiliate revenue stream.

**Target Users**: Home theater enthusiasts in Japan & English-speaking regions who want to visualize screen size, projector placement, and gear requirements in their room before purchase.

**Revenue Model**: Amazon Associates links (ID: `theatersim-22`) embedded in gear recommendation panel. PR disclosure: ✓ Compliant with FTC/JOGA guidelines.

---

## Tech Stack

```
Frontend:    Vite + React 19 + TypeScript
3D/Canvas:  Three.js + @react-three/fiber + @react-three/drei
Styling:     Tailwind CSS v4 (@tailwindcss/vite)
Animation:   Framer Motion (motion/react)
i18n:        Custom useI18n hook (ja / en)
Build:       esbuild (via Vite)
Deploy:      Netlify + GitHub auto-deploy
```

**Node**: ≥18.20.0  
**Package Manager**: npm ≥10.x

---

## Project Structure

```
home-theater-planner/
├── CLAUDE.md                # This file
├── netlify.toml             # [build] command="npm install && npm run build" / publish="dist"
├── .env.local               # VITE_AMAZON_ASSOCIATE_TAG=theatersim-22
├── package.json             # React^19, three^0.184, @react-three/fiber^9, motion^12
├── vite.config.ts           # @tailwindcss/vite, define: VITE_AMAZON_ASSOCIATE_TAG
├── tsconfig.json            # moduleResolution:bundler, allowImportingTsExtensions
├── index.html
└── src/
    ├── App.tsx              # 4 tabs: home/simulator/guide/links, ダークモード, useI18n
    ├── main.tsx             # StrictMode + I18nProvider
    ├── index.css            # Tailwind directives
    ├── i18n.tsx             # useI18n, Language enum, I18nProvider (ja/en only)
    ├── vite-env.d.ts        # VITE_AMAZON_ASSOCIATE_TAG ambient type
    ├── types/theater.ts     # Room, ProjectorModel, TheaterState, PROJECTOR_DB (17 models)
    ├── lib/utils.ts         # cn() — classname utility
    ├── components/
    │   ├── Controls.tsx      # [REDESIGNED 2026-07-07] Verdict bar, compact modes, Amazon funnel
    │   ├── TheaterCanvas.tsx # 2D orthogonal floor/side/front views, DimensionLine children
    │   ├── Theater3D.tsx     # Three.js canvas, projector/screen/room geometry, OrbitControls
    │   ├── ProjectorSelectorModal.tsx  # Dropdown + search, ローカライズ完備
    │   ├── DimensionLine.tsx # SVG dimension annotations
    │   └── Tabs.tsx          # Tab switching UI (home/simulator/guide/links)
    └── utils/
        ├── theaterFit.ts     # getInstallationFit() — shared optical fit calculation
        └── geometry.ts       # [UNUSED] calculateOrthogonalPath, generateSvgPath
```

---

## Design Decisions (2026-07-07 UI Redesign)

### Philosophy: Color is for judgment and purchase only

**Problem** (Pre-redesign): UI was scattered with multiple accent colors (blue for views, amber for modes, navy/purple/green/rose for content), making it unclear what was most important.

**Solution**:
- **Monochrome controls**: All UI elements use neutral zinc/gray
- **Two signal colors only**:
  - 🟢 **Emerald** (pass): Installation fits the room
  - 🔴 **Red** (fail): Requires adjustment
  - 🟠 **#FF9900** (Amazon): Purchase funnel CTAs

### Key Changes

#### 1. Verdict Bar (新設・常時表示)
- **Location**: Top of sidebar, sticky above scroll area
- **Content**: `✓ This setup fits your room` + screen size & projector distance summary
- **Why**: Replaces vague red-background slider feedback with explicit verdict in view priority 1
- **Behavior**: Updates in real time as user adjusts screen size or projector Z position

#### 2. Amazon Funnel — 3-Layer Promotion
- **Layer 1 (Primary)**: Gear panel promoted above Viewing Mode (previously buried below)
- **Layer 2 (Visibility)**: Each item card displays bold **orange "Amazon で見る" button** with ExternalLink icon
- **Layer 3 (Persistence)**: Sticky bottom CTA "View [Projector Model] on Amazon" — always 1 tap away
- **Disclosure**: "PR: affiliate link" text visible at all times

#### 3. Compaction
- **Viewing Mode**: Segmented control (4 buttons, 1 line) + dynamic 1-line summary (distance range only)
  - Before: 4 tall stacked buttons + 3-line prose guidance × 4 modes
  - After: Saves ~1.5KB + reduces cognitive load
  
- **Content Mode**: Chip row (5 pills, wrap) instead of 5 tall buttons
  - Before: Tall stacked buttons
  - After: Compact inline pills
  
- **Total savings**: ~9KB file size + visible vertical space

---

## Coding Conventions

### TypeScript
- **Strict mode**: ✓ enabled (`tsconfig.json`)
- **No implicit any**: ✓ enforced
- **File naming**: PascalCase for React components (e.g. `Controls.tsx`), camelCase for utils
- **Type annotations**: Required for function parameters and return types
- **Imports**: Use ESM syntax (`import`, `export`)
  - Images: `import imagePath from './image.png'` (not string literals)
  - CSS: `import './index.css'`

### React / JSX
- **Functional components only** (hooks-based)
- **Props interface**: One interface per component (or inline tuple type for small components)
- **Event handlers**: Use `onChange`, `onClick` directly (no `<form>` tags in artifacts)
- **Classnames**: Use `cn()` from `lib/utils.ts` (clsx-like utility)

### Tailwind CSS
- **Version**: v4 (core only, no plugins)
- **Invalid classes**: NEVER use (e.g. `bg-red-55`, `text-zinc-650`, `dark:bg-zinc-850`)
  - Correct equivalents: `bg-red-50`, `text-zinc-600`, `dark:bg-zinc-900`
- **Dark mode**: `dark:` prefix required; enabled via `isDarkMode` class on root
- **Custom colors**: Use standard Tailwind palette (zinc/gray/slate/stone for neutrals; emerald/red for signals)

### Localization (i18n)
- **Pattern**: Use `lang === 'en' ? '...' : '日本語'` inline (no translation files)
- **Context**: Access via `useI18n()` hook (returns `{ lang, t }`)
- **Scope**: Japanese and English only; if new languages needed, refactor to `i18n.json` + loader
- **Disclosure**: Always include PR/affiliate notices in both languages

### Comments
- **Minimal**: Only explain *why*, not *what* (code should be self-documenting)
- **Format**: `{/* Single-line JSX comment */}` or `// Line comment` for utilities
- **Section headers**: `{/* Section Name — brief description */}` to mark major logical blocks

---

## Development Workflow

### Local Setup

```bash
cd home-theater-planner
npm install
npm run dev      # Vite dev server (http://localhost:5173)
```

### Type Checking (Before Commit)

```bash
npx tsc --noEmit
```

Must pass with **zero errors** (warnings are OK).

### Building for Production

```bash
npm run build    # Generates dist/
npm run preview  # Test production build locally
```

### Git Workflow

```bash
git add src/components/Controls.tsx  # (or other files)
git commit -m "feat: description" -m "Details if needed"
git push                             # Triggers Netlify rebuild automatically
```

### Deployment

**Automatic via Netlify Git Integration:**
1. Local `git push` → GitHub `main` branch
2. Netlify detects push → runs `npm install && npm run build`
3. Publishes `dist/` → https://home-theater-planner.netlify.app (usually within 30–60 sec)

**Manual rebuild** (if needed):
- Netlify dashboard → Deploy → Trigger deploy (in UI)

**Environment Variables:**
- `VITE_AMAZON_ASSOCIATE_TAG=theatersim-22` (set in Netlify UI, not `.env.local`)
- `.env.local` is git-ignored; only for local development

---

## Important Implementation Details

### projectorPos Calculation
- **X (horizontal offset)**: User-controlled slider (0–4000mm, relative to room center)
- **Y (vertical height)**: User-controlled slider (400–2400mm from floor)
- **Z (throw distance)**: **Auto-calculated** from screen size + viewing mode
  - Formula: `screenWidth * (1.1 to 1.5)` for cinema, `screenWidth * 1.5 to 2.0` for SMPTE living, etc.
  - User cannot directly edit Z; must adjust screen size or switch viewing mode
  - This prevents impossible configurations

### isInstallationValid Logic
- **Rule 1**: Projector must be within room bounds
- **Rule 2**: Screen must fit within room bounds
- **Rule 3**: No collision between projector + screen + viewer position
- **Verdict**: Boolean flag used to:
  - Color verdict bar (emerald if ✓, red if ✗)
  - Enable/disable gear recommendation links (stay visible but may be logically invalid)

### Amazon Search URL Generation
```typescript
getAmazonSearchUrl(keyword: string) → https://www.amazon.co.jp/s?k={encodeURIComponent(keyword)}&tag=theatersim-22
```
- Always appends `tag=theatersim-22` for affiliate tracking
- Called from gear panel item cards + sticky CTA
- Works for both JP and EN (redirects based on domain)

### Projector Database (PROJECTOR_DB)
- **17 projector models** defined in `src/types/theater.ts`
- **Fields**: brand, name, lumens, contrast, keystone, throw ratio, imageUrl, supportedResolutions, hdrSupport
- **Selection**: Via ProjectorSelectorModal dropdown + search
- **Image**: Lazy-loaded from `src/assets/projectors/`; fallback to placeholder if 404

---

## Known Issues & TODOs

### Latest Updates (2026-07-08)
- ✅ **Mobile UI Improved**: Responsive layout adjustments for better scrolling on smartphones
  - Changed main layout from `md:flex-row` to `lg:flex-row` for wider mobile support
  - Reduced initial canvas height on mobile from 40vh to 35vh (sm: 40vh) to allow more scrollable control panel space
  - Changed Controls panel from `md:` breakpoint to `lg:` for consistent mobile-first layout
  - Verdict bar remains sticky at top for continuous feedback
  
- ✅ **Links Tab Reorganized**: Projectors now grouped by manufacturer
  - Brands sorted alphabetically (Anker, BenQ, Dangbei, EPSON, JMGO, XGIMI)
  - Each brand displayed as a collapsible section with proper heading
  - Improved grid layout with better card spacing
  - Added hover effects and improved visual hierarchy

### Current State (Stable)
- ✅ Type checking passes (zero errors)
- ✅ Netlify deployment works
- ✅ Dark mode fully functional
- ✅ i18n (ja/en) complete
- ✅ Affiliate links integrated with PR disclosure
- ✅ UI redesign (verdict bar, compact modes, Amazon funnel) live

### Unused Code (Safe to Delete in Future)
- `src/utils/geometry.ts` — `calculateOrthogonalPath`, `generateSvgPath` not referenced by any component
- `@google/genai` package in dependencies — defined in `vite.config.ts` but never used (future AI feature?)
- `VITE_RAKUTEN_AFFILIATE_ID` type in `vite-env.d.ts` — parsed but no component uses it yet

### Future Enhancement Ideas
- [ ] 3D room texture customization (wallpaper, flooring)
- [ ] PDF export of setup plan + BOM
- [ ] Rakuten Associates integration (parallel revenue stream)
- [ ] Room presets (bedroom, living room, HT dedicated room)
- [ ] Share/bookmark setups (localStorage or cloud)

---

## Quick Reference: Common Commands

| Task | Command |
|------|---------|
| **Dev server** | `npm run dev` |
| **Type check** | `npx tsc --noEmit` |
| **Build prod** | `npm run build` |
| **Preview prod** | `npm run preview` |
| **Format code** | (Tailwind auto-formats; use Prettier if added: `npx prettier --write src/`) |
| **Deploy** | `git push` (auto-triggers Netlify) |
| **Check deploy status** | https://app.netlify.com/sites/home-theater-planner/deploys |
| **Check Netlify live site** | https://home-theater-planner.netlify.app |

---

## GitHub MCP Setup (For Claude Desktop)

**Prerequisite**: GitHub Personal Access Token (PAT)
1. GitHub.com → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token with scopes: `repo`, `gist`
3. Copy token
4. Add to Claude Desktop config (`~/.claude/claude_desktop_config.json`):
   ```json
   {
     "mcpServers": {
       "github": {
         "command": "npx",
         "args": ["-y", "@modelcontextprotocol/server-github"],
         "env": {
           "GITHUB_PERSONAL_ACCESS_TOKEN": "YOUR_PAT_HERE"
         }
       }
     }
   }
   ```
5. Restart Claude Desktop
6. Next Claude chat: GitHub operations (clone, commit, push) work in-context

---

## Troubleshooting

### Build fails with "Cannot find module 'react'"
```bash
npm install
npm install react@19 react-dom@19 --save
```

### Netlify deployment stuck / not updating
1. Check browser cache (Ctrl+Shift+R)
2. Verify push reached GitHub: `git log --oneline -5`
3. Check Netlify dashboard for error log: https://app.netlify.com/sites/home-theater-planner/deploys
4. Manually trigger redeploy in UI if needed

### Type errors in `vite.config.ts` or `tsconfig.json`
- These are build-level config files; `npm run build` will report actual errors
- `tsc --noEmit` may not catch all of them; always run full build before commit

### Dark mode not applying
- Verify `isDarkMode` class is on root element in `App.tsx`
- Check localStorage: `localStorage.getItem('isDarkMode')` in browser console
- Tailwind v4: `dark:` prefix should work (no additional `darkMode: 'class'` config needed)

### Dev server won't start on localhost:5173
- Another process may be using the port
- Try: `npm run dev -- --port 3000` (uses port 3000 instead)
- Or kill the process: `lsof -i :5173` (Mac/Linux) or `netstat -ano | findstr :5173` (Windows)

---

## References

- **Netlify Docs**: https://docs.netlify.com
- **Tailwind CSS v4**: https://tailwindcss.com/docs/upgrade-guide
- **React 19 Docs**: https://react.dev
- **Three.js Docs**: https://threejs.org/docs
- **Vite Docs**: https://vitejs.dev
- **TypeScript Docs**: https://www.typescriptlang.org/docs

---

**Maintainer Note**: This document is the source of truth for development decisions. Update it whenever:
- Major UI/UX changes are made
- Tech stack versions change significantly
- New conventions are adopted
- Deployment workflow changes