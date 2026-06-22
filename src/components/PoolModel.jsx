import { useMemo } from 'react';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { getMaterial } from '../textures/generateTextures';

/**
 * PoolModel — properly aligned sunken pool geometry.
 * Ground level = y=0. Pool cavity goes down (negative Y).
 * Walls, floor, coping, steps, waterline — all built from clean box geometry.
 */
export default function PoolModel({ dims, shellOption }) {
  // Convert feet → meters
  const L = dims.pool_length * 0.3048;
  const W = dims.pool_width * 0.3048;
  const D = dims.pool_depth * 0.3048;
  const wallT = 0.3; // wall thickness
  const floorT = 0.2; // floor thickness

  const shellMat = useMemo(() => getMaterial(shellOption, 1024), [shellOption]);

  const copingMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#e8e2db',
        roughness: 0.3,
        metalness: 0.03,
      }),
    []
  );

  const waterlineMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#1a3555',
        roughness: 0.18,
        metalness: 0.08,
      }),
    []
  );

  const stepMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#ece6e0',
        roughness: 0.45,
        metalness: 0.0,
      }),
    []
  );

  // ============================================================
  // FLOOR — sits at the bottom of the pool cavity
  // ============================================================
  const floorGeo = useMemo(
    () => new THREE.BoxGeometry(L, floorT, W),
    [L, W]
  );

  // ============================================================
  // WALLS — four sides going from y=0 down to y=-D
  // ============================================================
  const wallGeoLong = useMemo(
    () => new THREE.BoxGeometry(L, D, wallT),
    [L, D]
  );
  const wallGeoShort = useMemo(
    () => new THREE.BoxGeometry(wallT, D, W),
    [W, D]
  );

  // ============================================================
  // COPING — flat ring sitting at y=0.06 (slightly proud of ground)
  // ============================================================
  const copingData = useMemo(() => {
    const overhang = 0.25;
    const copingW = 0.5;
    const copingH = 0.08;
    const outerL = L + wallT * 2 + overhang * 2;
    const outerW = W + wallT * 2 + overhang * 2;

    // Four coping pieces forming a frame
    return [
      // Front long
      { size: [outerL, copingH, copingW], pos: [0, copingH / 2, W / 2 + wallT / 2 + overhang - copingW / 2] },
      // Back long
      { size: [outerL, copingH, copingW], pos: [0, copingH / 2, -(W / 2 + wallT / 2 + overhang - copingW / 2)] },
      // Left short
      { size: [copingW, copingH, outerW - copingW * 2], pos: [-(L / 2 + wallT / 2 + overhang - copingW / 2), copingH / 2, 0] },
      // Right short
      { size: [copingW, copingH, outerW - copingW * 2], pos: [L / 2 + wallT / 2 + overhang - copingW / 2, copingH / 2, 0] },
    ];
  }, [L, W, wallT]);

  // ============================================================
  // STEPS — descending into the pool from one end
  // ============================================================
  const stepsData = useMemo(() => {
    const numSteps = 4;
    const stepW = 2.8;
    const stepD = 1.0;
    const stepH = D / numSteps;
    const steps = [];
    for (let i = 0; i < numSteps; i++) {
      steps.push({
        size: [stepW, stepH, stepD],
        pos: [0, -(i + 1) * stepH + stepH / 2, W / 2 - 0.2 - i * stepD + stepD / 2],
      });
    }
    return steps;
  }, [W, D]);

  return (
    <group>
      {/* === POOL SHELL (walls + floor) === */}
      {/* Floor */}
      <mesh
        geometry={floorGeo}
        material={shellMat}
        position={[0, -(D + floorT / 2), 0]}
        receiveShadow
      />

      {/* Long walls (front & back) */}
      <mesh
        geometry={wallGeoLong}
        material={shellMat}
        position={[0, -D / 2, W / 2 + wallT / 2]}
        receiveShadow
        castShadow
      />
      <mesh
        geometry={wallGeoLong}
        material={shellMat}
        position={[0, -D / 2, -(W / 2 + wallT / 2)]}
        receiveShadow
        castShadow
      />

      {/* Short walls (left & right) */}
      <mesh
        geometry={wallGeoShort}
        material={shellMat}
        position={[-(L / 2 + wallT / 2), -D / 2, 0]}
        receiveShadow
        castShadow
      />
      <mesh
        geometry={wallGeoShort}
        material={shellMat}
        position={[L / 2 + wallT / 2, -D / 2, 0]}
        receiveShadow
        castShadow
      />

      {/* === WATERLINE TILES === */}
      {[-1, 1].map((sign) => (
        <mesh
          key={`wl-z-${sign}`}
          position={[0, -D + 0.45, sign * (W / 2 + wallT / 2 - 0.01)]}
          material={waterlineMat}
        >
          <boxGeometry args={[L - 0.02, 0.15, 0.03]} />
        </mesh>
      ))}
      {[-1, 1].map((sign) => (
        <mesh
          key={`wl-x-${sign}`}
          position={[sign * (L / 2 + wallT / 2 - 0.01), -D + 0.45, 0]}
          material={waterlineMat}
        >
          <boxGeometry args={[0.03, 0.15, W - 0.02]} />
        </mesh>
      ))}

      {/* === COPING RING === */}
      {copingData.map((piece, i) => (
        <mesh
          key={`coping-${i}`}
          position={piece.pos}
          material={copingMat}
          castShadow
        >
          <boxGeometry args={piece.size} />
        </mesh>
      ))}

      {/* === POOL STEPS === */}
      {stepsData.map((step, i) => (
        <mesh
          key={`step-${i}`}
          position={step.pos}
          material={stepMat}
          castShadow
          receiveShadow
        >
          <boxGeometry args={step.size} />
        </mesh>
      ))}

      {/* === BAJA SHELF (shallow sitting ledge) === */}
      <mesh
        position={[-(L / 2 - 1.5), -(D * 0.35), 0]}
        material={stepMat}
        castShadow
        receiveShadow
      >
        <boxGeometry args={2.5, D * 0.35, W * 0.5} />
      </mesh>
    </group>
  );
}
