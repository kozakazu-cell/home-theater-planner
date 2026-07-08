import React, { useRef, useState, useEffect, useLayoutEffect } from 'react';
import { useGesture } from '@use-gesture/react';
import { TheaterState, getScreenSizeMm } from '../types/theater';
import { getInstallationFit } from '../utils/theaterFit';
import { DimensionLine } from './DimensionLine';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';
import { useI18n } from '../i18n';

interface TheaterCanvasProps {
  view: 'top' | 'front' | 'side';
  state: TheaterState;
  onUpdateState: (state: Partial<TheaterState>) => void;
  isDarkMode?: boolean;
}

export function TheaterCanvas({ view, state, onUpdateState, isDarkMode = false }: TheaterCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isInitialized, setIsInitialized] = useState(false);
  const { t, lang } = useI18n();
  
  const { room, projector, projectorPos, screenSizeInch } = state;
  const screenSz = getScreenSizeMm(screenSizeInch);
  
  // Calculate bounding box based on view
  let viewWidth = 0;
  let viewHeight = 0;
  if (view === 'top') { viewWidth = room.width; viewHeight = room.depth; }
  else if (view === 'front') { viewWidth = room.width; viewHeight = room.height; }
  else if (view === 'side') { viewWidth = room.depth; viewHeight = room.height; }

  // Font and marker scaling based on view bounds (approx 2.5% of the shorter dimension)
  const baseDim = Math.min(viewWidth, viewHeight);
  const fontSizeMm = Math.max(baseDim * 0.025, 40); 
  const strokeWidth = Math.max(baseDim * 0.005, 10);

  useEffect(() => {
    if (!containerRef.current) return;
    
    const updateSize = () => {
      const { clientWidth, clientHeight } = containerRef.current!;
      if (clientWidth === 0 || clientHeight === 0) return;
      
      const scaleX = clientWidth / viewWidth;
      const scaleY = clientHeight / viewHeight;
      const scale = Math.min(scaleX, scaleY) * 0.75; // 75% to leave margin
      
      const x = (clientWidth - viewWidth * scale) / 2;
      const y = (clientHeight - viewHeight * scale) / 2;
      
      setTransform({ x, y, scale });
      setIsInitialized(true);
    };

    // Delay slighty to wait for flex layout to settle
    const timer = setTimeout(updateSize, 50);
    const ro = new ResizeObserver(() => {
      // Re-center on resize if we haven't manually panned much
      updateSize();
    });
    
    ro.observe(containerRef.current);
    
    return () => {
      clearTimeout(timer);
      ro.disconnect();
    };
  }, [view, viewWidth, viewHeight]);

  useGesture({
    onDrag: ({ offset: [dx, dy] }) => {
      setTransform(t => ({ ...t, x: dx, y: dy }));
    },
    onPinch: ({ offset: [d] }) => {
      setTransform(t => ({ ...t, scale: Math.max(0.01, d / 1000) }));
    },
    onWheel: ({ delta: [, dy], ctrlKey }) => {
      if (ctrlKey) {
        setTransform(t => ({ ...t, scale: Math.max(0.01, t.scale - dy * 0.001) }));
      } else {
        setTransform(t => ({ ...t, x: t.x, y: t.y - dy }));
      }
    }
  }, {
    target: containerRef,
    drag: { from: () => [transform.x, transform.y] },
    pinch: { from: () => [transform.scale * 1000, 0] },
    eventOptions: { passive: false }
  });

  // Converters from 3D to 2D
  const get2D = (v: {x: number, y: number, z: number}) => {
    if (view === 'top') return { x: v.x, y: v.z }; // Screen is at top
    if (view === 'front') return { x: v.x, y: room.height - v.y };
    // side view
    return { x: v.z, y: room.height - v.y }; 
  };

  const get2DSize = (s: {w: number, h: number, d: number}) => {
    if (view === 'top') return { w: s.w, h: s.d };
    if (view === 'front') return { w: s.w, h: s.h };
    return { w: s.d, h: s.h };
  }

  const { isInstallationValid } = getInstallationFit(room, projector, screenSz.w, projectorPos.z);
  const currentThrowDist = projectorPos.z;

  const p2d = get2D(projectorPos);
  const pSz2d = get2DSize(projector.size);

  // Add margin to prevent objects stroke overlapping with room border
  const marginStr = strokeWidth;
  const screenThickness = 50;

  // Screen is on front wall (z=0 + margin), centered horizontally
  const screenPos = { 
    x: room.width / 2, 
    y: Math.max(state.screenBottomY, marginStr) + screenSz.h / 2, 
    z: screenThickness / 2 + marginStr 
  };
  const s2d = get2D(screenPos);
  const sSz2d = get2DSize({ w: screenSz.w, h: screenSz.h, d: screenThickness }); // Screen thickness

  const getConePath = () => {
    let px = p2d.x;
    let py = p2d.y;
    
    if (projector.type === 'UST') {
      if (view !== 'top') {
        py = p2d.y - pSz2d.h / 2;
      }
    } else {
      if (view === 'top') {
        py = p2d.y - pSz2d.h / 2;
      } else if (view === 'side') {
        px = p2d.x - pSz2d.w / 2;
      }
    }

    if (view === 'top') {
      return `M ${px} ${py} L ${s2d.x - sSz2d.w/2} ${s2d.y} L ${s2d.x + sSz2d.w/2} ${s2d.y} Z`;
    } else if (view === 'side') {
      return `M ${px} ${py} L ${s2d.x} ${s2d.y - sSz2d.h/2} L ${s2d.x} ${s2d.y + sSz2d.h/2} Z`;
    } else { // front
      return `M ${px} ${py} L ${s2d.x - sSz2d.w/2} ${s2d.y - sSz2d.h/2} L ${s2d.x + sSz2d.w/2} ${s2d.y - sSz2d.h/2} Z M ${px} ${py} L ${s2d.x + sSz2d.w/2} ${s2d.y - sSz2d.h/2} L ${s2d.x + sSz2d.w/2} ${s2d.y + sSz2d.h/2} Z M ${px} ${py} L ${s2d.x + sSz2d.w/2} ${s2d.y + sSz2d.h/2} L ${s2d.x - sSz2d.w/2} ${s2d.y + sSz2d.h/2} Z M ${px} ${py} L ${s2d.x - sSz2d.w/2} ${s2d.y + sSz2d.h/2} L ${s2d.x - sSz2d.w/2} ${s2d.y - sSz2d.h/2} Z`;
    }
  };

  const sofaPos = { x: state.audiencePos.x, y: marginStr, z: state.audiencePos.z };
  const sofaSz = state.audienceSize || { w: 1800, h: 800, d: 900 }; 
  const seatH = 400; 
  const sofa2d = get2D(sofaPos);

  const headRadius = 120;
  // Calculate viewer eye Z-coordinate purely in the logical space (excluding marginStr logic for pure distance).
  // sofaSz.d/8 is the offset from the center of the sofa.
  const viewerEyeZLogical = state.audiencePos.z - sofaSz.d / 8 - headRadius;
  const screenSurfaceZLogical = screenThickness;

  const viewerEyeZ = sofaPos.z - sofaSz.d / 8 - headRadius;
  const screenSurfaceZ = screenPos.z;

  // Set up viewing distance and sofa
  let minOptimalDist = 0;
  let maxOptimalDist = 0;
  if (state.viewingMode === 'living') {
    minOptimalDist = screenSz.w * 1.5;
    maxOptimalDist = screenSz.w * 2.0; // SMPTE says roughly 2x width
  } else if (state.viewingMode === 'general4k') {
    minOptimalDist = state.screenSizeInch * 25.4 * 1.0;
    maxOptimalDist = state.screenSizeInch * 25.4 * 1.5;
  } else if (state.viewingMode === 'general1080p') {
    minOptimalDist = state.screenSizeInch * 25.4 * 2.0;
    maxOptimalDist = state.screenSizeInch * 25.4 * 3.0;
  } else {
    // cinema (THX)
    minOptimalDist = screenSz.w * 1.1; 
    maxOptimalDist = screenSz.w * 1.5; // THX is usually 1.2x, up to 1.5x
  }
  const viewDistValue = Math.max(0, viewerEyeZLogical - screenSurfaceZLogical);
  const currentViewDist = viewDistValue;
  const isViewDistOptimal = viewDistValue >= minOptimalDist && viewDistValue <= maxOptimalDist;

  type LayerElement = 'screen' | 'sofa' | 'projector';

  const depths: Record<LayerElement, number> = {
    screen: view === 'top' ? state.screenBottomY + screenSz.h/2 : view === 'front' ? 0 : room.width/2,
    sofa: view === 'top' ? 400 : view === 'front' ? sofaPos.z : sofaPos.x,
    projector: view === 'top' ? projectorPos.y : view === 'front' ? projectorPos.z : projectorPos.x,
  };

  const getObjBox = (id: LayerElement) => {
    if (id === 'screen') return { left: s2d.x - sSz2d.w/2, right: s2d.x + sSz2d.w/2, top: s2d.y - sSz2d.h/2, bottom: s2d.y + sSz2d.h/2 };
    if (id === 'projector') return { left: p2d.x - pSz2d.w/2, right: p2d.x + pSz2d.w/2, top: p2d.y - pSz2d.h/2, bottom: p2d.y + pSz2d.h/2 };
    if (id === 'sofa') {
      if (view === 'top') return { left: sofa2d.x - sofaSz.w/2, right: sofa2d.x + sofaSz.w/2, top: sofa2d.y - sofaSz.d/2, bottom: sofa2d.y + sofaSz.d/2 };
      if (view === 'front') return { left: sofa2d.x - sofaSz.w/2, right: sofa2d.x + sofaSz.w/2, top: sofa2d.y - sofaSz.h, bottom: sofa2d.y };
      return { left: sofa2d.x - sofaSz.d/2, right: sofa2d.x + sofaSz.d/2, top: sofa2d.y - sofaSz.h, bottom: sofa2d.y };
    }
    return { left: 0, right: 0, top: 0, bottom: 0 };
  };

  const overlaps = (a: any, b: any) => !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom);

  const elements: LayerElement[] = ['screen', 'sofa', 'projector'];
  const sortedElements = [...elements].sort((a, b) => depths[a] - depths[b]);

  const needsWireframe: Record<LayerElement, boolean> = { screen: false, sofa: false, projector: false };
  for (let i = 0; i < sortedElements.length; i++) {
    for (let j = i + 1; j < sortedElements.length; j++) {
      const lower = sortedElements[i];
      const higher = sortedElements[j];
      if (overlaps(getObjBox(lower), getObjBox(higher))) {
        needsWireframe[lower] = true;
      }
    }
  }

  const renderScreen = (isWireframe: boolean = false) => {
    const dash = isWireframe ? `${strokeWidth * 1.5} ${strokeWidth * 1.5}` : undefined;
    const opacity = isWireframe ? 0.7 : 1;
    const getScreenColor = () => {
      if (isWireframe) return 'none';
      if (state.contentMode === 'live') return isDarkMode ? '#831843' : '#FBCFE8'; // Pinkish for live
      if (state.contentMode === 'sports') return isDarkMode ? '#064e3b' : '#BBF7D0'; // Greenish for sports
      if (state.contentMode === 'game') return isDarkMode ? '#881337' : '#FFE4E6'; // Redish/rose for game
      return isDarkMode ? '#1e3a8a' : '#DBEAFE'; // Blueish for movie
    };

    const getScreenStroke = () => {
      if (state.contentMode === 'live') return '#DB2777';
      if (state.contentMode === 'sports') return '#16A34A';
      if (state.contentMode === 'game') return '#E11D48';
      return isDarkMode ? '#60A5FA' : '#3B82F6';
    };

    return (
      <g strokeDasharray={dash} opacity={opacity}>
        <rect 
          x={s2d.x - sSz2d.w / 2} 
          y={s2d.y - sSz2d.h / 2} 
          width={sSz2d.w} 
          height={sSz2d.h} 
          fill={getScreenColor()} 
          stroke={getScreenStroke()} 
          strokeWidth={strokeWidth} 
          vectorEffect="non-scaling-stroke" 
        />
        {view === 'front' && !isWireframe ? (
          <>
            <text x={s2d.x} y={s2d.y - fontSizeMm * 0.5} dominantBaseline="middle" textAnchor="middle" fontSize={fontSizeMm * 1.5} fill={isDarkMode ? "#93C5FD" : "#1E40AF"} className="font-bold opacity-80 select-none">
              {screenSizeInch}&#34; {lang === 'en' ? 'SCREEN' : 'スクリーン'}
            </text>
            <text x={s2d.x} y={s2d.y + fontSizeMm * 1.2} dominantBaseline="middle" textAnchor="middle" fontSize={fontSizeMm * 0.9} fill={isDarkMode ? "#93C5FD" : "#1E40AF"} className="font-mono font-bold opacity-80 select-none">
              {lang === 'en' ? 'W' : '幅'}:{Math.round(screenSz.w)}mm × {lang === 'en' ? 'H' : '高さ'}:{Math.round(screenSz.h)}mm
            </text>
            <DimensionLine 
              x1={s2d.x - sSz2d.w / 2} y1={s2d.y - sSz2d.h / 2} 
              x2={s2d.x + sSz2d.w / 2} y2={s2d.y - sSz2d.h / 2} 
              label={`${Math.round(screenSz.w)} mm`} 
              offset={-(fontSizeMm * 3)} 
              color={isDarkMode ? "#60A5FA" : "#3B82F6"} 
              fontSize={fontSizeMm * 0.8}
              strokeWidth={strokeWidth / 2}
            />
            <DimensionLine 
              x1={s2d.x + sSz2d.w / 2} y1={s2d.y - sSz2d.h / 2} 
              x2={s2d.x + sSz2d.w / 2} y2={s2d.y + sSz2d.h / 2} 
              label={`${Math.round(screenSz.h)} mm`} 
              offset={-(fontSizeMm * 3)} 
              color={isDarkMode ? "#60A5FA" : "#3B82F6"} 
              fontSize={fontSizeMm * 0.8}
              strokeWidth={strokeWidth / 2}
            />
          </>
        ) : null}
      </g>
    );
  };

  const renderSofa = (isWireframe: boolean = false) => {
    if (!state.showViewer) return null;
    const dash = isWireframe ? `${strokeWidth * 1.5} ${strokeWidth * 1.5}` : undefined;
    const f1 = isWireframe ? 'none' : (isDarkMode ? '#27272a' : '#F8F9FA');
    const f2 = isWireframe ? 'none' : (isDarkMode ? '#18181b' : '#E9ECEF');
    const f3 = isWireframe ? 'none' : (isDarkMode ? '#fda4af' : '#FFE4E6');
    const strokeColor = isDarkMode ? '#52525b' : '#DEE2E6';
    const borderHeadColor = isDarkMode ? '#f43f5e' : '#FDA4AF';
    const opacity = isWireframe ? 0.7 : 1;
    const sw = strokeWidth;
    
    if (view === 'top') {
      return (
        <g strokeDasharray={dash} opacity={opacity}>
          <rect x={sofa2d.x - sofaSz.w/2} y={sofa2d.y - sofaSz.d/2} width={sofaSz.w} height={sofaSz.d} fill={f1} stroke={strokeColor} strokeWidth={sw} rx={sofaSz.w * 0.05} />
          <rect x={sofa2d.x - sofaSz.w/2} y={sofa2d.y + sofaSz.d/6} width={sofaSz.w} height={sofaSz.d/3} fill={f2} stroke={strokeColor} strokeWidth={sw} rx={sofaSz.w * 0.02} />
          <circle cx={sofa2d.x} cy={sofa2d.y - sofaSz.d/8} r={150} fill={f3} stroke={borderHeadColor} strokeWidth={sw} />
        </g>
      );
    }
    if (view === 'front') {
      return (
        <g strokeDasharray={dash} opacity={opacity}>
          <circle cx={sofa2d.x} cy={sofa2d.y - sofaSz.h + 50} r={120} fill={f3} stroke={borderHeadColor} strokeWidth={sw} />
          <rect x={sofa2d.x - sofaSz.w/2} y={sofa2d.y - sofaSz.h} width={sofaSz.w} height={sofaSz.h} fill={f2} stroke={strokeColor} strokeWidth={sw} rx={sofaSz.w * 0.05} />
        </g>
      );
    }
    // side view
    return (
      <g strokeDasharray={dash} opacity={opacity}>
        <rect x={sofa2d.x - sofaSz.d/2} y={sofa2d.y - seatH} width={sofaSz.d} height={seatH} fill={f1} stroke={strokeColor} strokeWidth={sw} />
        <rect x={sofa2d.x + sofaSz.d/6} y={sofa2d.y - sofaSz.h} width={sofaSz.d/3} height={sofaSz.h} fill={f2} stroke={strokeColor} strokeWidth={sw} rx={sofaSz.d * 0.05} />
        <path d={`M ${sofa2d.x - sofaSz.d/8} ${sofa2d.y - sofaSz.h + 80} L ${sofa2d.x - sofaSz.d/8 + 20} ${sofa2d.y - seatH + 40} L ${sofa2d.x - sofaSz.d/2 + 80} ${sofa2d.y - seatH + 40}`} fill="none" stroke={isDarkMode ? "#fda4af" : "#FFE4E6"} strokeWidth={sw * 6} strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={sofa2d.x - sofaSz.d/8} cy={sofa2d.y - sofaSz.h + 80} r={120} fill={f3} stroke={borderHeadColor} strokeWidth={sw} />
      </g>
    );
  };

  const renderProjector = (isWireframe: boolean = false) => {
    const dash = isWireframe ? `${strokeWidth * 1.5} ${strokeWidth * 1.5}` : undefined;
    const f = isWireframe ? 'none' : (isDarkMode ? '#064e3b' : '#DCFCE7');
    const borderC = isDarkMode ? '#34d399' : '#10B981';
    const opacity = isWireframe ? 0.7 : 1;
    // Round, ceiling-light-style bodies (e.g. Aladdin X series) are circular
    // only when viewed down their axis (top view); front/side stay rectangular.
    const isRoundFromTop = projector.bodyShape === 'cylinder' && view === 'top';

    return (
      <rect
        x={p2d.x - pSz2d.w / 2}
        y={p2d.y - pSz2d.h / 2}
        width={pSz2d.w}
        height={pSz2d.h}
        fill={f}
        stroke={borderC}
        strokeWidth={strokeWidth}
        strokeDasharray={dash}
        opacity={opacity}
        rx={isRoundFromTop ? Math.min(pSz2d.w, pSz2d.h) / 2 : (view === 'top' ? pSz2d.w * 0.1 : 0)}
        className={isWireframe ? "pointer-events-none" : "cursor-move"}
        vectorEffect="non-scaling-stroke" 
      >
        {!isWireframe && <title>{projector.name}</title>}
      </rect>
    );
  };

  const renderFns: Record<LayerElement, (w?: boolean) => React.ReactNode> = {
    screen: renderScreen,
    sofa: renderSofa,
    projector: renderProjector
  };

  if (!isInitialized) {
    return <div ref={containerRef} className="w-full h-full bg-[#DEE2E6] dark:bg-zinc-950 animate-pulse" />;
  }

  return (
    <div ref={containerRef} className={cn("w-full h-full overflow-hidden relative touch-none select-none", isDarkMode ? "bg-zinc-950" : "bg-[#DEE2E6]")}>
      <motion.div 
        style={{ 
          x: transform.x, 
          y: transform.y, 
          scale: transform.scale, 
          transformOrigin: '0 0' 
        }} 
        className="absolute top-0 left-0"
      >
        <svg 
          width={viewWidth} 
          height={viewHeight} 
          viewBox={`0 0 ${viewWidth} ${viewHeight}`}
          className="overflow-visible"
        >
          <defs>
            <marker id="arrow-start" markerWidth={12} markerHeight={12} refX={0} refY={6} orient="auto-start-reverse" markerUnits="userSpaceOnUse">
              <path d="M 12 0 L 0 6 L 12 12 z" fill={isDarkMode ? "#a1a1aa" : "#95A5A6"} />
            </marker>
            <marker id="arrow-end" markerWidth={12} markerHeight={12} refX={12} refY={6} orient="auto" markerUnits="userSpaceOnUse">
              <path d="M 0 0 L 12 6 L 0 12 z" fill={isDarkMode ? "#a1a1aa" : "#95A5A6"} />
            </marker>
            <filter id="solid-bg" x="-10%" y="-10%" width="120%" height="120%">
              <feFlood floodColor={isDarkMode ? "#18181b" : "#F8F9FA"} />
              <feComposite in="SourceGraphic" in2="flood" operator="over" />
            </filter>
            <linearGradient id="cone-alpha-valid" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity={isDarkMode ? 0.65 : 0.3} />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity={isDarkMode ? 0.18 : 0.05} />
            </linearGradient>
            <linearGradient id="cone-alpha-invalid" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="#EF4444" stopOpacity={isDarkMode ? 0.65 : 0.3} />
              <stop offset="100%" stopColor="#EF4444" stopOpacity={isDarkMode ? 0.18 : 0.05} />
            </linearGradient>
          </defs>

          {/* Room Boundary */}
          <rect x={0} y={0} width={viewWidth} height={viewHeight} fill={isDarkMode ? "#09090b" : "#FDFDFD"} stroke={isDarkMode ? "#52525b" : "#2D3436"} strokeWidth={strokeWidth} vectorEffect="non-scaling-stroke" />

          {/* 3D Camera Viewpoint Visualization */}
          {view === 'top' && state.cameraState && (
            <g opacity={0.6}>
              {(() => {
                const camX = (state.cameraState.position[0] + room.width / 2000) * 1000;
                const camZ = state.cameraState.position[2] * 1000;
                const targetX = (state.cameraState.target[0] + room.width / 2000) * 1000;
                const targetZ = state.cameraState.target[2] * 1000;
                
                // Direction vector
                const dx = targetX - camX;
                const dz = targetZ - camZ;
                const angle = Math.atan2(dz, dx) * 180 / Math.PI;
                
                return (
                  <g>
                    {/* View Cone */}
                    <path 
                      d={`M ${camX} ${camZ} l 400 -600 a 800 800 0 0 0 -800 0 z`} 
                      fill="#8B5CF6" 
                      opacity={0.15}
                      transform={`rotate(${angle + 90} ${camX} ${camZ})`}
                    />
                    {/* Camera Line of Sight */}
                    <line 
                      x1={camX} y1={camZ} 
                      x2={targetX} y2={targetZ} 
                      stroke="#8B5CF6" 
                      strokeWidth={strokeWidth / 2} 
                      strokeDasharray={`${strokeWidth} ${strokeWidth}`}
                    />
                    {/* Camera Body */}
                    <g transform={`rotate(${angle + 90} ${camX} ${camZ})`}>
                       <rect x={camX - 60} y={camZ - 40} width={120} height={80} fill="#8B5CF6" rx={10} />
                       <circle cx={camX} cy={camZ + 20} r={25} fill="#4C1D95" />
                    </g>
                    <text 
                      x={camX} y={camZ - 80} 
                      textAnchor="middle" 
                      fontSize={fontSizeMm * 0.7} 
                      fill="#8B5CF6" 
                      className="font-bold select-none"
                    >
                      3D CAMERA
                    </text>
                  </g>
                );
              })()}
            </g>
          )}

          {/* Regular Solid Render (Z-Sorted) */}
          {sortedElements.map(el => (
            <React.Fragment key={el}>{renderFns[el]()}</React.Fragment>
          ))}

          {/* Projection Cone visualization */}
          <path 
            d={getConePath()} 
            fill={isInstallationValid ? "url(#cone-alpha-valid)" : "url(#cone-alpha-invalid)"} 
            stroke={isInstallationValid ? "#3B82F6" : "#EF4444"}
            strokeWidth={strokeWidth / 2}
            strokeDasharray={`${strokeWidth * 2} ${strokeWidth * 2}`}
            vectorEffect="non-scaling-stroke"
            style={{ mixBlendMode: isDarkMode ? 'screen' : 'multiply' }}
          />

          {/* Wireframe Overlays (for overlapped elements) */}
          {sortedElements.map(el => needsWireframe[el] ? (
            <React.Fragment key={el + '-wire'}>{renderFns[el](true)}</React.Fragment>
          ) : null)}

          {/* Dimension Lines */}
          <DimensionLine 
            x1={0} y1={viewHeight + strokeWidth * 10} 
            x2={viewWidth} y2={viewHeight + strokeWidth * 10} 
            label={`${viewWidth} mm`} 
            offset={0} 
            color={isDarkMode ? "#a1a1aa" : "#95A5A6"} 
            fontSize={fontSizeMm} 
            strokeWidth={strokeWidth / 2} 
          />
          <DimensionLine 
            x1={-strokeWidth * 10} y1={0} 
            x2={-strokeWidth * 10} y2={viewHeight} 
            label={`${viewHeight} mm`} 
            offset={0} 
            color={isDarkMode ? "#a1a1aa" : "#95A5A6"} 
            fontSize={fontSizeMm} 
            strokeWidth={strokeWidth / 2} 
          />
          
          {view === 'side' && (
             <>
               <DimensionLine 
                 x1={p2d.x} y1={p2d.y} 
                 x2={s2d.x} y2={p2d.y} 
                 label={`${t('throwDistCanvas')}: ${Math.round(Math.abs(currentThrowDist))} mm`} 
                 offset={-(fontSizeMm * 3)} 
                 color={isInstallationValid ? "#3B82F6" : "#EF4444"} 
                 fontSize={fontSizeMm}
                 strokeWidth={strokeWidth / 2}
               />
               {state.showViewer && (
                 <DimensionLine 
                   x1={s2d.x} y1={sofa2d.y - sofaSz.h - fontSizeMm * 4} 
                   x2={viewerEyeZ} y2={sofa2d.y - sofaSz.h - fontSizeMm * 4} 
                   label={lang === 'en' ? `Viewing Dist: ${Math.round(viewDistValue)} mm ${isViewDistOptimal ? '(Optimal)' : '(Adjust)'}` : `視聴距離: ${Math.round(viewDistValue)} mm ${isViewDistOptimal ? '(適正)' : '(要調整)'}`} 
                   offset={0} 
                   color="#FDA4AF" 
                   fontSize={fontSizeMm}
                   strokeWidth={strokeWidth / 2}
                 />
               )}
             </>
          )}

          {view === 'top' && state.showViewer && (
             <DimensionLine 
               x1={sofa2d.x - sofaSz.w/2} y1={sofa2d.y + sofaSz.d/2 + fontSizeMm * 2} 
               x2={sofa2d.x + sofaSz.w/2} y2={sofa2d.y + sofaSz.d/2 + fontSizeMm * 2} 
               label={lang === 'en' ? `Sofa Width ${sofaSz.w}mm` : `ソファ幅 ${sofaSz.w}mm`}
               offset={0} 
               color="#FDA4AF" 
               fontSize={fontSizeMm}
               strokeWidth={strokeWidth / 2}
             />
          )}

        </svg>
      </motion.div>
    </div>
  );
}

