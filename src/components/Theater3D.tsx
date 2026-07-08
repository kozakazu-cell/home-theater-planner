import React, { useRef, useMemo, useEffect, useCallback } from 'react';
import { Canvas, useThree, useLoader } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Stars, PerspectiveCameraProps } from '@react-three/drei';
import * as THREE from 'three';
import { TheaterState, getScreenSizeMm } from '../types/theater';
import { useI18n } from '../i18n';

import movie1 from '../assets/images/movie_scifi_1_1779020852231.png';
import movie2 from '../assets/images/movie_steampunk_2_1779020868905.png';
import movie3 from '../assets/images/movie_noir_3_1779020884589.png';
import movie4 from '../assets/images/movie_fantasy_4_1779020901698.png';
import movie5 from '../assets/images/movie_underwater_5_1779020917350.png';

import live1 from '../assets/images/live_festival_1_1779020935637.png';
import live2 from '../assets/images/live_club_2_1779020952272.png';
import live3 from '../assets/images/live_orchestra_3_1779020967375.png';
import live4 from '../assets/images/live_hologram_4_1779020988364.png';
import live5 from '../assets/images/live_jazz_5_1779021005262.png';

import sports1 from '../assets/images/sports_soccer_1_1779021025194.png';
import sports2 from '../assets/images/sports_basketball_2_1779021041774.png';
import sports3 from '../assets/images/sports_tennis_3_1779021056664.png';
import sports4 from '../assets/images/sports_racing_4_1779021074301.png';
import sports5 from '../assets/images/sports_gymnastics_5_1779021091432.png';

const ASSETS = {
  movie: [movie1, movie2, movie3, movie4, movie5],
  live: [live1, live2, live3, live4, live5],
  sports: [sports1, sports2, sports3, sports4, sports5]
};

// Only the images relevant to the currently selected content mode are loaded.
// 'game' mode reuses a curated single image from each other category rather
// than needing its own asset set.
const MODE_ASSETS: Record<string, string[]> = {
  movie: ASSETS.movie,
  live: ASSETS.live,
  sports: ASSETS.sports,
  game: [ASSETS.movie[0], ASSETS.sports[3], ASSETS.movie[3], ASSETS.live[1], ASSETS.live[3]],
};

interface Theater3DProps {
  state: TheaterState;
  onUpdateState: (state: Partial<TheaterState>) => void;
  isDarkMode?: boolean;
}

const ViewerHuman = ({ m }: { m: (v: number) => number }) => (
  <group position={[0, m(450), -m(150)]}>
    <mesh position={[0, m(250), 0]}>
      <coneGeometry args={[m(200), m(500), 16]} />
      <meshStandardMaterial color="#FDA4AF" />
    </mesh>
    <mesh position={[0, m(550), 0]}>
      <sphereGeometry args={[0.12, 16, 16]} />
      <meshStandardMaterial color="#FDA4AF" />
    </mesh>
  </group>
);

const ViewerBear = ({ m }: { m: (v: number) => number }) => (
  <group position={[0, m(400), -m(100)]}>
    <mesh position={[0, m(100), 0]}>
      <sphereGeometry args={[m(220), 16, 16]} />
      <meshStandardMaterial color="#92400E" />
    </mesh>
    <mesh position={[0, m(350), 0]}>
      <sphereGeometry args={[m(150), 16, 16]} />
      <meshStandardMaterial color="#92400E" />
    </mesh>
    <mesh position={[-m(100), m(450), 0]}>
      <sphereGeometry args={[m(60), 16, 16]} />
      <meshStandardMaterial color="#92400E" />
    </mesh>
    <mesh position={[m(100), m(450), 0]}>
      <sphereGeometry args={[m(60), 16, 16]} />
      <meshStandardMaterial color="#92400E" />
    </mesh>
  </group>
);

const ViewerHero = ({ m }: { m: (v: number) => number }) => (
  <group position={[0, m(400), -m(150)]}>
    <mesh position={[0, m(100), 0]}>
      <boxGeometry args={[m(250), m(200), m(200)]} />
      <meshStandardMaterial color="#1E40AF" />
    </mesh>
    <mesh position={[0, m(300), 0]}>
      <boxGeometry args={[m(250), m(250), m(200)]} />
      <meshStandardMaterial color="#DC2626" />
    </mesh>
    <mesh position={[0, m(500), 0]}>
      <boxGeometry args={[m(150), m(150), m(150)]} />
      <meshStandardMaterial color="#FCD34D" />
    </mesh>
    <mesh position={[0, m(600), 0]}>
      <boxGeometry args={[m(180), m(60), m(180)]} />
      <meshStandardMaterial color="#DC2626" />
    </mesh>
  </group>
);

