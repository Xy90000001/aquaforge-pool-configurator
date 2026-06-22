import { useRef, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { Environment, Sky, ContactShadows, Float } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, DepthOfField } from '@react-three/postprocessing';
import * as THREE from 'three';
import PoolModel from './PoolModel';
import WaterSurface from './WaterSurface';
import PatioDeck from './PatioDeck';
import { usePoolConfig } from '../hooks/usePoolConfig';

function SceneLighting() {
  const sunRef = useRef();

  return (
    <>
      <ambientLight intensity={0.4} color="#8899cc" />
      <directionalLight
        ref={sunRef}
        position={[20, 18, 10]}
        intensity={6}
        color="#fff5e8"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={80}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
        shadow-bias={-0.0005}
        shadow-normalBias={0.02}
      />
      <directionalLight position={[-8, 4, -6]} intensity={1.8} color="#8899cc" />
      <directionalLight position={[0, 6, -10]} intensity={2} color="#aaccff" />
    </>
  );
}

function UnderwaterLight({ length, width, depth }) {
  const L = length * 0.3048;
  const W = width * 0.3048;
  const D = depth * 0.3048;
  const halfL = L / 2 - 0.5;
  const halfW = W / 2 - 0.5;

  return (
    <>
      <pointLight
        position={[-halfL * 0.5, -D + 0.3, -halfW * 0.5]}
        intensity={2}
        color="#44ccff"
        distance={D * 2}
        decay={2}
      />
      <pointLight
        position={[halfL * 0.5, -D + 0.3, halfW * 0.5]}
        intensity={2}
        color="#44ccff"
        distance={D * 2}
        decay={2}
      />
      <pointLight
        position={[-halfL * 0.5, -D + 0.3, halfW * 0.5]}
        intensity={1.5}
        color="#44aaff"
        distance={D * 2}
        decay={2}
      />
      <pointLight
        position={[halfL * 0.5, -D + 0.3, -halfW * 0.5]}
        intensity={1.5}
        color="#44aaff"
        distance={D * 2}
        decay={2}
      />
    </>
  );
}

function PoolLadder({ length, depth }) {
  const L = length * 0.3048;
  const D = depth * 0.3048;
  const ladderMat = new THREE.MeshStandardMaterial({
    color: '#c0c4c8',
    roughness: 0.25,
    metalness: 0.85,
  });

  const rails = [];
  for (let i = 0; i < 5; i++) {
    const y = -(i + 1) * 0.35;
    if (y < -D) break;
    rails.push(
      <mesh key={i} position={[L / 2 - 0.8, y + 0.05, 1.2]} castShadow>
        <capsuleGeometry args={[0.04, 0.8, 8, 16]} />
        <primitive object={ladderMat} attach="material" />
      </mesh>
    );
  }

  return <group>{rails}</group>;
}

function SceneContent() {
  const { dims, shellOption, patioOption, waterOption } = usePoolConfig();

  if (!shellOption || !patioOption || !waterOption) return null;

  return (
    <>
      <SceneLighting />

      <Sky
        distance={450000}
        sunPosition={[20, 18, 10]}
        inclination={0.6}
        azimuth={0.25}
        turbidity={8}
        rayleigh={2}
      />

      <Environment
        preset="sunset"
        background={false}
        environmentIntensity={0.4}
      />

      <PoolModel dims={dims} shellOption={shellOption} />
      <PoolLadder length={dims.pool_length} depth={dims.pool_depth} />
      <UnderwaterLight
        length={dims.pool_length}
        width={dims.pool_width}
        depth={dims.pool_depth}
      />
      <WaterSurface
        length={dims.pool_length}
        width={dims.pool_width}
        depth={dims.pool_depth}
        option={waterOption}
      />
      <PatioDeck
        length={dims.pool_length}
        width={dims.pool_width}
        option={patioOption}
      />

      <ContactShadows
        position={[0, -0.01, 0]}
        opacity={0.5}
        scale={30}
        blur={2.5}
        far={10}
      />

      {/* Decorative elements */}
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
        <mesh position={[length * 0.3048 / 2 + 4, 0.15, 2]} castShadow>
          <sphereGeometry args={[0.5, 32, 32]} />
          <meshStandardMaterial color="#8bbf8a" roughness={0.7} />
        </mesh>
      </Float>

      <mesh position={[-(length * 0.3048 / 2) - 3, 0.15, -2]} receiveShadow castShadow>
        <cylinderGeometry args={[0.3, 0.4, 1.2, 32]} />
        <meshStandardMaterial color="#c4a882" roughness={0.5} />
      </mesh>
    </>
  );
}

export default function Scene() {
  return (
    <Suspense fallback={null}>
      <SceneContent />
      <EffectComposer>
        <Bloom
          luminanceThreshold={0.85}
          luminanceSmoothing={0.9}
          intensity={0.3}
          radius={0.5}
        />
        <Vignette darkness={0.4} offset={0.3} />
      </EffectComposer>
    </Suspense>
  );
}
