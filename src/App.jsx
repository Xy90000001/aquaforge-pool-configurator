import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Suspense, useEffect, useState, useCallback } from 'react';
import Scene from './components/Scene';
import Sidebar from './components/Sidebar';
import SummaryBar from './components/SummaryBar';
import { usePoolConfig } from './hooks/usePoolConfig';

function LoadingOverlay() {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 1200);
    return () => clearTimeout(t);
  }, []);
  if (!visible) return null;
  return (
    <div className="loading-overlay">
      <div className="loading-ring" />
      <div className="loading-text">Initializing Configurator</div>
    </div>
  );
}

function PoolDims() {
  const { dims } = usePoolConfig();
  return <span>{dims.pool_length}′ × {dims.pool_width}′ × {dims.pool_depth}′</span>;
}

function Canvas3D() {
  const { selectOption } = usePoolConfig();

  const handleKeyDown = useCallback(
    (e) => {
      const map = {
        '1': ['section_pool_shell', 'opt_concrete_shotcrete'],
        '2': ['section_pool_shell', 'opt_vinyl_liner'],
        '3': ['section_patio_hardscape', 'opt_concrete_pavers'],
        '4': ['section_patio_hardscape', 'opt_honed_travertine'],
        '5': ['section_water_profile', 'opt_water_caribbean_cyan'],
        '6': ['section_water_profile', 'opt_water_midnight_sapphire'],
      };
      const action = map[e.key];
      if (action) selectOption(...action);
    },
    [selectOption]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const cameraTarget = [0, -1.2, 0];

  return (
    <div className="canvas-container">
      <div className="viewport-overlay">
        <div className="viewport-badge">
          <span className="live-dot" />
          WebGL Live
        </div>
        <div className="viewport-badge dim-badge">
          <PoolDims />
        </div>
      </div>

      <Canvas
        shadows
        camera={{
          position: [20, 12, 20],
          fov: 40,
          near: 0.3,
          far: 150,
        }}
        gl={{
          antialias: true,
          toneMapping: 3,
          toneMappingExposure: 1.0,
          outputColorSpace: 'srgb',
        }}
      >
        <Suspense fallback={null}>
          <Scene />
          <OrbitControls
            target={cameraTarget}
            minDistance={5}
            maxDistance={50}
            maxPolarAngle={Math.PI * 0.48}
            minPolarAngle={0.15}
            enableDamping
            dampingFactor={0.08}
            autoRotate
            autoRotateSpeed={0.25}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}

export default function App() {
  return (
    <>
      <LoadingOverlay />
      <div className="app-layout">
        <Sidebar />
        <Canvas3D />
        <SummaryBar />
      </div>
    </>
  );
}
