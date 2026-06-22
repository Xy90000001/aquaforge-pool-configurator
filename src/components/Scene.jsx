import { Suspense } from 'react';
import { Sky, ContactShadows } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import PoolModel from './PoolModel';
import WaterSurface from './WaterSurface';
import PatioDeck from './PatioDeck';
import { usePoolConfig } from '../hooks/usePoolConfig';

function Lighting() {
  return (
    <>
      <ambientLight intensity={1.2} color="#c8d8f0" />
      <directionalLight
        position={[18, 22, 10]}
        intensity={8}
        color="#fff8ee"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={80}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
      />
      <directionalLight position={[-8, 5, -6]} intensity={3} color="#b0c8ee" />
      <directionalLight position={[0, 3, -10]} intensity={1.5} color="#d0e0ff" />
      <hemisphereLight
        args={['#88aacc', '#443322', 0.6]}
      />
    </>
  );
}

function UnderwaterLights({ length, width, depth }) {
  const L = length * 0.3048;
  const W = width * 0.3048;
  const D = depth * 0.3048;

  return (
    <>
      <pointLight
        position={[-L * 0.3, -D + 0.4, -W * 0.3]}
        intensity={2.5}
        color="#44ccff"
        distance={D * 2.5}
        decay={2}
      />
      <pointLight
        position={[L * 0.3, -D + 0.4, W * 0.3]}
        intensity={2.5}
        color="#44ccff"
        distance={D * 2.5}
        decay={2}
      />
    </>
  );
}

function PoolLadder({ length, depth }) {
  const L = length * 0.3048;
  const D = depth * 0.3048;

  const railMat = new THREE.MeshStandardMaterial({
    color: '#d0d4d8',
    roughness: 0.25,
    metalness: 0.85,
  });

  return (
    <group>
      {Array.from({ length: 6 }).map((_, i) => {
        const y = -(i + 1) * 0.35;
        if (y < -D + 0.1) return null;
        return (
          <mesh key={i} position={[L / 2 - 1.0, y + 0.1, 1.0]} castShadow>
            <capsuleGeometry args={[0.04, 0.8, 8, 16]} />
            <primitive object={railMat} attach="material" />
          </mesh>
        );
      })}
    </group>
  );
}

function SceneContent() {
  const { dims, shellOption, patioOption, waterOption } = usePoolConfig();

  if (!shellOption || !patioOption || !waterOption) return null;

  return (
    <>
      <Lighting />

      <Sky
        distance={450000}
        sunPosition={[18, 22, 10]}
        inclination={0.55}
        azimuth={0.25}
        turbidity={6}
        rayleigh={3}
      />

      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial color="#8a9a6a" roughness={0.9} />
      </mesh>

      <ContactShadows
        position={[0, -0.01, 0]}
        opacity={0.45}
        scale={30}
        blur={3}
        far={12}
      />

      <PoolModel dims={dims} shellOption={shellOption} />
      <PoolLadder length={dims.pool_length} depth={dims.pool_depth} />
      <UnderwaterLights
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

      {/* Decorative: lounge chairs */}
      <group position={[-(dims.pool_length * 0.3048) / 2 - 2.5, 0.01, 2.5]}>
        <mesh castShadow>
          <boxGeometry args={[2.0, 0.08, 0.7]} />
          <meshStandardMaterial color="#d4c4a8" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.3, -0.4]} castShadow>
          <boxGeometry args={[1.8, 0.06, 0.5]} />
          <meshStandardMaterial color="#d4c4a8" roughness={0.5} />
        </mesh>
      </group>

      <group position={[(dims.pool_length * 0.3048) / 2 + 2.5, 0.01, -2.0]}>
        <mesh castShadow>
          <boxGeometry args={[2.0, 0.08, 0.7]} />
          <meshStandardMaterial color="#c8b898" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.3, -0.4]} castShadow>
          <boxGeometry args={[1.8, 0.06, 0.5]} />
          <meshStandardMaterial color="#c8b898" roughness={0.5} />
        </mesh>
      </group>
    </>
  );
}

export default function Scene() {
  return (
    <Suspense fallback={null}>
      <SceneContent />
      <EffectComposer>
        <Bloom luminanceThreshold={0.8} luminanceSmoothing={0.9} intensity={0.25} radius={0.5} />
        <Vignette darkness={0.3} offset={0.3} />
      </EffectComposer>
    </Suspense>
  );
}