function Scene({ state, onUpdateState, isDarkMode = false }: Theater3DProps) {
  const { room, projector, projectorPos, screenSizeInch, screenBottomY, audiencePos, audienceSize, showViewer, contentMode } = state;
  const screenSz = getScreenSizeMm(screenSizeInch);
  
  // Create a persistent index for each change to contentMode to keep it "enjoyable"
  const [assetIndex, setAssetIndex] = React.useState(0);
  useEffect(() => {
    setAssetIndex(Math.floor(Math.random() * 5));
  }, [contentMode]);

  // Only load the textures needed for the active content mode (previously all
  // 15 movie/live/sports images were loaded on every mount regardless of
  // selection, wasting bandwidth and GPU memory).
  const activeUrls = contentMode === 'off' ? [ASSETS.movie[0]] : (MODE_ASSETS[contentMode] || ASSETS.movie);
  const activeTextures = useLoader(THREE.TextureLoader, activeUrls);

  const activeTexture = useMemo(() => {
    if (contentMode === 'off') return null;
    return activeTextures[assetIndex % activeTextures.length] || activeTextures[0];
  }, [contentMode, assetIndex, activeTextures]);

  const { camera } = useThree();
  const controlsRef = useRef<any>(null);

  // Sync camera state to parent for the 2D top-view camera marker. Previously
  // this polled every animation frame (throttled to 500ms) even while idle,
  // which meant the whole app re-rendered periodically during any drag.
  // Instead we only sync when the user actually stops interacting with the
  // orbit controls, which is both cheaper and more accurate.
  const syncCameraState = useCallback(() => {
    if (!camera || !controlsRef.current) return;
    const pos = camera.position.toArray() as [number, number, number];
    const target = controlsRef.current.target.toArray() as [number, number, number];
    onUpdateState({ cameraState: { position: pos, target: target } });
  }, [camera, onUpdateState]);

  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;
    controls.addEventListener('end', syncCameraState);
    syncCameraState(); // initial sync so the 2D camera marker has a starting position
    return () => controls.removeEventListener('end', syncCameraState);
  }, [syncCameraState]);

  // Convert mm to meters
  const m = (mm: number) => mm / 1000;

  const roomW = m(room.width);
  const roomH = m(room.height);
  const roomD = m(room.depth);

  const screenW = m(screenSz.w);
  const screenH = m(screenSz.h);
  const screenY = m(screenBottomY) + screenH / 2;

  const projX = m(projectorPos.x) - roomW / 2;
  const projY = m(projectorPos.y);
  const projZ = m(projectorPos.z);
  const projSz = { w: m(projector.size.w), h: m(projector.size.h), d: m(projector.size.d) };

  const sofaX = m(audiencePos.x) - roomW / 2;
  const sofaY = m(audienceSize?.h || 800) / 2;
  const sofaZ = m(audiencePos.z);
  const sofaSz = { w: m(audienceSize?.w || 1800), h: m(audienceSize?.h || 800), d: m(audienceSize?.d || 900) };

  // Calculate projection source point (Apex) based on model type
  const { apexX, apexY, apexZ } = useMemo(() => {
    if (projector.type === 'UST') {
      return {
        apexX: projX,
        // UST light exits via a mirror raised above the case, not flush with the top
        // surface — keep a visible gap so the beam clearly emerges above the body.
        apexY: projY + projSz.h,
        apexZ: projZ - projSz.d / 2, // front edge
      };
    } else {
      return {
        apexX: projX,
        apexY: projY, // lens height
        apexZ: projZ - projSz.d / 2, // front face of the body
      };
    }
  }, [projector.type, projX, projY, projZ, projSz]);

  // Projection Frustum Geometry (Pyramid starting from lens/apex)
  const projectionGeometry = useMemo(() => {
    const vertices = new Float32Array([
      // 0: Apex (Projector Lens / Emission Point)
      apexX, apexY, apexZ,
      
      // Screen Face Corners
      -screenW / 2, screenY + screenH / 2, 0.05, // 1: Top Left
      screenW / 2, screenY + screenH / 2, 0.05,  // 2: Top Right
      screenW / 2, screenY - screenH / 2, 0.05,  // 3: Bottom Right
      -screenW / 2, screenY - screenH / 2, 0.05, // 4: Bottom Left
    ]);

    const indices = [
      // Top face
      0, 1, 2,
      // Right face
      0, 2, 3,
      // Bottom face
      0, 3, 4,
      // Left face
      0, 4, 1,
      // Screen face (Base)
      1, 2, 3, 1, 3, 4,
    ];

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    return geometry;
  }, [apexX, apexY, apexZ, screenW, screenH, screenY]);

  // Ray Edges Geometry
  const rayEdgesGeometry = useMemo(() => {
    const points = [
      // Top Left ray
      new THREE.Vector3(apexX, apexY, apexZ), new THREE.Vector3(-screenW / 2, screenY + screenH / 2, 0.05),
      // Top Right ray
      new THREE.Vector3(apexX, apexY, apexZ), new THREE.Vector3(screenW / 2, screenY + screenH / 2, 0.05),
      // Bottom Right ray
      new THREE.Vector3(apexX, apexY, apexZ), new THREE.Vector3(screenW / 2, screenY - screenH / 2, 0.05),
      // Bottom Left ray
      new THREE.Vector3(apexX, apexY, apexZ), new THREE.Vector3(-screenW / 2, screenY - screenH / 2, 0.05),
    ];
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [apexX, apexY, apexZ, screenW, screenH, screenY]);

  return (
    <>
      <ambientLight intensity={isDarkMode ? 0.25 : 0.5} />
      <pointLight position={[0, roomH - 0.5, roomD / 2]} intensity={isDarkMode ? 0.4 : 1} />
      
      {/* Room */}
      <mesh position={[0, roomH / 2, roomD / 2]}>
        <boxGeometry args={[roomW, roomH, roomD]} />
        <meshStandardMaterial color={isDarkMode ? "#121214" : "#f0f0f0"} side={THREE.BackSide} />
      </mesh>
      <gridHelper args={[roomW * 2, 20]} position={[0, 0.01, roomD / 2]} />

      {/* Screen */}
      <mesh position={[0, screenY, 0.05]}>
        <boxGeometry args={[screenW, screenH, 0.02]} />
        <meshStandardMaterial 
          map={activeTexture || undefined}
          color={activeTexture ? "#ffffff" : "#1a1d20"}
          emissiveIntensity={activeTexture ? 0.5 : 0}
          emissiveMap={activeTexture || undefined}
          emissive={activeTexture ? "#ffffff" : "#000000"}
        />
      </mesh>
      
      {/* Projector */}
      <mesh position={[projX, projY, projZ]}>
        {projector.bodyShape === 'cylinder' ? (
          <cylinderGeometry args={[projSz.w / 2, projSz.w / 2, projSz.h, 32]} />
        ) : (
          <boxGeometry args={[projSz.w, projSz.h, projSz.d]} />
        )}
        <meshStandardMaterial color="#10B981" />
      </mesh>

      {/* UST mirror mount — short upright post from the case's top-front edge to the
          elevated light-exit point, so the beam clearly reads as emerging above the case */}
      {projector.type === 'UST' && (
        <mesh position={[apexX, (projY + projSz.h / 2 + apexY) / 2, apexZ]}>
          <cylinderGeometry args={[projSz.h * 0.08, projSz.h * 0.08, apexY - (projY + projSz.h / 2), 12]} />
          <meshStandardMaterial color="#059669" />
        </mesh>
      )}

      {/* Sofa */}
      {showViewer && (
        <group position={[sofaX, 0, sofaZ]}>
          {/* Main Seat */}
          <mesh position={[0, m(400) / 2, 0]}>
            <boxGeometry args={[sofaSz.w, m(400), sofaSz.d]} />
            <meshStandardMaterial color="#DEE2E6" />
          </mesh>
          {/* Backrest */}
          <mesh position={[0, sofaSz.h / 2, sofaSz.d / 2 - m(150) / 2]}>
            <boxGeometry args={[sofaSz.w, sofaSz.h, m(150)]} />
            <meshStandardMaterial color="#CED4DA" />
          </mesh>
          {/* Armrests */}
          <mesh position={[-sofaSz.w / 2 + m(150) / 2, m(550) / 2, 0]}>
            <boxGeometry args={[m(150), m(550), sofaSz.d]} />
            <meshStandardMaterial color="#CED4DA" />
          </mesh>
          <mesh position={[sofaSz.w / 2 - m(150) / 2, m(550) / 2, 0]}>
            <boxGeometry args={[m(150), m(550), sofaSz.d]} />
            <meshStandardMaterial color="#CED4DA" />
          </mesh>

          {/* Viewer (Human Figure) */}
          {(!state.viewerModel || state.viewerModel === 'human') && <ViewerHuman m={m} />}
          {state.viewerModel === 'bear' && <ViewerBear m={m} />}
          {state.viewerModel === 'hero' && <ViewerHero m={m} />}
        </group>
      )}

      {/* Cute Cat in the Corner */}
      <group position={[-roomW / 2 + 0.3, 0, 0.3]} rotation={[0, Math.PI / 4, 0]}>
        <mesh position={[0, 0.1, 0]}>
          <boxGeometry args={[0.2, 0.2, 0.25]} />
          <meshStandardMaterial color="#F59E0B" />
        </mesh>
        <mesh position={[0, 0.25, 0.1]}>
          <boxGeometry args={[0.15, 0.12, 0.15]} />
          <meshStandardMaterial color="#F59E0B" />
        </mesh>
        <mesh position={[-0.05, 0.33, 0.1]}>
          <coneGeometry args={[0.03, 0.08, 4]} />
          <meshStandardMaterial color="#D97706" />
        </mesh>
        <mesh position={[0.05, 0.33, 0.1]}>
          <coneGeometry args={[0.03, 0.08, 4]} />
          <meshStandardMaterial color="#D97706" />
        </mesh>
      </group>

      {/* Projection Region (Light Rays & Volume) */}
      <group>
        <lineSegments geometry={rayEdgesGeometry}>
          <lineBasicMaterial color={isDarkMode ? "#93C5FD" : "#3B82F6"} transparent opacity={isDarkMode ? 0.8 : 0.4} />
        </lineSegments>
        <mesh geometry={projectionGeometry}>
          <meshBasicMaterial color={isDarkMode ? "#60A5FA" : "#3B82F6"} transparent opacity={isDarkMode ? 0.28 : 0.1} side={THREE.DoubleSide} />
        </mesh>
      </group>

      <OrbitControls 
        ref={controlsRef}
        target={[0, roomH / 2, roomD / 2]} 
        makeDefault 
      />
    </>
  );
}

