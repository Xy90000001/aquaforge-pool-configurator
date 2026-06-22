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
      <div className="loading-text">INITIALIZING CONFIGURATOR</div>
    </div>
  );
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
        camera={{ position: [16, 10, 18], fov: 42, near: 0.5, far: 150 }}
        gl={{
          antialias: true,
          toneMapping: 3, // ACESFilmic
          toneMappingExposure: 1.1,
          outputColorSpace: 'srgb',
        }}
      >
        <Suspense fallback={null}>
          <Scene />
          <OrbitControls
            target={[0, -1.5, 0]}
            minDistance={6}
            maxDistance={45}
            maxPolarAngle={Math.PI * 0.5}
            minPolarAngle={0.2}
            enableDamping
            dampingFactor={0.08}
            autoRotate
            autoRotateSpeed={0.3}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}

function PoolDims() {
  const { dims } = usePoolConfig();
  return (
    <span>
      {dims.pool_length}′ × {dims.pool_width}′ × {dims.pool_depth}′
    </span>
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