export function Theater3D({ state, onUpdateState, isDarkMode = false }: Theater3DProps) {
  const { room } = state;
  const { lang } = useI18n();
  const m = (mm: number) => mm / 1000;
  const roomD = m(room.depth);
  const roomH = m(room.height);

  return (
    <div className={`w-full h-full relative transition-colors duration-300 ${isDarkMode ? 'bg-[#09090b]' : 'bg-[#1e1e1e]'}`}>
      <Canvas shadows gl={{ antialias: true }}>
        <PerspectiveCamera makeDefault position={[3, 2, roomD + 1]} fov={50} />
        <Scene state={state} onUpdateState={onUpdateState} isDarkMode={isDarkMode} />
        <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />
        <fog attach="fog" args={[isDarkMode ? '#09090b' : '#1e1e1e', 5, 20]} />
      </Canvas>
      <div className="absolute top-4 right-4 flex flex-col gap-2">
         <div className="bg-black/60 backdrop-blur-md border border-white/10 p-3 rounded-lg text-white">
            <div className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1">{lang === 'en' ? '3D Controller' : '3D操作方法'}</div>
            <div className="text-[11px] flex flex-col gap-1">
               <div className="flex justify-between gap-4">
                  <span className="text-white/70">{lang === 'en' ? 'Pan' : '平行移動'}</span>
                  <span className="font-mono">{lang === 'en' ? 'Right Click' : '右クリック'}</span>
               </div>
               <div className="flex justify-between gap-4">
                  <span className="text-white/70">{lang === 'en' ? 'Rotate' : '回転'}</span>
                  <span className="font-mono">{lang === 'en' ? 'Left Click' : '左クリック'}</span>
               </div>
               <div className="flex justify-between gap-4">
                  <span className="text-white/70">{lang === 'en' ? 'Zoom' : 'ズーム'}</span>
                  <span className="font-mono">{lang === 'en' ? 'Scroll' : 'スクロール'}</span>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
